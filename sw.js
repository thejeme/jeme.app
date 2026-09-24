const CACHE = 'jeme-v27';
const SHELL = ['/', '/index.html', '/404.html', '/style.css', '/script.js', '/seasons.js', '/site.webmanifest',
  '/assets/avatar-blue.webp', '/assets/avatar-black.webp', '/assets/avatar-white.webp', '/assets/favicon.png',
  '/assets/apple-touch-icon.png', '/assets/icon-192.png', '/assets/icon-512.png',
  '/assets/icon-maskable.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(SHELL.map((path) => new Request(path, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('jeme-') && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Only cache the known site files; leave verification files and other routes alone.
  if (!SHELL.includes(url.pathname)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const key = url.pathname;
    try {
      const response = await fetch(event.request, { cache: 'no-cache' });
      if (!response.ok) {
        const cached = await cache.match(key);
        return cached || response;
      }
      // A storage failure must not discard a successful network response.
      event.waitUntil(cache.put(key, response.clone()).catch(() => {}));
      return response;
    } catch (error) {
      const cached = await cache.match(key);
      if (cached) return cached;
      throw error;
    }
  })());
});
