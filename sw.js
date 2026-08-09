const CACHE = 'our-story-v17';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
      // 缓存照片请求
      if (e.request.url.match(/\.(jpg|jpeg|png|webp)/)) {
        const respClone = resp.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, respClone));
      }
      return resp;
    }).catch(() => cached))
  );
});
