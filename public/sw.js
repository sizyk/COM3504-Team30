import DBController from './scripts/utils/DBController.mjs';

const CACHE_NAME = 'Plants App';


// Use the "install" event to pre-cache all initial resources.
self.addEventListener('install', event => {
    console.log('[Service Worker]: Installing....');
    event.waitUntil((async () => {

        console.log('[Service Worker]: Caching App Shell at the moment......');

            const cache = await caches.open(CACHE_NAME);
            cache.addAll([
                '/',
                '/public/styles/dist/global.css',

                '/public/scripts/global-scripts/modals.mjs',
                '/public/scripts/global-scripts/syncing.mjs',
                '/public/scripts/global-scripts/themeToggle.mjs',
                '/public/scripts/global-scripts/touchHover.mjs',

                '/public/scripts/utils/DBController.mjs',
                '/public/scripts/utils/flash-messages.mjs',
                '/public/scripts/utils/IDB.mjs',

                '/public/scripts/filters.js',
                '/public/scripts/global.js',
                '/public/scripts/plantForm.js',

                '/public/img/icons/flowers-false.svg',
                '/public/img/icons/flowers-true.svg',
                '/public/img/icons/fruits-or-nuts-false.svg',
                '/public/img/icons/fruits-or-nuts-true.svg',
                '/public/img/icons/has-leaf-false.svg',
                '/public/img/icons/has-leaf-true.svg',
                '/public/img/icons/sun-full.svg',
                '/public/img/icons/sun-none.svg',
                '/public/img/icons/sun-partial.svg',
            ]).catch((error) => {
                console.log('Service Worker: Failed to cache: ' + error)
            });

    })());
});

//clear cache on reload
self.addEventListener('activate', event => {
// Remove old caches
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            return keys.map(async (cache) => {
                if(cache !== CACHE_NAME) {
                    console.log('Service Worker: Removing old cache: '+cache);
                    return await caches.delete(cache);
                }
            })
        })()
    )
})

self.addEventListener('fetch', function(event) {

    console.log('[Service Worker]: Fetch', event.request.url);

    console.log("Url", event.request.url);

    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-idb') {
        event.waitUntil(DBController.synchronise());
    }
})
