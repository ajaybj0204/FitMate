/* FITORA notification worker: shows reminders sent by FITORA's server (via Firebase Cloud Messaging)
   and opens the right screen when one is tapped. It does not cache pages. */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { data: { title: 'FITORA', body: event.data ? event.data.text() : '' } };
  }
  const d = payload.data || payload.notification || {};
  const title = d.title || 'FITORA';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: d.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: d.tag || 'fitora',
      renotify: true,
      data: { link: d.link || '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if (new URL(w.url).origin === self.location.origin) {
          w.focus();
          return w.navigate(link);
        }
      }
      return self.clients.openWindow(link);
    }),
  );
});
