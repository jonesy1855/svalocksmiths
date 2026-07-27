const CACHE_NAME = 'sva-tech-cache-v1';

// Install the service worker
self.addEventListener('install', (event) => {
    self.skipWaiting();
    console.log('SVA Service Worker Installed');
});

// Activate and clean up old caches
self.addEventListener('activate', (event) => {
    console.log('SVA Service Worker Activated');
});

// Network-First strategy (crucial while you are still editing code)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // If we get a response, save a copy to the cache
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                // If the network fails (offline), pull from the cache
                return caches.match(event.request);
            })
    );
});
