// CHILLMODE Progressive Web App Offline Service Worker
const APP_SHELL_CACHE = 'chillmode-app-shell-v2';
const DATA_CACHE = 'chillmode-runtime-data-v2';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
];

// 1. Install & Precache
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('PWA Pre-caching notice:', err);
      });
    })
  );
});

// 2. Activate & Purge Legacy Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== APP_SHELL_CACHE && key !== DATA_CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Smart Fetch Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests
  if (request.method !== 'GET') return;

  // Do not intercept audio blob URLs or media element stream ranges directly
  if (url.protocol === 'blob:' || url.protocol === 'data:') return;

  // A. Navigation (HTML Pages) -> Network first, fallback to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match('/index.html');
        })
    );
    return;
  }

  // B. Static Assets (Vite chunks, CSS, JS, Google Fonts) -> Cache First
  if (
    url.pathname.startsWith('/assets/') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkRes;
        }).catch(() => cached);
      })
    );
    return;
  }

  // C. Cover Images (Unsplash, JioSaavn, Spotify CDN) -> Cache First
  if (
    request.destination === 'image' ||
    url.hostname.includes('images.unsplash.com') ||
    url.hostname.includes('saavn.com') ||
    url.hostname.includes('scdn.co')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(DATA_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkRes;
        }).catch(() => cached);
      })
    );
    return;
  }

  // D. API Discovery Requests -> Network First with runtime cache fallback
  if (url.pathname.startsWith('/api/music/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(DATA_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          // Fallback empty discovery response
          return new Response(
            JSON.stringify({
              success: true,
              isOffline: true,
              data: null,
              tracks: [],
            }),
            {
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
    );
    return;
  }

  // E. Generic Fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).catch(() => null);
    })
  );
});
