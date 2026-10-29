const CACHE_NAME = 'salary-tracker-v96';
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css?v=20261029k',
  './app.js?v=20261029k',
  './manifest.json',
  './apple-touch-icon.png?v=20261029k',
  './apple-touch-icon.png',
  './icon-192.png?v=20261029k',
  './icon-192.png',
  './icon-512.png',
  './favicon.png?v=20261029k',
  './favicon.png',
  './icon.svg'
];

const OPTIONAL_ASSETS = [
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(CORE_ASSETS);
      try {
        await cache.addAll(OPTIONAL_ASSETS);
      } catch (err) {
        console.warn('Optional asset caching skipped:', err);
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  if (event.request.url.includes('.supabase.co')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {
          return cachedResponse || (event.request.mode === 'navigate' ? caches.match('./index.html') : null);
        });

      return cachedResponse || fetchPromise;
    })
  );
});
