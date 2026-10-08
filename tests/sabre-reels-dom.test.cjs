// Run with jsdom available through NODE_PATH (see README).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const { init } = require('../js/sabre-reels.js');
const fixture = {posts: [{code: 'test123', link: 'https://www.instagram.com/reel/test123/', date_time_posted: '2026-10-07T10:00:00Z', pic_text_raw: '<img src=x onerror=alert(1)> caption', image_url: 'https://data-image.sociablekit.com/sources/instagram-reels/sabrethebluedobie/test123.webp'}]};
function page() {
  return new JSDOM('<section data-reels><p data-reels-status></p><ul data-reels-list><li><a href="https://www.instagram.com/sabrethebluedobie/">Saved reel</a></li></ul></section>', {url: 'https://www.bluedobiedev.com/meet-sabre'}).window;
}
test('renders safe text and usable links; failed image leaves the caption', async () => {
  const win = page();
  win.fetch = async () => ({ok: true, json: async () => fixture});
  await init(win.document, win);
  assert.equal(win.document.querySelectorAll('img').length, 1);
  assert.equal(win.document.querySelector('a').href, fixture.posts[0].link);
  assert.match(win.document.querySelector('.reel-caption').textContent, /<img/);
  win.document.querySelector('img').dispatchEvent(new win.Event('error'));
  assert.equal(win.document.querySelectorAll('img').length, 0);
  assert.ok(win.document.querySelector('a'));
  win.close();
});
test('HTTP, offline, malformed, empty, and aborted updates preserve server-rendered posts', async () => {
  for (const fetcher of [async () => ({ok: false}), async () => {throw Error('offline')}, async () => ({ok: true, json: async () => ({})}), async () => ({ok: true, json: async () => ({posts: []})}), async (_, {signal}) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(Error('timeout'))))]) {
    const win = page();
    const original = win.document.querySelector('a');
    win.fetch = fetcher;
    // Exercise the actual timeout branch without waiting eight seconds.
    win.setTimeout = callback => setTimeout(callback, 1);
    await init(win.document, win);
    assert.equal(win.document.querySelector('a'), original);
    assert.match(win.document.querySelector('[data-reels-status]').textContent, /temporarily unavailable/);
    win.close();
  }
});
test('updates never remove the focused link; successful data is cached for next visit', async () => {
  const win = page();
  const original = win.document.querySelector('a');
  original.focus();
  win.fetch = async () => ({ok: true, json: async () => fixture});
  await init(win.document, win);
  assert.equal(win.document.activeElement, original);
  // A delayed script must not replace already-focused server HTML with cache either.
  await init(win.document, win);
  assert.equal(win.document.activeElement, original);
  assert.match(win.localStorage.getItem('sabre-reels-v1'), /test123/);
  assert.match(win.document.querySelector('[data-reels-status]').textContent, /Reload/);
  win.close();
});
test('cached posts remain on failure and denied storage does not stop a live update', async () => {
  const win = page();
  win.fetch = async () => ({ok: true, json: async () => fixture});
  await init(win.document, win);
  win.fetch = async () => {throw Error('offline')};
  await init(win.document, win);
  assert.equal(win.document.querySelector('a').href, fixture.posts[0].link);
  Object.defineProperty(win, 'localStorage', {get() {throw Error('blocked')}});
  win.fetch = async () => ({ok: true, json: async () => fixture});
  await init(win.document, win);
  assert.equal(win.document.querySelector('a').href, fixture.posts[0].link);
  win.close();
});
test('coalesces overlapping refreshes, allows subsequent refresh, keeps one grid', async () => {
  const win = page();
  let resolve, calls = 0;
  win.fetch = () => { calls++; return new Promise(done => {resolve = done}); };
  const first = init(win.document, win);
  const second = init(win.document, win);
  assert.equal(first, second);
  assert.equal(calls, 1);
  resolve({ok: true, json: async () => fixture});
  await Promise.all([first, second]);
  win.fetch = async () => { calls++; return {ok: true, json: async () => fixture}; };
  await init(win.document, win);
  assert.equal(calls, 2);
  assert.equal(win.document.querySelectorAll('.reel-card').length, 1);
  win.close();
});
test('focus moved into feed during pending network request survives completion', async () => {
  const win = page();
  let resolve;
  win.fetch = () => new Promise(done => {resolve = done});
  const task = init(win.document, win);
  const link = win.document.querySelector('a');
  link.focus();
  resolve({ok: true, json: async () => fixture});
  await task;
  assert.equal(win.document.activeElement, link);
  assert.equal(link.isConnected, true);
  win.close();
});
test('corrupt cache and quota errors preserve usable live posts', async () => {
  const win = page();
  Object.defineProperty(win, 'localStorage', {value: {getItem: () => '{bad', setItem: () => {throw Error('quota')}}});
  win.fetch = async () => ({ok: true, json: async () => fixture});
  await init(win.document, win);
  assert.equal(win.document.querySelector('a').href, fixture.posts[0].link);
  win.close();
});
test('missing optional image and incomplete markup fail safely', async () => {
  const win = page();
  win.fetch = async () => ({ok: true, json: async () => ({posts: [{...fixture.posts[0], image_url: null}]})});
  await init(win.document, win);
  assert.equal(win.document.querySelectorAll('img').length, 0);
  assert.ok(win.document.querySelector('a'));
  win.document.querySelector('[data-reels-list]').remove();
  await assert.doesNotReject(init(win.document, win));
  win.close();
});
