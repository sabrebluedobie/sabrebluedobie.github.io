// Existing pinned SDK only. Bundler must include its Worker build; never ship node_modules as static files.
import Stripe from '../runtime/node_modules/stripe/esm/stripe.esm.worker.js';
import { configuration,Fulfillment } from './core.mjs';
import { D1Store } from './store.mjs';
import { canonicalReader,privatePDF,sender } from './adapters.mjs';
import { handler } from './http.mjs';
import { checkoutService } from './checkout-service.mjs';
export function runtime(env) {
  const c=configuration(JSON.parse(env.WORKBOOK_CONFIG??'null'));
  if(env.WORKBOOK_RELEASE_APPROVED!=='true'||!env.WORKBOOK_DB||!env.DOWNLOADS_BUCKET||
    !new RegExp(`^rk_${c.mode}_[A-Za-z0-9]+$`).test(env.WORKBOOK_STRIPE_KEY??'')||
    !/^whsec_/.test(env.WORKBOOK_WEBHOOK_SECRET??'')||!/^re_/.test(env.WORKBOOK_RESEND_KEY??''))throw Error('RELEASE_CONFIGURATION_REQUIRED');
  const client=new Stripe(env.WORKBOOK_STRIPE_KEY,{apiVersion:'2026-09-30.endive',maxNetworkRetries:0,timeout:10000,httpClient:Stripe.createFetchHttpClient()});
  const service=new Fulfillment({config:c,store:new D1Store(env.WORKBOOK_DB),stripe:canonicalReader(client,c),
    pdf:privatePDF(env.DOWNLOADS_BUCKET),email:sender(env.WORKBOOK_RESEND_KEY),tokenSecret:env.WORKBOOK_TOKEN_SECRET});
  const verify=(body,sig)=>client.webhooks.constructEventAsync(body,sig,env.WORKBOOK_WEBHOOK_SECRET,300,Stripe.createSubtleCryptoProvider());
  let checkout=null;
  if(env.WORKBOOK_PURCHASES_ENABLED==='true'){
    if(!new RegExp(`^rk_${c.mode}_[A-Za-z0-9]+$`).test(env.WORKBOOK_CHECKOUT_KEY??''))throw Error('CHECKOUT_CONFIGURATION_REQUIRED');
    const checkoutClient=new Stripe(env.WORKBOOK_CHECKOUT_KEY,{apiVersion:'2026-09-30.endive',maxNetworkRetries:0,timeout:10000,httpClient:Stripe.createFetchHttpClient()});
    checkout=checkoutService({config:c,client:checkoutClient,store:new D1Store(env.WORKBOOK_DB),enabled:true});
  }
  return {service,handle:handler({service,verify,origin:c.origin,checkout,support:c.support})};
}
export async function pageRequest({request,env}) {
  try {return await runtime(env).handle(request);}catch{return new Response('Unavailable',{status:503,headers:{'Cache-Control':'no-store'}});}
}
