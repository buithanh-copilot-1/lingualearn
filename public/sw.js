// Service Worker for receiving Web Push Notifications
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { message: event.data.text() };
    }
  }

  const title = data.title || 'LinguaLearn';
  const options = {
    body: data.message || 'Bạn có thông báo mới từ LinguaLearn!',
    icon: '/favicon.svg', // logo icon
    badge: '/favicon.svg', // badge icon
    data: data.data || {},
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'Mở LinguaLearn' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = '/?open_notifications=true';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, navigate to targetUrl and focus it
      for (const client of clientList) {
        if ('focus' in client && 'navigate' in client) {
          return client.navigate(targetUrl).then((c) => c?.focus());
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
