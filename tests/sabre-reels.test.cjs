const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalize, readCache, saveCache, loadFeed } = require('../js/sabre-reels.js');
const snapshot = require('../_data/sabre-reels.json');
const post = { code: 'abc_123', link: 'https://www.instagram.com/p/abc_123/', pic_text_raw: 'Hello <script>!', date_time_posted: '2026-10-07T12:00:00Z', image_url: 'https://data-image.sociablekit.com/sources/instagram-reels/sabrethebluedobie/abc_123-thumbnail.webp' };

test('normalizes real saved content, caps length and removes duplicates', () => {
  assert.equal(normalize(snapshot, true).length, 12);
  assert.equal(normalize({ posts: [post, post] }).length, 1);
  assert.equal(normalize({ posts: Array.from({length: 15}, (_, i) => ({...post, code: 'id' + i, link: 'https://www.instagram.com/p/id' + i + '/'})) }).length, 12);
  assert.equal(normalize({ posts: [post] })[0].caption, 'Hello <script>!');
});
test('rejects empty, malformed and unsafe destinations', () => {
  for (const input of [null, {}, {posts: []}, {posts: [null]}, {posts: [{...post, link: 'javascript:alert(1)'}]}, {posts: [{...post, date_time_posted: 'bad'}]}, {posts: [{...post, link: 'https://www.instagram.com.evil.test/p/abc_123/'}]}]) {
    assert.throws(() => normalize(input));
  }
  assert.equal(normalize({posts: [{...post, image_url: 'https://evil.test/tracker'}]})[0].image, '');
});
test('last known good cache survives invalid responses and storage denial', async () => {
  let value;
  const storage = {getItem: () => value, setItem: (_, v) => { value = v; }};
  const posts = normalize(snapshot, true);
  saveCache(storage, posts);
  await assert.rejects(loadFeed(async () => ({ok: true, json: async () => ({posts: []})})));
  assert.deepEqual(readCache(storage), posts);
  assert.equal(readCache({getItem: () => '{broken'}), null);
  assert.equal(readCache(undefined), null);
  assert.doesNotThrow(() => saveCache(undefined, posts));
});
test('fetch omits credentials and rejects HTTP/network/JSON failures', async () => {
  await loadFeed(async (url, options) => {
    assert.equal(url, 'https://data.accentapi.com/feed/25661024.json');
    assert.equal(options.credentials, 'omit');
    return {ok: true, json: async () => ({posts: [post]})};
  });
  for (const fetcher of [async () => ({ok: false}), async () => { throw new Error('offline'); }, async () => ({ok: true, json: async () => { throw new Error('bad JSON'); }})]) {
    await assert.rejects(loadFeed(fetcher));
  }
});
test('rejects missing fields and impossible dates while retaining valid siblings', () => {
  for (const patch of [{code: null}, {link: null}, {pic_text_raw: null}, {date_time_posted: null}, {date_time_posted: '2026-02-30T12:00:00Z'}, {pic_text_raw: 'x'.repeat(10001)}]) {
    assert.throws(() => normalize({posts: [{...post, ...patch}]}));
    assert.equal(normalize({posts: [{...post, ...patch}, post]}).length, 1);
  }
  assert.match(normalize({posts: [{...post, pic_text_raw: '  '}]})[0].caption, /Sabre/);
});
