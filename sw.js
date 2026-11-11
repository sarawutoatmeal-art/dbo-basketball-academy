// DBO Basketball Academy - Service Worker with Push & Lock Screen Notification Support
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

// Handle clicking on system / lockscreen push notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});

// Listen for messages from client to display native lockscreen notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const title = event.data.title || 'DBO Basketball Academy';
    const rawOpts = event.data.options || {};
    const options = {
      body: rawOpts.body || '',
      icon: rawOpts.icon || 'assets/images/app-icon-192.png',
      badge: rawOpts.badge || 'assets/images/favicon.png',
      tag: rawOpts.tag || ('dbo-alert-' + Date.now()),
      renotify: true,
      requireInteraction: false,
      vibrate: [200, 100, 200],
      data: rawOpts.data || {},
      ...rawOpts
    };
    self.registration.showNotification(title, options);
  }
});

// Push event listener for incoming web push
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'DBO Academy', body: event.data.text() };
    }
  }
  const title = data.title || 'DBO Basketball Academy';
  const options = {
    body: data.body || 'มีการแจ้งเตือนใหม่จาก DBO Academy',
    icon: data.icon || 'assets/images/app-icon-192.png',
    badge: data.badge || 'assets/images/favicon.png',
    tag: data.tag || ('dbo-push-' + Date.now()),
    renotify: true,
    vibrate: [200, 100, 200],
    data: data.data || {}
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('fetch', (event) => {
  return;
});
