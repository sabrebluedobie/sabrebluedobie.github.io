import { runtime } from './runtime.mjs';
export default {
  async scheduled(controller,env,ctx) {
    // Scheduler only. Emit counters, never exceptions, identifiers, addresses or tokens.
    ctx.waitUntil((async()=>{
      try {console.info(JSON.stringify(await runtime(env).service.scheduled()));}
      catch {console.info('WORKBOOK_DISPATCH_UNAVAILABLE');}
    })());
  },
  async fetch(){return new Response('Not found',{status:404});}
};
