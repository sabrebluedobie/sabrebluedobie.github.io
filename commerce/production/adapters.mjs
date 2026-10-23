import { emailValid } from './core.mjs';
import { exclusiveTaxTotal } from './tax.mjs';
// Client is the pinned official SDK instance; this adapter exposes reads only.
export function canonicalReader(client,c) {
  const live=c.mode==='live';
  return {async read(id) {
    if(typeof id!=='string'||!(live?/^cs_live_[A-Za-z0-9]+$/:/^cs_test_[A-Za-z0-9]+$/).test(id))throw Error('SESSION_REJECTED');
    if((await client.accounts.retrieve()).id!==c.account)throw Error('ACCOUNT_REJECTED');
    const s=await client.checkout.sessions.retrieve(id,{expand:['line_items']});
    const lines=s.line_items?.data;
    if(s.id!==id||s.livemode!==live||s.mode!=='payment'||s.currency!==c.currency||s.amount_subtotal!==c.amount||
      s.metadata?.sku!==c.sku||s.line_items?.has_more!==false||!Array.isArray(lines)||lines.length!==1||lines[0].quantity!==1||
      lines[0].price?.id!==c.price||lines[0].price?.product!==c.product||lines[0].price?.livemode!==live)throw Error('SESSION_REJECTED');
    if(s.payment_status!=='paid'||s.status!=='complete')return {id,paid:false};
    const total = exclusiveTaxTotal(s,c);
    if(!/^pi_[A-Za-z0-9]+$/.test(s.payment_intent??''))throw Error('PAYMENT_REJECTED');
    const p=await client.paymentIntents.retrieve(s.payment_intent);
    if(p.id!==s.payment_intent||p.livemode!==live||p.status!=='succeeded'||p.currency!==c.currency||p.amount!==total||p.amount_received!==total||
      !/^ch_[A-Za-z0-9]+$/.test(p.latest_charge??''))throw Error('PAYMENT_REJECTED');
    const ch=await client.charges.retrieve(p.latest_charge);
    if(ch.id!==p.latest_charge||ch.payment_intent!==p.id||ch.livemode!==live||ch.currency!==c.currency||ch.amount!==total||
      ch.paid!==true||ch.captured!==true||ch.status!=='succeeded'||typeof ch.refunded!=='boolean'||typeof ch.disputed!=='boolean'||
      !Number.isSafeInteger(ch.amount_refunded)||ch.amount_refunded<0||ch.amount_refunded>total)throw Error('CHARGE_REJECTED');
    const recipient=s.customer_details?.email;
    if(c.mode==='live'&&!emailValid(recipient))throw Error('RECIPIENT_REJECTED');
    return {id,payment:p.id,paid:true,recipient,blocked:ch.refunded||ch.disputed||ch.amount_refunded>0};
  }};
}
export function privatePDF(bucket) {return {async read(key,size) {
  const object=await bucket.get(key);
  if(!object||object.size!==size)throw Error('FILE_REJECTED');
  return new Uint8Array(await object.arrayBuffer());
}};}
export function sender(key,fetchImpl=fetch) {return {async send(message,idempotencyKey) {
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try {
    const r=await fetchImpl('https://api.resend.com/emails',{method:'POST',redirect:'error',signal:controller.signal,
      headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':idempotencyKey},body:JSON.stringify(message)});
    if(!r.ok)throw Error('SEND_UNCERTAIN');
    const body=await r.json();
    if(typeof body.id!=='string'||!/^[A-Za-z0-9-]{1,100}$/.test(body.id))throw Error('SEND_UNCERTAIN');
    return body.id;
  } catch {throw Error('SEND_UNCERTAIN');} finally {clearTimeout(timer);}
}};}
