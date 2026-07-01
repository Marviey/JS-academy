const CACHE_NAME = 'js-academy-v3';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.ico',
    '/css/variables.css',
    '/css/base.css',
    '/css/layout.css',
    '/css/components.css',
    '/css/dashboard.css',
    '/css/lesson.css',
    '/css/playground.css',
    '/css/quiz.css',
    '/css/games.css',
    '/css/projects.css',
    '/css/settings.css',
    '/css/responsive.css',
    '/js/app.js',
    '/js/router.js',
    '/js/store.js',
    '/js/theme.js',
    '/js/navigation.js',
    '/js/pages/dashboard.js',
    '/js/pages/lessons.js',
    '/js/pages/playground.js',
    '/js/pages/quiz.js',
    '/js/pages/games.js',
    '/js/pages/projects.js',
    '/js/pages/profile.js',
    '/js/pages/settings.js',
    '/data/lessons.json',
    '/data/quizzes.json',
    '/data/games.json',
    '/data/projects.json',
    '/assets/icons/icon-72.png',
    '/assets/icons/icon-96.png',
    '/assets/icons/icon-128.png',
    '/assets/icons/icon-152.png',
    '/assets/icons/icon-192.png',
    '/assets/icons/icon-384.png',
    '/assets/icons/icon-512.png'
];

// Install event - cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching app assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
        .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(response => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Cache only same-origin responses
                    const requestUrl = new URL(event.request.url);
                    if (requestUrl.origin !== self.location.origin) {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        })
                        .catch(error => {
                            console.warn('Cache put failed:', error);
                        });

                    return response;
                });
            })
    );
});
