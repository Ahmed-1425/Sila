const CACHE_NAME = 'sila-v1.1.0';
const STATIC_CACHE = 'sila-static-v1.1.0';
const DYNAMIC_CACHE = 'sila-dynamic-v1.1.0';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&family=Poppins:wght@300;400;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Static files cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Error caching static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle different types of requests
    if (request.destination === 'document') {
        // HTML files - cache first, then network
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) {
                        // Return cached version and update in background
                        fetch(request)
                            .then(fetchResponse => {
                                if (fetchResponse.status === 200) {
                                    caches.open(DYNAMIC_CACHE)
                                        .then(cache => cache.put(request, fetchResponse.clone()));
                                }
                            })
                            .catch(() => {
                                // Network failed, keep using cached version
                            });
                        return response;
                    }
                    // Not in cache, fetch from network
                    return fetch(request)
                        .then(response => {
                            if (response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(DYNAMIC_CACHE)
                                    .then(cache => cache.put(request, responseClone));
                            }
                            return response;
                        });
                })
        );
    } else if (request.destination === 'style' || request.destination === 'script') {
        // CSS and JS files - cache first, then network
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) {
                        // Return cached version and update in background
                        fetch(request)
                            .then(fetchResponse => {
                                if (fetchResponse.status === 200) {
                                    caches.open(STATIC_CACHE)
                                        .then(cache => cache.put(request, fetchResponse.clone()));
                                }
                            })
                            .catch(() => {
                                // Network failed, keep using cached version
                            });
                        return response;
                    }
                    // Not in cache, fetch from network
                    return fetch(request)
                        .then(response => {
                            if (response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(STATIC_CACHE)
                                    .then(cache => cache.put(request, responseClone));
                            }
                            return response;
                        });
                })
        );
    } else if (request.destination === 'image') {
        // Images - network first, then cache
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => cache.put(request, responseClone));
                    }
                    return response;
                })
                .catch(() => {
                    // Network failed, try cache
                    return caches.match(request)
                        .then(response => {
                            if (response) {
                                return response;
                            }
                            // Return a placeholder image if available
                            return caches.match('/placeholder.png');
                        });
                })
        );
    } else if (request.destination === 'font') {
        // Fonts - cache first, then network
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    return fetch(request)
                        .then(fetchResponse => {
                            if (fetchResponse.status === 200) {
                                const responseClone = fetchResponse.clone();
                                caches.open(STATIC_CACHE)
                                    .then(cache => cache.put(request, responseClone));
                            }
                            return fetchResponse;
                        });
                })
        );
    } else {
        // Other requests - network first, then cache
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => cache.put(request, responseClone));
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(request);
                })
        );
    }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Push notifications
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'رسالة جديدة من صلة',
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'استكشف',
                icon: '/icon-96x96.png'
            },
            {
                action: 'close',
                title: 'إغلاق',
                icon: '/icon-96x96.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('صلة - ترجمة لغة الإشارة', options)
    );
});

// Notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // Just close the notification
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Background sync function
async function doBackgroundSync() {
    try {
        // Check for pending offline actions
        const pendingActions = await getPendingActions();
        
        for (const action of pendingActions) {
            await processOfflineAction(action);
        }
        
        console.log('Background sync completed successfully');
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Get pending offline actions from IndexedDB
async function getPendingActions() {
    // This would typically use IndexedDB to store offline actions
    // For now, return an empty array
    return [];
}

// Process offline action
async function processOfflineAction(action) {
    // Process different types of offline actions
    switch (action.type) {
        case 'contact_form':
            // Send contact form data
            await sendContactForm(action.data);
            break;
        case 'translation_data':
            // Sync translation data
            await syncTranslationData(action.data);
            break;
        default:
            console.log('Unknown action type:', action.type);
    }
}

// Send contact form data
async function sendContactForm(data) {
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            console.log('Contact form sent successfully');
        } else {
            throw new Error('Failed to send contact form');
        }
    } catch (error) {
        console.error('Error sending contact form:', error);
        throw error;
    }
}

// Sync translation data
async function syncTranslationData(data) {
    try {
        const response = await fetch('/api/translation/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            console.log('Translation data synced successfully');
        } else {
            throw new Error('Failed to sync translation data');
        }
    } catch (error) {
        console.error('Error syncing translation data:', error);
        throw error;
    }
}

// Handle app updates
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
    self.addEventListener('periodicsync', event => {
        if (event.tag === 'content-sync') {
            event.waitUntil(syncContent());
        }
    });
}

// Sync content periodically
async function syncContent() {
    try {
        // Update cached content
        const cache = await caches.open(DYNAMIC_CACHE);
        const requests = await cache.keys();
        
        for (const request of requests) {
            try {
                const response = await fetch(request);
                if (response.status === 200) {
                    await cache.put(request, response);
                }
            } catch (error) {
                console.log('Failed to update cached content:', request.url);
            }
        }
        
        console.log('Content sync completed');
    } catch (error) {
        console.error('Content sync failed:', error);
    }
}

console.log('Service Worker: Loaded successfully');