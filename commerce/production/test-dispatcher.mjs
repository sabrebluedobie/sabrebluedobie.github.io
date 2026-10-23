import dispatcher from './dispatcher.mjs';
// No scheduled delivery until the separately approved single test run.
export default {
  async scheduled(controller,env,ctx) {
    if(env.WORKBOOK_DISPATCH_ENABLED!=='true')return;
    let config;
    try {config=JSON.parse(env.WORKBOOK_CONFIG??'null');}catch{return;}
    if(config?.mode!=='test'||env.WORKBOOK_PURCHASES_ENABLED==='true')return;
    return dispatcher.scheduled(controller,env,ctx);
  },
  async fetch(){return new Response('Not found',{status:404});}
};
