import { configuration, sha } from './core.mjs';
import { checkoutParameters } from './checkout.mjs';

// A durable attempt is claimed BEFORE any Stripe request. An unknown outcome is
// never recreated automatically, including after process restart.
export function checkoutService({config, client, store, enabled=false, clock=Date.now}) {
  const c=configuration(config);
  return {async create(attempt) {
    if(!enabled)throw Error('PURCHASES_DISABLED');
    if(typeof attempt!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(attempt))throw Error('INVALID_ATTEMPT');
    const fingerprint=await sha(JSON.stringify(c));
    const prior=await store.checkoutGet(attempt);
    if(prior) {
      if(prior.config_hash!==fingerprint||prior.state!=='ready'||prior.expires<=clock())throw Error('CHECKOUT_REVIEW_REQUIRED');
      return {url:prior.url};
    }
    if(!await store.checkoutClaim(attempt,fingerprint,clock()))throw Error('CHECKOUT_REVIEW_REQUIRED');
    try {
      if((await client.accounts.retrieve()).id!==c.account)throw Error('ACCOUNT_REJECTED');
      const price=await client.prices.retrieve(c.price);
      if(price.id!==c.price||price.product!==c.product||price.active!==true||price.livemode!==(c.mode==='live')||price.currency!==c.currency||price.unit_amount!==c.amount||price.type!=='one_time'||
        !(price.tax_behavior==='exclusive'||(price.tax_behavior==='unspecified'&&c.exclusiveDefaultVerified===true)))throw Error('PRICE_REJECTED');
      const session=await client.checkout.sessions.create(checkoutParameters(c),{idempotencyKey:`workbook-checkout-v1-${attempt}`});
      const url=new URL(session.url);
      if(url.origin!=='https://checkout.stripe.com'||url.username||url.password||!url.pathname.startsWith('/c/pay/')||
        session.livemode!==(c.mode==='live')||session.mode!=='payment'||session.status!=='open'||session.metadata?.sku!==c.sku||
        !Number.isSafeInteger(session.expires_at)||session.expires_at*1000<=clock())throw Error('CHECKOUT_REJECTED');
      await store.checkoutReady(attempt,session.url,session.expires_at*1000);
      return {url:session.url};
    }catch{
      await store.checkoutReview(attempt);
      throw Error('CHECKOUT_REVIEW_REQUIRED');
    }
  }};
}
