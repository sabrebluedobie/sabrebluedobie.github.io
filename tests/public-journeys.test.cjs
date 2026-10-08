// Build with Jekyll first. All requests are mocked; no form data leaves this process.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const tick = () => new Promise(resolve => setImmediate(resolve));
const blocked = async () => { throw Error('Tests prohibit network access'); };
async function page(file, url, scripts = []) {
  const win = new JSDOM(read('_site/' + file), {url: 'https://www.bluedobiedev.com' + url, runScripts:'outside-only', virtualConsole: new VirtualConsole()}).window;
  win.fetch = blocked;
  win.AbortController = AbortController;
  for (const script of scripts) win.eval(read(script));
  await new Promise(resolve => win.document.addEventListener('DOMContentLoaded', resolve, {once:true}));
  return win;
}
const contact = (query='') => page('contact.html', '/contact'+query, ['assets/js/formjs.js']);
function fill(win) {
  for (const [name,value] of Object.entries({'first-name':'Test','last-name':'Visitor',email:'qa@example.invalid',website:'https://example.com','request-type':'Website',summary:'Local test only',message:'Mock submission only.'})) win.document.querySelector(`[name="${name}"]`).value=value;
}
const submit = w => w.document.querySelector('#multiForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));

test('contact validates optional URLs before moving and focuses each new step', async () => {
 const w=await contact(); fill(w);
 assert.equal(w.document.querySelector('fieldset').disabled,false);
 w.document.querySelector('[name=website]').value='not a url';
 w.nextStep(1);
 assert.equal(w.document.activeElement.id,'contact-website');
 assert.equal(w.document.querySelector('#step2').hidden,true);
 w.document.querySelector('[name=website]').value='https://example.com';
 w.nextStep(1);
 assert.equal(w.document.activeElement,w.document.querySelector('#step2 h3'));
 w.prevStep(1);assert.equal(w.document.activeElement,w.document.querySelector('#step1 h3'));
 w.close();
});
test('hidden invalid fields are revealed before validation; whitespace is not accepted', async () => {
 const w=await contact();fill(w);w.nextStep(1);w.nextStep(2);
 assert.equal(w.document.querySelector('#multiForm').noValidate,true);
 w.document.querySelector('[name="first-name"]').value='   ';
 w.document.querySelector('#multiForm').requestSubmit();
 assert.equal(w.document.querySelector('#step1').hidden,false);
 assert.equal(w.document.activeElement.id,'contact-first-name');
 assert.equal(w.document.activeElement.getAttribute('aria-invalid'),'true');
 assert.match(w.document.querySelector('#form-status').textContent,/required/i);
 w.close();
});
test('all Logo Sprint CTAs and audit deep links preserve their requested service', async () => {
 for (const [file,expected] of [['logo-sprint-landing/index.html','Logo Design'],['free-web-audit/index.html','Free Web Audit']]) {
  const d=new JSDOM(read('_site/'+file)).window.document;
  const links=[...d.querySelectorAll('a[href*="/contact?service="]')];assert.ok(links.length);
  for (const link of links) {
   const url=new URL(link.getAttribute('href'),'https://www.bluedobiedev.com');const w=await contact(url.search);
   assert.equal(w.document.querySelector('[name="request-type"]').value,expected);
   assert.equal(w.document.querySelector('#step1').hidden,false);
   assert.equal(w.document.querySelector('#form-preselected').hidden,false);
   if(expected==='Free Web Audit') {assert.equal(w.document.querySelector('[name=website]').required,true);assert.match(w.document.querySelector('label[for=contact-website]').textContent,/required/);}
   if(url.search.includes('-basic')) assert.match(w.document.querySelector('[name=summary]').value,/Basic/);
   if(url.search.includes('-pro')) assert.match(w.document.querySelector('[name=summary]').value,/Pro/);
   w.close();
  }
 }
});
test('one request at a time, busy state, safe payload, and visible success with focus', async () => {
 const w=await contact();fill(w);w.nextStep(1);w.nextStep(2);let calls=0,complete,payload;
 w.fetch=(_,options)=>{calls++;payload=JSON.parse(options.body);return new Promise(resolve=>{complete=resolve});};
 submit(w);submit(w);
 assert.equal(calls,1);assert.equal(w.document.querySelector('fieldset').disabled,true);
 assert.equal(w.document.querySelector('#multiForm').getAttribute('aria-busy'),'true');
 assert.equal(payload.email,'qa@example.invalid');
 complete({ok:true});await tick();
 assert.match(w.document.querySelector('#form-status').textContent,/has been sent/);
 assert.equal(w.document.activeElement.id,'form-status');assert.equal(w.document.querySelector('#step1').hidden,false);
 assert.equal(w.document.querySelector('#multiForm').hasAttribute('aria-busy'),false);
 assert.equal(w.document.querySelector('fieldset').disabled,false);
 assert.equal(w.document.querySelector('[name=email]').value,'');w.close();
});
test('HTTP/network/timeout failures preserve input, restore controls and do not retry automatically', async () => {
 for(const mode of ['http','offline','timeout']) {
  const w=await contact();fill(w);let calls=0;
  if(mode==='timeout') w.setTimeout=fn=>setTimeout(fn,1);
  w.fetch=(_,options)=>{calls++;if(mode==='http')return Promise.resolve({ok:false,status:500});if(mode==='offline')return Promise.reject(Error('offline'));return new Promise((_,reject)=>options.signal.addEventListener('abort',()=>reject(Error('timeout'))));};
  submit(w);await new Promise(resolve=>setTimeout(resolve,15));
  assert.equal(calls,1);assert.match(w.document.querySelector('#form-status').textContent,/could not confirm/);
  assert.equal(w.document.querySelector('[name=email]').value,'qa@example.invalid');
  assert.equal(w.document.querySelector('button[type=submit]').disabled,false);
  assert.equal(w.document.activeElement.id,'form-status');w.close();
 }
});
test('no-JavaScript forms cannot POST accidentally and contact alternatives remain', () => {
 for(const file of ['contact.html','ai-setup-review/index.html']) {
  const d=new JSDOM(read('_site/'+file)).window.document;
  assert.ok(d.querySelector('form fieldset[disabled]'));
  assert.ok(d.querySelector('a[href^="mailto:"]'));
 }
});
async function guide() {
 const w=await page('ai-setup-review/index.html','/ai-setup-review/');
 for(const script of w.document.querySelectorAll('script:not([src]):not([type])')) w.eval(script.textContent);
 w.document.querySelector('#guideName').value='Test';w.document.querySelector('#guideEmail').value='qa@example.invalid';return w;
}
test('guide rejects HTTP errors, offers visible PDF fallback, and coalesces repeated submits', async () => {
 for(const mode of ['success','http','offline','timeout']) {
  const w=await guide();let count=0,resolve;
  if(mode==='timeout') w.setTimeout=fn=>setTimeout(fn,1);
  w.fetch=(_,options)=>{count++;if(mode==='offline')return Promise.reject(Error('offline'));if(mode==='timeout')return new Promise((_,reject)=>options.signal.addEventListener('abort',()=>reject(Error('timeout'))));return new Promise(done=>{resolve=done});};
  const form=w.document.querySelector('#guideForm');
  form.dispatchEvent(new w.Event('submit',{cancelable:true}));form.dispatchEvent(new w.Event('submit',{cancelable:true}));
  assert.equal(count,1);resolve?.({ok:mode==='success'});await new Promise(resolve=>setTimeout(resolve,15));
  assert.equal(w.document.querySelector('#guideDone').hidden,false);
  assert.equal(w.document.activeElement.id,'guideLink');
  assert.match(w.document.querySelector('#guideStatus').textContent,mode==='success'?/accepted/:/could not confirm/);
  assert.equal(form.hasAttribute('aria-busy'),false);w.close();
 }
});
test('main journeys have landmarks, valid metadata and parseable structured data', () => {
 const files=['index.html','services.html','contact.html','free-web-audit/index.html','ai-setup-review/index.html','logo-sprint-landing/index.html','about.html','faq.html','knowledge/index.html','knowledge/small-business-website-cost/index.html'];
 for(const file of files) {
  const d=new JSDOM(read('_site/'+file)).window.document;
  assert.equal(d.querySelectorAll('main').length,1,file);assert.equal(d.querySelectorAll('h1').length,1,file);
  assert.ok(['website','article'].includes(d.querySelector('[property="og:type"]').content),file);
  for(const node of d.querySelectorAll('script[type="application/ld+json"]')) assert.doesNotThrow(()=>JSON.parse(node.textContent),file);
  assert.equal(d.querySelectorAll('[role=menu], [role=menuitem]').length,0,file);
  const skip=d.querySelector('.skip-link');if(skip) assert.ok(d.querySelector(skip.getAttribute('href')),file);
 }
});
test('advertised HTML sitemap URLs are canonical and never marked noindex', () => {
 const files=['sitemap.xml','manual-sitemap.xml'];
 for(const file of files) {
  const d=new JSDOM(read('_site/'+file),{contentType:'text/xml'}).window.document;
  for(const loc of d.querySelectorAll('loc')) {
   const url=new URL(loc.textContent);if(/\.pdf$/.test(url.pathname))continue;
   const rel=url.pathname.replace(/^\//,'');
   const target=[rel,rel+'.html',path.join(rel,'index.html')].find(p=>{try{return fs.statSync(path.join(root,'_site',p)).isFile()}catch{return false}});
   assert.ok(target,loc.textContent);const page=new JSDOM(read('_site/'+target)).window.document;
   assert.ok(!page.querySelector('meta[name=robots]')?.content.includes('noindex'),url.pathname);
   const canonical=page.querySelector('[rel=canonical]');assert.equal(canonical?.href,url.href,url.pathname);
  }
 }
});
test('mobile drawer and disclosures use inert when closed; resize restores a reachable focus target', async () => {
 const w=await page('contact.html','/contact');let resize;const compact={matches:true,addEventListener:(_,fn)=>{resize=fn}};
 w.matchMedia=()=>compact;
 w.eval(read('js/mobile-nav.js'));w.initNavigation();
 const menu=w.document.querySelector('#mainmenu'),button=w.document.querySelector('#menu-button');
 assert.equal(menu.inert,true);assert.equal(button.getAttribute('aria-expanded'),'false');
 button.click();assert.equal(menu.inert,false);assert.equal(w.document.querySelector('main').inert,true);
 const about=w.document.querySelector('#about-toggle');about.click();assert.equal(w.document.querySelector('#about-menu').inert,false);
 w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));assert.equal(w.document.activeElement,about);assert.equal(w.document.querySelector('#about-menu').inert,true);
 w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));assert.equal(menu.inert,true);assert.equal(w.document.activeElement,button);assert.equal(w.document.querySelector('main').inert,false);
 compact.matches=false;resize();assert.equal(menu.inert,false);
 menu.querySelector('a').focus();compact.matches=true;resize();assert.equal(w.document.activeElement,button);assert.equal(menu.inert,true);
 assert.equal(menu.querySelector('a[href="/contact"]').getAttribute('aria-current'),'page');w.close();
});
