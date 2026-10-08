/* Public SociableKIT feed; no API keys or account credentials are required. */
(function () {
  'use strict';
  const FEED = 'https://data.accentapi.com/feed/25661024.json';
  const CACHE = 'sabre-reels-v1';
  const LIMIT = 12;
  const pending = new WeakMap();

  function normalize(data, cached = false) {
    if (!data || !Array.isArray(data.posts)) throw new Error('Invalid feed');
    const seen = new Set();
    const posts = data.posts.slice(0, 200).flatMap(post => {
      if (!post || typeof post !== 'object') return [];
      const id = cached ? post.id : post.code;
      const url = cached ? post.url : post.link;
      const caption = cached ? post.caption : post.pic_text_raw;
      const date = cached ? post.date : post.date_time_posted;
      const image = cached ? post.image : post.image_url;
      if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(id) || seen.has(id)) return [];
      if (typeof url !== 'string' || !new RegExp('^https://www\\.instagram\\.com/(sabrethebluedobie/)?(p|reel)/' + id + '/?$').test(url)) return [];
      if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(date) || !Number.isFinite(Date.parse(date))) return [];
      const calendarDay = new Date(date.slice(0, 10) + 'T12:00:00Z');
      if (!Number.isFinite(calendarDay.getTime()) || calendarDay.toISOString().slice(0, 10) !== date.slice(0, 10)) return [];
      if (typeof caption !== 'string' || caption.length > 10000) return [];
      // Only the provider's public image cache is used, never arbitrary feed URLs.
      const safeImage = typeof image === 'string' && /^https:\/\/data-image\.sociablekit\.com\/sources\/instagram-reels\/sabrethebluedobie\/[A-Za-z0-9_.?=&-]+$/.test(image) ? image : '';
      seen.add(id);
      return [{ id, url, caption: caption.trim() || 'Sabre’s Instagram reel', date, image: safeImage }];
    }).slice(0, LIMIT);
    if (!posts.length) throw new Error('Empty feed');
    return posts;
  }

  function readCache(storage) {
    try { return normalize(JSON.parse(storage.getItem(CACHE)), true); }
    catch (_) { return null; }
  }

  function saveCache(storage, posts) {
    try { storage.setItem(CACHE, JSON.stringify({ posts })); } catch (_) { /* Storage is optional. */ }
  }

  async function loadFeed(fetcher, signal) {
    const response = await fetcher(FEED, { signal, credentials: 'omit', cache: 'no-cache' });
    if (!response.ok) throw new Error('Feed unavailable');
    return normalize(await response.json());
  }

  function render(doc, list, posts) {
    const fragment = doc.createDocumentFragment();
    for (const post of posts) {
      const card = doc.createElement('li');
      card.className = 'reel-card';
      if (post.image) {
        const img = doc.createElement('img');
        img.src = post.image;
        img.alt = ''; // The adjacent caption identifies the link; no invented image description.
        img.loading = 'lazy';
        img.width = img.height = 480;
        img.addEventListener('error', () => img.remove(), { once: true });
        card.append(img);
      }
      const copy = doc.createElement('div');
      copy.className = 'reel-copy';
      const heading = doc.createElement('h4');
      const link = doc.createElement('a');
      link.href = post.url;
      link.textContent = 'Watch reel on Instagram';
      const context = doc.createElement('span');
      context.className = 'reel-link-context';
      context.textContent = ': ' + post.caption.slice(0, 100) + ' (' + post.date.slice(0, 10) + ')';
      link.append(context);
      heading.append(link);
      const time = doc.createElement('time');
      time.dateTime = post.date.slice(0, 10);
      time.textContent = new Date(time.dateTime + 'T12:00:00Z').toLocaleDateString('en-CA', {
        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
      });
      const caption = doc.createElement('p');
      caption.className = 'reel-caption';
      caption.textContent = post.caption;
      copy.append(heading, time, caption);
      card.append(copy);
      fragment.append(card);
    }
    list.replaceChildren(fragment);
  }

  async function refresh(doc, win) {
    const root = doc.querySelector('[data-reels]');
    if (!root) return;
    const list = root.querySelector('[data-reels-list]');
    const status = root.querySelector('[data-reels-status]');
    if (!list || !status) return;
    // Broken thumbnails must not remove the caption or destination.
    list.querySelectorAll('img').forEach(img => {
      img.addEventListener('error', () => img.remove(), { once: true });
      if (img.complete && !img.naturalWidth) img.remove();
    });
    let storage;
    try { storage = win.localStorage; } catch (_) { /* Private browsing may block access. */ }
    const saved = readCache(storage);
    if (saved && !root.contains(doc.activeElement)) {
      render(doc, list, saved);
      status.textContent = 'Showing previously saved posts. Checking for updates…';
    }
    const controller = new AbortController();
    const timer = win.setTimeout(() => controller.abort(), 8000);
    try {
      const posts = await loadFeed(win.fetch.bind(win), controller.signal);
      saveCache(storage, posts);
      // Never remove a link while someone is using it.
      if (root.contains(doc.activeElement)) {
        status.textContent = 'Updated posts are available. Reload this page when you are ready.';
      } else {
        render(doc, list, posts);
        status.textContent = 'Showing the latest posts available from Sabre’s feed, including pinned reels.';
      }
    } catch (_) {
      status.textContent = 'Updates are temporarily unavailable. Showing saved posts; you can still open the reels on Instagram.';
    } finally {
      win.clearTimeout(timer);
    }
  }

  // Coalesce overlapping refreshes; a slower old request cannot overwrite newer data.
  function init(doc, win) {
    if (pending.has(doc)) return pending.get(doc);
    const task = refresh(doc, win).finally(() => pending.delete(doc));
    pending.set(doc, task);
    return task;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { normalize, readCache, saveCache, loadFeed, render, init };
  } else {
    init(document, window);
  }
}());
