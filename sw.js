// DBO Basketball Academy - Safe Clean Service Worker
// Unregister any stale service workers and avoid loop reloads
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => self.clients.claim())
  );
});

// Pass-through fetch without aggressive caching to prevent infinite reload loops
self.addEventListener('fetch', (event) => {
  // Let browser handle network normally
  return;
});
