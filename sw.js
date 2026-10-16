// ==========================================================================
// TOP-GYM Service Worker - Notificaciones Push & Móvil Estilo WhatsApp
// Compatible con navegadores móviles (Android Chrome, iOS Safari PWA) y escritorio
// ==========================================================================

const CACHE_NAME = 'topgym-v133';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.css',
  './app.js',
  './audio.js',
  './data.js',
  './manifest.json',
  './GYMTOP/resources/res/drawable-xxhdpi/splash_logo_icon.png',
  './GYMTOP/resources/res/drawable-xxhdpi/im_halter_logo.png',
  './GYMTOP/resources/res/drawable/im_trophy.png'
];

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[SW] Cache parcial inicializado:', err);
      });
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First with Cache Fallback for dynamic app updates
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Push Notification Event (para Web Push remotos)
self.addEventListener('push', (event) => {
  let payload = {
    title: 'TOP-GYM • Nueva Actividad',
    body: 'Tienes una nueva notificación en TOP-GYM.',
    icon: './GYMTOP/resources/res/drawable-xxhdpi/splash_logo_icon.png',
    badge: './GYMTOP/resources/res/drawable-xxhdpi/splash_logo_icon.png',
    tag: 'topgym_push',
    data: {}
  };

  if (event.data) {
    try {
      payload = Object.assign(payload, event.data.json());
    } catch (_) {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon || './GYMTOP/resources/res/drawable-xxhdpi/splash_logo_icon.png',
    badge: payload.badge || './GYMTOP/resources/res/drawable-xxhdpi/splash_logo_icon.png',
    vibrate: [200, 100, 200, 100, 250],
    tag: payload.tag || ('topgym_' + Date.now()),
    renotify: true,
    requireInteraction: false,
    data: payload.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// Notification Click Event (Comportamiento idéntico a WhatsApp Web y App Móvil)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notifData = event.notification.data || {};
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si la ventana ya está abierta, la enfoca y le envía los datos para abrir el mensaje completo
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            payload: notifData,
            data: notifData
          });
          return client.focus();
        }
      }
      // Si la ventana está cerrada, abre la app con el parámetro de navegación
      if (self.clients.openWindow) {
        const action = notifData.action || 'open_task';
        const taskId = notifData.taskId || '';
        const studentId = notifData.studentId || '';
        const targetUrl = `./index.html?notifAction=${encodeURIComponent(action)}&taskId=${encodeURIComponent(taskId)}&studentId=${encodeURIComponent(studentId)}`;
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
