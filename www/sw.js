const CACHE_NAME = 'yunvest-pwa-cache-v48';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app_v50.js',
  '/js/renderHisse.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Cache core assets on install, but don't fail if some are missing
        return cache.addAll(urlsToCache).catch(err => console.log('Caching partial failed', err));
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // PWA requires a fetch handler to show the install prompt.
  // Using Network First strategy as fallback.
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

