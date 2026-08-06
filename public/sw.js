const CACHE_NAME = 'mymusik-v1';
const STATIC_ASSETS = [
  '/',
  '/login',
  '/home',
  '/search',
  '/library',
  '/developer',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension requests
  if (request.url.startsWith('chrome-extension://')) return;
  
  // Skip API requests
  if (request.url.includes('/api/')) return;
  
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }
      
      return fetch(request).then((fetchResponse) => {
        // Don't cache if not valid response
        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
          return fetchResponse;
        }
        
        const responseToCache = fetchResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        
        return fetchResponse;
      });
    }).catch(() => {
      // Return offline fallback if available
      if (request.mode === 'navigate') {
        return caches.match('/offline');
      }
    })
  );
});

// Background sync for offline queue
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle background sync logic here
  console.log('Background sync executed');
}

// Push notification
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'Notifikasi baru dari MyMusik',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('MyMusik', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});