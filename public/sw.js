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
                '/public/styles/global.css',
                '/public/styles/inputs.css',
                '/public/styles/utils.css',
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