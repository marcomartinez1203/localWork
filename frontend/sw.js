// ============================================
// LocalWork — Service Worker (Offline Cache)
// ============================================

const CACHE_NAME = 'localwork-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './assets/css/main.css',
  './assets/css/components.css',
  './assets/js/config/api.js',
  './assets/js/services/auth.service.js',
  './assets/js/utils/helpers.js',
  './assets/js/app.js',
  './assets/js/theme-init.js',
  './assets/img/logo.png',
  './assets/img/favicon.png',
];

// Install — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip API calls and non-GET requests
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
