/* eslint no-restricted-globals: 0 */ // Allow use of 'self'

const CACHE_NAME = 'Plants App';

// Use the "install" event to pre-cache all initial resources.
self.addEventListener('install', (event) => {
  console.log('[Service Worker]: Installing....');
  event.waitUntil((async () => {
    console.log('[Service Worker]: Caching App Shell at the moment......');

    const cache = await caches.open(CACHE_NAME);
    await cache.addAll([
      '/public/cached-views/plant-card.ejs',
      '/public/cached-views/empty-index.html',

      '/public/fonts/dm-sans.ttf',
      '/public/fonts/dm-sans-italic.ttf',
      '/public/fonts/material-symbols.woff2',
      '/public/fonts/NotoColorEmoji-Regular.ttf',

      '/public/img/icons/flowers-false.svg',
      '/public/img/icons/flowers-true.svg',
      '/public/img/icons/fruits-or-nuts-false.svg',
      '/public/img/icons/fruits-or-nuts-true.svg',
      '/public/img/icons/has-leaf-false.svg',
      '/public/img/icons/has-leaf-true.svg',
      '/public/img/icons/sun-full.svg',
      '/public/img/icons/sun-none.svg',
      '/public/img/icons/sun-partial.svg',
      '/public/img/favicon.ico',
      '/public/img/loading.svg',
      '/public/img/logo.svg',

      '/public/scripts/global-scripts/modals.mjs',
      '/public/scripts/global-scripts/serviceWorker.mjs',
      '/public/scripts/global-scripts/syncing.mjs',
      '/public/scripts/global-scripts/themeToggle.mjs',
      '/public/scripts/global-scripts/touchHover.mjs',

      '/public/scripts/offline/index.js',

      '/public/scripts/utils/DBController.mjs',
      '/public/scripts/utils/flash-messages.mjs',
      '/public/scripts/utils/IDB.mjs',
      '/public/scripts/utils/plantUtils.mjs',

      '/public/scripts/ejs.min.js',
      '/public/scripts/filters.js',
      '/public/scripts/global.js',
      '/public/scripts/plantForm.js',

      '/public/styles/dist/global.css',

      '/public/manifest.json',
    ]);
  })());
});

// clear cache on reload
self.addEventListener('activate', (event) => {
// Remove old caches
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      return keys.map(async (cache) => {
        if (cache !== CACHE_NAME) {
          console.log(`Service Worker: Removing old cache: ${cache}`);
          return caches.delete(cache);
        }
        return false;
      });
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  console.log('[Service Worker]: Fetch', event.request.url);

  const url = new URL(event.request.url);
  let offlineResponse = caches.match(url);

  if (url.pathname === '/') {
    // User is requesting index, return empty one if offline
    offlineResponse = caches.match('/public/cached-views/empty-index.html');
  }

  // Attempt to fetch, if error occurs then fetch from cache
  event.respondWith(
    fetch(event.request)
      .then((res) => res)
      .catch(() => offlineResponse),
  );
});
