import { hmac, constantEqual } from '../lib/crypto.mjs';
const enc = new TextEncoder();
async function deadline(work) {
  let timer;try{return await Promise.race([Promise.resolve().then(work),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('DEPENDENCY_UNAVAILABLE')),15000);})]);}finally{clearTimeout(timer);}
}
export async function sha(value) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256',typeof value==='string'?enc.encode(value):value))].map(x=>x.toString(16).padStart(2,'0')).join(''); }
export function configuration(c) {
  if (!c || c.enabled !== true || c.policyApproved !== true || !['test','live'].includes(c.mode) ||
      c.ttlSeconds!==259200 || c.maxDownloads!==5 ||
      c.taxMode!=='stripe-exclusive' || (c.exclusiveDefaultVerified!==undefined && typeof c.exclusiveDefaultVerified!=='boolean') ||
      !Number.isSafeInteger(c.amount) || c.amount!==4900 || c.currency!=='usd' || c.sku!=='get-your-business-online' ||
      !/^acct_[A-Za-z0-9]+$/.test(c.account??'') || !/^price_[A-Za-z0-9]+$/.test(c.price??'') || !/^prod_[A-Za-z0-9]+$/.test(c.product??'') ||
      !/^[a-f0-9]{64}$/.test(c.fileHash??'') || !Number.isSafeInteger(c.fileBytes) || c.fileBytes<5 || c.fileBytes>20000000 ||
      typeof c.fileKey!=='string' || !c.fileKey || /(^\/|\.\.|[\r\n])/.test(c.fileKey) ||
      !emailValid(c.from) || !emailValid(c.support) || (c.mode==='test' && !emailValid(c.testRecipient))) throw Error('CONFIGURATION_REQUIRED');
  const u=new URL(c.origin); if(u.protocol!=='https:' || u.origin!==c.origin || u.username || u.password) throw Error('HTTPS_REQUIRED');
  // Tax is added to the fixed $49 base; no promotion or customer download policy is inferred.
  return Object.freeze(Object.fromEntries(['enabled','policyApproved','taxMode','exclusiveDefaultVerified','mode','ttlSeconds','maxDownloads','amount','currency','sku','account','product','price','origin','fileKey','fileHash','fileBytes','from','support','testRecipient'].map(k=>[k,c[k]])));
}
export function emailValid(x) { return typeof x==='string' && x.length<=254 && /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(x); }
export class Fulfillment {
  constructor({config,store,stripe,pdf,email,tokenSecret,clock=Date.now}) {
    this.c=configuration(config);
    if(typeof tokenSecret!=='string'||tokenSecret.length<32)throw Error('TOKEN_CONFIGURATION_REQUIRED');
    Object.assign(this,{store,stripe,pdf,email,tokenSecret,clock});
  }
  fingerprint() { return sha(JSON.stringify(this.c)); }
  token(o) { return hmac(this.tokenSecret,`${o.id}:${o.payment}:${o.config_hash}:${o.expires}`); }
  async webhook(event) {
    if(!event || !/^evt_[A-Za-z0-9_]+$/.test(event.id??'') || event.livemode!==(this.c.mode==='live') ||
      (event.account && event.account!==this.c.account)) throw Error('EVENT_REJECTED');
    const obj=event.data?.object;
    if(['charge.refunded','charge.dispute.created'].includes(event.type)) {
      if(!/^pi_[A-Za-z0-9]+$/.test(obj?.payment_intent??''))throw Error('EVENT_REJECTED');
      // Signed reversal events can arrive before payment events: monotonic tombstone.
      await this.store.block(obj.payment_intent,this.clock(),event);return;
    }
    if(!['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type))return;
    if(obj?.metadata?.sku!==this.c.sku)return; // shared account unrelated purchases are not ours
    const p=await this.stripe.read(obj.id);
    if(!p.paid)return;
    if(p.blocked){await this.store.block(p.payment,this.clock(),event);return;}
    const now=this.clock(),o={id:p.id,payment:p.payment,recipient:this.c.mode==='test'?this.c.testRecipient:p.recipient,
      config_hash:await this.fingerprint(),expires:now+this.c.ttlSeconds*1000,max_downloads:this.c.maxDownloads};
    o.token_hash=await sha(await this.token(o));
    await this.store.enqueue(event,o,now);
  }
  async current(o) {
    if(!o || o.blocked || o.expires<=this.clock() || o.config_hash!==await this.fingerprint() ||
      !constantEqual(o.token_hash,await sha(await this.token(o))))return false;
    const p=await this.stripe.read(o.id); // fails closed on unavailable/malformed provider evidence
    if(p.id!==o.id||p.payment!==o.payment||!p.paid)throw Error('ORDER_REJECTED');
    if(p.blocked){await this.store.block(o.payment,this.clock());return false;}
    return !(await this.store.get(o.id)).blocked;
  }
  async bytes() {
    const bytes=await deadline(()=>this.pdf.read(this.c.fileKey,this.c.fileBytes));
    if(bytes.byteLength!==this.c.fileBytes || await sha(bytes)!==this.c.fileHash ||
      new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw Error('FILE_REJECTED');
    return bytes;
  }
  async dispatch(id) {
    const o=await this.store.get(id);
    if(!o || o.state!=='pending')return 'skipped';
    if(!await this.current(o)){await this.store.park(id);return 'review';}
    await this.bytes(); // exact immutable file verified before claim/send
    const claim=crypto.randomUUID(),claimedAt=this.clock();
    if(!await this.store.claim(id,claim,claimedAt)){await this.store.park(id);return 'skipped';}
    try {
      if(!await this.current(await this.store.get(id)))throw Error('ORDER_REJECTED');
      if(o.expires<=this.clock())throw Error('ORDER_EXPIRED');
      const token=await this.token(o);
      const message={from:this.c.from,to:o.recipient,
        subject:`${this.c.mode==='test'?'[TEST] ':''}Get Your Business Online — download`,
        text:`${this.c.mode==='test'?'TEST PDF only. ':''}Your self-guided workbook download:\n${this.c.origin}/api/workbook/download#${token}\n\nExpires ${new Date(o.expires).toISOString()}; up to ${o.max_downloads} downloads. Support: ${this.c.support}`};
      const idempotencyKey=`workbook-v1-${await sha(id)}`;
      // Last primary atomic check before the external side effect. No await between it and send.
      if(!await this.store.authorizeSend(id,claim,this.clock()))throw Error('CLAIM_UNAVAILABLE');
      const beforeSend=this.clock();
      if(beforeSend>=o.expires||beforeSend>=claimedAt+60000)throw Error('CLAIM_EXPIRED');
      const provider=await this.email.send(message,idempotencyKey);
      if(typeof provider!=='string'||!provider)throw Error('SEND_UNCERTAIN');
      await this.store.finish(id,claim,'accepted',provider,this.clock());return 'accepted';
    } catch {
      // A timeout/crash can occur AFTER provider acceptance. Never requeue automatically.
      await this.store.finish(id,claim,'review',null,this.clock());return 'review';
    }
  }
  async scheduled() {
    await this.store.recover(this.clock());
    const counts={accepted:0,review:0,skipped:0,failed:0};
    for(const row of await this.store.pending(this.clock())) {
      try { counts[await this.dispatch(row.order_id)]++; } catch { await this.store.defer(row.order_id,this.clock()+60000); counts.failed++; }
    }
    return counts; // no email, token, provider body, or customer identifiers in logs
  }
  async download(token) {
    if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token))throw Error('UNAVAILABLE');
    const ref=await this.store.byToken(await sha(token));
    const o=ref?await this.store.get(ref.id):null;
    if(!o||o.downloads>=o.max_downloads||!await this.current(o))throw Error('UNAVAILABLE');
    const bytes=await this.bytes();
    if(!await this.store.consume(o.id,this.clock()))throw Error('UNAVAILABLE');
    return bytes; // quota is consumed even if client disconnects; no automatic refund of quota
  }
}
