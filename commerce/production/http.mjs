const headers={'Cache-Control':'no-store, no-transform','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff',
  'X-Robots-Tag':'noindex, nofollow','Content-Security-Policy':"default-src 'none'; script-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"};
const page='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="referrer" content="no-referrer"><title>Workbook download</title><h1>Workbook download</h1><button id="download" disabled>Download PDF</button><p id="status">Checking link…</p><script src="/api/workbook/download.js" defer></script></html>';
const js=`const token=location.hash.slice(1);history.replaceState(null,'',location.pathname);const b=document.getElementById('download'),s=document.getElementById('status');b.disabled=!/^[a-f0-9]{64}$/.test(token);s.textContent=b.disabled?'Link unavailable.':'Ready to download.';b.onclick=async()=>{b.disabled=true;try{const r=await fetch('/api/workbook/download',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token}),cache:'no-store',redirect:'error'});if(!r.ok)throw Error();const blob=await r.blob(),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='Get-Your-Business-Online.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(u),60000);s.textContent='Download started.';}catch{s.textContent='Download unavailable. Contact support; do not repeatedly retry.'}};`;
async function bounded(request,limit) {
  if(Number(request.headers.get('content-length'))>limit)throw Error('TOO_LARGE');
  const reader=request.body?.getReader(); if(!reader)return '';
  let size=0;const parts=[];
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw Error('TOO_LARGE');}parts.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.length;}
  return new TextDecoder('utf-8',{fatal:true}).decode(bytes);
}
export function handler({service,verify,origin,checkout=null,support}) {
  const response=(body,status=200,type='text/plain')=>new Response(body,{status,headers:{...headers,'Content-Type':type}});
  const supportLink=()=>`<a href="mailto:${encodeURIComponent(support??'')}?subject=Workbook%20replacement%20link%20request">Request a replacement link</a>`;
  const supportPage=()=>`<!doctype html><html lang="en"><meta charset="utf-8"><title>Workbook support</title><h1>Request a replacement link</h1><p>Email support from your purchase email address. Include your receipt reference, but never your download link, card details or password. Requests are reviewed before any replacement is issued.</p>${supportLink()}</html>`;
  const buyPage='<!doctype html><html lang="en"><meta charset="utf-8"><title>Workbook checkout</title><h1>Get Your Business Online</h1><p>Self-guided workbook, $49 plus applicable tax. Not personalized setup assistance. Download access lasts 72 hours, up to five downloads.</p><button id="buy">Continue to secure checkout</button><p id="status"></p><a href="/api/workbook/support">Request a replacement link</a><script src="/api/workbook/checkout.js" defer></script></html>';
  const buyJS=`const b=document.getElementById('buy'),s=document.getElementById('status');b.onclick=async()=>{b.disabled=true;try{let id=sessionStorage.getItem('workbook-attempt');if(!id){id=crypto.randomUUID();sessionStorage.setItem('workbook-attempt',id);}const r=await fetch('/api/workbook/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({attempt:id}),redirect:'error',cache:'no-store'});if(!r.ok)throw Error();const data=await r.json(),u=new URL(data.url);if(u.origin!=='https://checkout.stripe.com')throw Error();location.assign(u.href);}catch{s.textContent='Checkout unavailable. Contact support before trying again.'}};`;
  return async request=>{
    const u=new URL(request.url);
    if(u.origin!==origin)return response('Unavailable',404);
    if(request.method==='GET'&&u.pathname==='/api/workbook/support')return response(supportPage(),200,'text/html; charset=utf-8');
    if(request.method==='GET'&&['/api/workbook/success','/api/workbook/cancel'].includes(u.pathname))return response(`<!doctype html><html lang="en"><meta charset="utf-8"><title>Checkout ended</title><h1>Checkout ended</h1><p>Payment status is verified separately. This page does not confirm payment or delivery. If payment is verified, your download email will follow.</p><a href="/api/workbook/support">Contact workbook support</a></html>`,200,'text/html; charset=utf-8');
    if(request.method==='GET'&&u.pathname==='/api/workbook/buy')return checkout?response(buyPage,200,'text/html; charset=utf-8'):response('Purchases are not open.',503);
    if(request.method==='GET'&&u.pathname==='/api/workbook/checkout.js')return response(buyJS,200,'text/javascript; charset=utf-8');
    if(request.method==='POST'&&u.pathname==='/api/workbook/checkout'){
      if(!checkout)return response('Purchases are not open.',503);
      if(request.headers.get('origin')!==origin||request.headers.get('content-type')!=='application/json')return response('Unavailable',403);
      try{const body=JSON.parse(await bounded(request,256));if(!body||Object.keys(body).length!==1)throw Error();return response(JSON.stringify(await checkout.create(body.attempt)),200,'application/json');}
      catch{return response('Checkout unavailable. Contact support before trying again.',503);}
    }
    if(request.method==='GET'&&u.pathname==='/api/workbook/download')return response(page.replace('</html>','<p><a href="/api/workbook/support">Request a replacement link</a></p></html>'),200,'text/html; charset=utf-8');
    if(request.method==='GET'&&u.pathname==='/api/workbook/download.js')return response(js,200,'text/javascript; charset=utf-8');
    if(request.method==='POST'&&u.pathname==='/api/workbook/webhook') {
      let event;
      try{event=await verify(await bounded(request,65536),request.headers.get('stripe-signature'));}catch{return response('Invalid event',400);}
      try{await service.webhook(event);return response('Received');}catch{return response('Unavailable',503);}
    }
    if(request.method==='POST'&&u.pathname==='/api/workbook/download') {
      if(request.headers.get('origin')!==origin||request.headers.get('content-type')!=='application/json')return response('Unavailable',403);
      try {
        const body=JSON.parse(await bounded(request,256));
        if(Object.keys(body).length!==1)throw Error();
        const bytes=await service.download(body.token);
        return new Response(bytes,{headers:{...headers,'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="Get-Your-Business-Online.pdf"'}});
      }catch{return response('Download unavailable',404);}
    }
    return response('Unavailable',404); // no public dispatch or automatic reissue route
  };
}
