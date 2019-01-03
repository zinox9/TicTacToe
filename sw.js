var CACHE_NAME = 'tictactoe-v1';
var urlsToCache = [
    '/',
    '/index.html',
    '/favicons/',
    'js/bootstrap.min.js',
    'js/jquery.min.js',
    'js/main.js',
    'js/tether.min.js',
    'css/bootstrap.css',    
    'css/style.css'
];


self.addEventListener('install', function (event) {
    console.log("ServiceWorker Installing...");
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                console.log('ServiceWorker Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', function (event) {
    console.log("ServiceWorker Activating...");
    var cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log("ServiceWorker deleting Cache : " + cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', function (event) {
    console.log("ServiceWorker Fetching...");
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // IMPORTANT: Clone the request. A request is a stream and
                // can only be consumed once. Since we are consuming this
                // once by cache and once by the browser for fetch, we need
                // to clone the response.
                var fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    function (response) {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function (cache) {
                                console.log("ServiceWorker Caching...")
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});