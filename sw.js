const CACHE = 'mercatura-v013';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './sw.js'
];

// Install: Cache assets and skip waiting for activation
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

// Fetch: Cache-first strategy for offline support
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(() => {
      return caches.match('./index.html');
    })
  );
});
