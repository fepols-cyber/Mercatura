const CACHE = 'mercatura-v014';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './sw.js'
];

// Install: Cache essential assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

// Activate: Clean up old caches and claim clients
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys =>
        Promise.all(
          keys.filter(key => key !== CACHE).map(key => caches.delete(key))
        )
      ),
      self.clients.claim()
    ])
  );
});

// Fetch: Cache-first strategy with network fallback
// Three.js from CDN will be cached automatically on first fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request).then(response => {
        // Cache successful responses from network
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      });
    }).catch(() => {
      return caches.match('./index.html');
    })
  );
});
