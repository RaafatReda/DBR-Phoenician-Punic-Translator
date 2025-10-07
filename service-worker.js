const CACHE_NAME = 'dbr-translator-cache-v2';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        // We only cache the core shell. Other assets are cached on the fly.
        return cache.addAll(APP_SHELL_URLS);
      })
      .then(() => self.skipWaiting()) // Activate new worker immediately
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all pages
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  // We only want to cache GET requests.
  if (request.method !== 'GET') {
    return;
  }

  // For HTML pages, use a network-first strategy to get the latest version.
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          // If we get a valid response, we cache it and return it.
          if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          console.log('Fetch failed; returning from cache.', error);
          const cache = await caches.open(CACHE_NAME);
          // Fallback to cache for the requested page, or the main index.html.
          return await cache.match(request) || await cache.match('/index.html');
        }
      })()
    );
    return;
  }

  // For all other assets (CSS, JS, fonts, images), use a cache-first strategy.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        // If we have it in cache, return it.
        return cachedResponse;
      }

      try {
        // If it's not in the cache, fetch it from the network.
        const networkResponse = await fetch(request);
        // Cache the new asset for future offline use.
        if (networkResponse.ok) {
          // IMPORTANT: Clone the response. A response is a stream
          // and because we want the browser to consume the response
          // as well as the cache consuming the response, we need
          // to clone it so we have two streams.
          const responseToCache = networkResponse.clone();
          cache.put(request, responseToCache);
        }
        return networkResponse;
      } catch (error) {
        console.log('Fetch failed for asset and not in cache.', error);
        // We don't have a fallback for assets not in cache when offline.
        throw error;
      }
    })()
  );
});
