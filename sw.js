const CACHE_NAME = 'yunvest-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app_v48.js',
  '/js/renderHisse.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Cache core assets on install, but don't fail if some are missing
        return cache.addAll(urlsToCache).catch(err => console.log('Caching partial failed', err));
      })
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
