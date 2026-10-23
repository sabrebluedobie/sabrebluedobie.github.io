import { pageRequest } from './runtime.mjs';
// Dedicated TEST deployment; never attach this entrypoint to the live site.
export default {
  async fetch(request,env) {
    let config;
    try { config=JSON.parse(env.WORKBOOK_CONFIG??'null'); } catch {}
    if(config?.mode!=='test')return new Response('TEST configuration required',{status:503,headers:{'Cache-Control':'no-store'}});
    return pageRequest({request,env});
  }
};
