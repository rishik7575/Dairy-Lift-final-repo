/**
 * Service Worker for Dairy-Lift
 * Provides caching and offline support
 */

const CACHE_NAME = 'dairy-lift-cache-v1';
const RUNTIME_CACHE = 'dairy-lift-runtime-v1';

// Resources to cache on install
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/home_page.html',
  '/login.html',
  '/dashboard.html',
  '/css/performance-optimizations.css',
  '/js/global-optimizations.js',
  '/js/performance-manager.js',
  '/js/image-optimizer.js',
  '/image/profileicone.png',
  // Add other critical resources here
];

// Install event - precache static resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Pre-caching resources');
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip Supabase API requests (don't cache dynamic data)
  if (event.request.url.includes('supabase')) {
    return;
  }

  // For HTML pages - network first, then cache
  if (event.request.headers.get('Accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(RUNTIME_CACHE)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // If not in cache, try to serve the offline page
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // For images - cache first, then network
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(event.request)
            .then(response => {
              // Don't cache non-successful responses
              if (!response.ok) {
                return response;
              }
              
              // Clone the response
              const responseToCache = response.clone();
              
              caches.open(RUNTIME_CACHE)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
                
              return response;
            })
            .catch(() => {
              // If offline and image not cached, return placeholder
              if (event.request.destination === 'image') {
                return caches.match('/image/placeholder.png');
              }
            });
        })
    );
    return;
  }

  // For CSS and JS - stale-while-revalidate strategy
  if (
    event.request.destination === 'style' ||
    event.request.destination === 'script'
  ) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          const fetchPromise = fetch(event.request)
            .then(networkResponse => {
              // Update the cache
              caches.open(RUNTIME_CACHE)
                .then(cache => {
                  cache.put(event.request, networkResponse.clone());
                });
              return networkResponse;
            })
            .catch(error => {
              console.error('Fetch failed:', error);
            });
            
          // Return the cached response immediately, or wait for network
          return cachedResponse || fetchPromise;
        })
    );
    return;
  }

  // Default strategy - network first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Don't cache non-successful responses
        if (!response.ok) {
          return response;
        }
        
        // Clone the response
        const responseToCache = response.clone();
        
        caches.open(RUNTIME_CACHE)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
          
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Handle push notifications
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/image/notification-icon.png',
    badge: '/image/badge-icon.png',
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncForms());
  }
});

// Function to sync stored form data
async function syncForms() {
  try {
    const db = await openDB();
    const forms = await db.getAll('offline-forms');
    
    for (const form of forms) {
      try {
        const response = await fetch(form.url, {
          method: form.method,
          headers: form.headers,
          body: form.body
        });
        
        if (response.ok) {
          await db.delete('offline-forms', form.id);
        }
      } catch (error) {
        console.error('Sync failed for form:', form.id, error);
      }
    }
  } catch (error) {
    console.error('Form sync failed:', error);
  }
}

// IndexedDB helper for offline storage
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('dairy-lift-offline', 1);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      db.createObjectStore('offline-forms', { keyPath: 'id', autoIncrement: true });
    };
    
    request.onsuccess = event => {
      resolve(event.target.result);
    };
    
    request.onerror = event => {
      reject(event.target.error);
    };
  });
}