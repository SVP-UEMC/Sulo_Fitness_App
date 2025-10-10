// Service Worker para Sulo Fitness v2.0
// Versión optimizada y compatible con la nueva arquitectura

const CACHE_NAME = 'sulo-fitness-v2-0';
const CACHE_VERSION = '2.0.1';

const urlsToCache = [
    '/',
    '/index.html',
    '/app.js',
    '/style.css',
    '/manifest.json',
    // Fuentes de Google Fonts se cachearán dinámicamente
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap',
];

// Instalación del Service Worker
self.addEventListener('install', function(event) {
    console.log('🔧 Service Worker v2.0: Instalando...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('📦 Service Worker: Cacheando archivos principales...');
                return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'no-cache' })));
            })
            .then(() => {
                console.log('✅ Service Worker: Archivos cacheados exitosamente');
                // Forzar activación inmediata
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Service Worker: Error cacheando archivos:', error);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', function(event) {
    console.log('🚀 Service Worker v2.0: Activando...');
    
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    // Borrar cachés de versiones anteriores
                    if (cacheName !== CACHE_NAME && cacheName.startsWith('sulo-fitness-') || cacheName.startsWith('fitness-app-')) {
                        console.log('🗑️ Service Worker: Borrando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker v2.0: Activado correctamente');
            // Tomar control de todas las páginas inmediatamente
            return self.clients.claim();
        })
    );
});

// Interceptar peticiones de red
self.addEventListener('fetch', function(event) {
    // Solo interceptar peticiones GET
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Estrategia Cache First para archivos estáticos
    if (event.request.url.match(/\.(js|css|html|json|woff2|woff|ttf)$/)) {
        event.respondWith(
            caches.match(event.request)
                .then(function(cachedResponse) {
                    if (cachedResponse) {
                        console.log('📦 Service Worker: Servido desde caché:', event.request.url);
                        return cachedResponse;
                    }
                    
                    // Si no está en caché, ir a la red y cachear
                    return fetch(event.request)
                        .then(function(networkResponse) {
                            // Solo cachear respuestas válidas
                            if (networkResponse.status === 200) {
                                const responseClone = networkResponse.clone();
                                caches.open(CACHE_NAME)
                                    .then(function(cache) {
                                        cache.put(event.request, responseClone);
                                    });
                                console.log('🌐 Service Worker: Cargado desde red y cacheado:', event.request.url);
                            }
                            return networkResponse;
                        })
                        .catch(function() {
                            console.log('⚠️ Service Worker: Error de red para:', event.request.url);
                            return new Response('Recurso no disponible offline', {
                                status: 503,
                                statusText: 'Service Unavailable'
                            });
                        });
                })
        );
    }
    
    // Estrategia Network First para APIs externas (fuentes, etc.)
    else if (event.request.url.includes('googleapis.com')) {
        event.respondWith(
            fetch(event.request)
                .then(function(networkResponse) {
                    if (networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseClone);
                            });
                    }
                    return networkResponse;
                })
                .catch(function() {
                    // Fallback a caché si la red falla
                    return caches.match(event.request)
                        .then(function(cachedResponse) {
                            return cachedResponse || new Response('Recurso no disponible', {
                                status: 503,
                                statusText: 'Service Unavailable'
                            });
                        });
                })
        );
    }
});

// Manejo de mensajes desde la aplicación principal
self.addEventListener('message', function(event) {
    console.log('💬 Service Worker: Mensaje recibido:', event.data);
    
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                console.log('🔄 Service Worker: Saltando espera...');
                self.skipWaiting();
                break;
                
            case 'CLEAR_CACHE':
                console.log('🗑️ Service Worker: Limpiando caché...');
                caches.delete(CACHE_NAME).then(function() {
                    console.log('✅ Service Worker: Caché limpiada');
                    event.ports[0].postMessage({ success: true });
                });
                break;
                
            case 'GET_CACHE_INFO':
                caches.open(CACHE_NAME).then(function(cache) {
                    return cache.keys();
                }).then(function(keys) {
                    event.ports[0].postMessage({ 
                        cacheSize: keys.length,
                        cacheName: CACHE_NAME,
                        version: CACHE_VERSION
                    });
                });
                break;
        }
    }
});

// Sincronización en background (para futuras mejoras)
self.addEventListener('sync', function(event) {
    console.log('🔄 Service Worker: Evento de sincronización:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Aquí puedes añadir lógica para sincronizar datos cuando se restaure la conexión
            console.log('🔄 Sincronizando datos en background...')
        );
    }
});

// Manejo de errores
self.addEventListener('error', function(event) {
    console.error('❌ Service Worker: Error:', event.error);
});

self.addEventListener('unhandledrejection', function(event) {
    console.error('❌ Service Worker: Promise rechazada:', event.reason);
});

console.log('🚀 Service Worker v2.0 cargado correctamente');
