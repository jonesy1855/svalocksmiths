// Bump the version number so the browser knows there is a new update
const CACHE_NAME = 'sva-tech-cache-v2';
const OFFLINE_URL = '/offline.html';

// Install the service worker and cache the offline page immediately
self.addEventListener('install', (event) => {
    self.skipWaiting();
    console.log('SVA Service Worker Installed');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.add(OFFLINE_URL);
        })
    );
});

// Activate and clean up old caches
self.addEventListener('activate', (event) => {
    console.log('SVA Service Worker Activated');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Network-First strategy with an Offline Fallback trap door
self.addEventListener('fetch', (event) => {
    // We only want to trigger the offline page if they are trying to load an HTML page (navigate)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    // If network works, save a fresh copy to cache and display it
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => {
                    // If network completely fails (offline), check if we have the page in the cache. 
                    // If we don't have it, deploy the emergency offline page!
                    return caches.match(event.request).then((cachedResponse) => {
                        return cachedResponse || caches.match(OFFLINE_URL);
                    });
                })
        );
    } else {
        // Standard caching strategy for images, CSS, and JS files
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                return cachedResponse || fetch(event.request);
            })
        );
    }
});