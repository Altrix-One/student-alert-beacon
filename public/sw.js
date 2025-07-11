const CACHE_NAME = 'safecampus-v2.1';
const STATIC_CACHE = 'safecampus-static-v2.1';
const DYNAMIC_CACHE = 'safecampus-dynamic-v2.1';

// Enhanced cache strategy with different cache types
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/d3cad07d-531f-4c17-b4f7-419efa7716f0.png'
];

const CACHE_STRATEGIES = {
  // Cache first for static assets
  CACHE_FIRST: 'cache-first',
  // Network first for dynamic content
  NETWORK_FIRST: 'network-first',
  // Stale while revalidate for frequently updated content
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v2.1');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache dynamic assets
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log('[SW] Dynamic cache initialized');
        return cache;
      })
    ])
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v2.1');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages immediately
      self.clients.claim()
    ])
  );
});

// Enhanced fetch event with multiple caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Static assets - Cache First strategy
    if (STATIC_ASSETS.some(asset => url.pathname === asset) || 
        url.pathname.includes('/lovable-uploads/')) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // API calls - Network First strategy
    if (url.pathname.startsWith('/api/')) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }
    
    // App shell and pages - Stale While Revalidate
    if (url.pathname === '/' || url.pathname.endsWith('.html')) {
      return await staleWhileRevalidate(request, STATIC_CACHE);
    }
    
    // JavaScript and CSS - Stale While Revalidate
    if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
      return await staleWhileRevalidate(request, STATIC_CACHE);
    }
    
    // Default - Network First with cache fallback
    return await networkFirst(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('[SW] Fetch error:', error);
    
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      const cache = await caches.open(STATIC_CACHE);
      return await cache.match('/') || new Response('Offline', { status: 503 });
    }
    
    throw error;
  }
}

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  const response = await fetch(request);
  if (response.status === 200) {
    cache.put(request, response.clone());
  }
  return response;
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Fetch in background to update cache
  const fetchPromise = fetch(request).then(response => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Ignore fetch errors for background updates
  });
  
  // Return cached version immediately if available
  if (cached) {
    return cached;
  }
  
  // If no cache, wait for network
  return await fetchPromise;
}

// Background sync for emergency alerts when offline
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'emergency-alert') {
    event.waitUntil(processOfflineEmergencyAlerts());
  }
  
  if (event.tag === 'contact-sync') {
    event.waitUntil(syncEmergencyContacts());
  }
});

async function processOfflineEmergencyAlerts() {
  console.log('[SW] Processing offline emergency alerts...');
  
  try {
    // Get queued emergency alerts from IndexedDB or localStorage
    const queuedAlerts = await getQueuedEmergencyAlerts();
    
    for (const alert of queuedAlerts) {
      try {
        // Attempt to send the alert
        await sendEmergencyAlert(alert);
        // Remove from queue on success
        await removeQueuedAlert(alert.id);
        console.log('[SW] Successfully sent queued alert:', alert.id);
      } catch (error) {
        console.error('[SW] Failed to send queued alert:', alert.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Error processing offline alerts:', error);
  }
}

async function syncEmergencyContacts() {
  console.log('[SW] Syncing emergency contacts...');
  // Implementation for syncing contacts when back online
}

async function getQueuedEmergencyAlerts() {
  // Implementation to retrieve queued alerts from storage
  return [];
}

async function removeQueuedAlert(alertId) {
  // Implementation to remove alert from queue
}

async function sendEmergencyAlert(alert) {
  // Implementation to send emergency alert
  throw new Error('Network unavailable');
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'Emergency alert received',
    icon: '/lovable-uploads/d3cad07d-531f-4c17-b4f7-419efa7716f0.png',
    badge: '/lovable-uploads/d3cad07d-531f-4c17-b4f7-419efa7716f0.png',
    vibrate: [200, 100, 200],
    tag: 'emergency-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Alert'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('SafeCampus Emergency', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: 'v2.1' });
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync triggered:', event.tag);
  
  if (event.tag === 'emergency-check') {
    event.waitUntil(checkEmergencyStatus());
  }
});

async function checkEmergencyStatus() {
  console.log('[SW] Checking emergency status...');
  // Implementation for periodic emergency status checks
}