const CACHE_VERSION = 'v3';
const CACHE_APP_SHELL = `eief-app-shell-${CACHE_VERSION}`;
const CACHE_STATIC = `eief-static-${CACHE_VERSION}`;
const CACHE_IMAGES = `eief-images-${CACHE_VERSION}`;

const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
];

// ──────────────────────────────────────────────
// INSTALL — précache app shell
// ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_APP_SHELL).then(async (cache) => {
      await Promise.allSettled(
        APP_SHELL_URLS.map((url) => cache.add(url).catch(() => {}))
      );
      return self.skipWaiting();
    })
  );
});

// ──────────────────────────────────────────────
// ACTIVATE — supprime les anciens caches
// ──────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const CURRENT_CACHES = [CACHE_APP_SHELL, CACHE_STATIC, CACHE_IMAGES];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => !CURRENT_CACHES.includes(name))
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ──────────────────────────────────────────────
// FETCH — stratégies de cache par type de ressource
// ──────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Navigation (pages HTML) → Network first, fallback sur /index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_APP_SHELL).then((cache) => cache.put('/index.html', clone));
          }
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Requêtes API → Network only (pas de cache pour les données)
  if (url.pathname.startsWith('/api/')) return;

  // Images → Cache first, puis réseau (longue durée)
  if (
    event.request.destination === 'image' ||
    /\.(png|jpg|jpeg|svg|gif|webp|ico)(\?.*)?$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(CACHE_IMAGES).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const response = await fetch(event.request).catch(() => null);
        if (response && response.ok) cache.put(event.request, response.clone());
        return response;
      })
    );
    return;
  }

  // Ressources statiques JS/CSS/fonts → Stale While Revalidate
  if (
    url.origin === self.location.origin &&
    /\.(js|css|woff2?|ttf|eot)(\?.*)?$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(CACHE_STATIC).then(async (cache) => {
        const cached = await cache.match(event.request);
        const networkFetch = fetch(event.request)
          .then((response) => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // Tout le reste (même origine) → Network first, cache en fallback
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_STATIC).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
