// Service Worker - Sulo Fitness App v1.0
// Sistema Integral de Entrenamiento y Nutrición

const CACHE_NAME = 'sulo-fitness-v1.0';
const CACHE_STATIC_NAME = 'sulo-fitness-static-v1.0';
const CACHE_DYNAMIC_NAME = 'sulo-fitness-dynamic-v1.0';

// Archivos esenciales para cachear
const STATIC_FILES = [
    '/',
    '/index.html',
    '/app.js',
    '/style.css',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// Archivos de datos JSON
const DATA_FILES = [
    '/data/configuracion.json',
    '/data/perfil.json',
    '/data/ingredientes.json',
    '/data/objetivos.json',
    '/data/comidas.json',
    '/data/entrenamientos.json',
    '/data/equipamiento.json'
];

// URLs de APIs externas que NO se deben cachear
const EXTERNAL_APIS = [
    'api.nal.usda.gov',
    'wger.de',
    'openfoodfacts.org'
];

// ===================================
// INSTALACIÓN DEL SERVICE WORKER
// ===================================
self.addEventListener('install', function(event) {
    console.log('🔧 Service Worker: Instalando versión', CACHE_NAME);
    
    event.waitUntil(
        Promise.all([
            // Cachear archivos estáticos
            caches.open(CACHE_STATIC_NAME).then(cache => {
                console.log('📦 Cacheando archivos estáticos...');
                return cache.addAll(STATIC_FILES.map(url => {
                    return new Request(url, { cache: 'reload' });
                }));
            }),
            // Cachear archivos de datos
            caches.open(CACHE_DYNAMIC_NAME).then(cache => {
                console.log('📊 Cacheando archivos de datos...');
                return cache.addAll(DATA_FILES.map(url => {
                    return new Request(url, { cache: 'reload' });
                })).catch(error => {
                    console.warn('⚠️ Algunos archivos de datos no se pudieron cachear:', error);
                });
            })
        ]).then(() => {
            console.log('✅ Service Worker: Instalación completa');
            return self.skipWaiting();
        }).catch(error => {
            console.error('❌ Error durante la instalación:', error);
        })
    );
});

// ===================================
// ACTIVACIÓN DEL SERVICE WORKER
// ===================================
self.addEventListener('activate', function(event) {
    console.log('🚀 Service Worker: Activando versión', CACHE_NAME);
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Eliminar cachés de versiones anteriores
                    if (cacheName !== CACHE_STATIC_NAME && 
                        cacheName !== CACHE_DYNAMIC_NAME && 
                        (cacheName.includes('sulo-fitness') || cacheName.includes('fitness-app'))) {
                        console.log('🗑️ Eliminando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker: Activado correctamente');
            return self.clients.claim();
        })
    );
});

// ===================================
// INTERCEPTAR PETICIONES DE RED
// ===================================
self.addEventListener('fetch', function(event) {
    const requestURL = new URL(event.request.url);
    
    // No manejar peticiones que no sean GET
    if (event.request.method !== 'GET') {
        return;
    }
    
    // No cachear APIs externas
    if (EXTERNAL_APIS.some(api => requestURL.hostname.includes(api))) {
        console.log('🌐 API externa (no cachear):', event.request.url);
        return fetch(event.request).catch(error => {
            console.warn('⚠️ Error en API externa:', error);
            return new Response('{"error": "API no disponible"}', {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            });
        });
    }
    
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                console.log('📱 Desde caché:', event.request.url);
                return cachedResponse;
            }
            
            // No está en caché, ir a la red
            console.log('🌐 Desde red:', event.request.url);
            return fetch(event.request).then(response => {
                // Solo cachear respuestas exitosas
                if (response && response.status === 200 && response.type === 'basic') {
                    // Decidir en qué caché guardar
                    const cacheName = DATA_FILES.includes(requestURL.pathname) ? 
                        CACHE_DYNAMIC_NAME : CACHE_STATIC_NAME;
                    
                    const responseClone = response.clone();
                    caches.open(cacheName).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                
                return response;
            }).catch(error => {
                console.error('❌ Error de red:', error);
                
                // Fallbacks dependiendo del tipo de recurso
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
                
                if (requestURL.pathname.endsWith('.json')) {
                    return new Response('{}', {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                
                return new Response('Recurso no disponible offline', {
                    status: 503,
                    statusText: 'Sin conexión'
                });
            });
        })
    );
});

// ===================================
// MANEJO DE MENSAJES
// ===================================
self.addEventListener('message', function(event) {
    console.log('💬 Service Worker: Mensaje recibido:', event.data);
    
    if (event.data && event.data.type) {
        switch(event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                event.ports[0]?.postMessage({ success: true });
                break;
                
            case 'CACHE_UPDATE':
                event.waitUntil(
                    Promise.all([
                        caches.open(CACHE_STATIC_NAME).then(cache => cache.addAll(STATIC_FILES)),
                        caches.open(CACHE_DYNAMIC_NAME).then(cache => cache.addAll(DATA_FILES))
                    ]).then(() => {
                        event.ports[0]?.postMessage({ success: true, message: 'Caché actualizada' });
                    }).catch(error => {
                        event.ports[0]?.postMessage({ success: false, error: error.message });
                    })
                );
                break;
                
            case 'CLEAR_CACHE':
                event.waitUntil(
                    caches.keys().then(cacheNames => {
                        return Promise.all(
                            cacheNames.filter(name => name.includes('sulo-fitness'))
                                     .map(name => caches.delete(name))
                        );
                    }).then(() => {
                        event.ports[0]?.postMessage({ success: true, message: 'Caché limpiada' });
                    })
                );
                break;
                
            case 'GET_CACHE_STATUS':
                caches.keys().then(cacheNames => {
                    event.ports[0]?.postMessage({ 
                        success: true, 
                        caches: cacheNames.filter(name => name.includes('sulo-fitness'))
                    });
                });
                break;
        }
    }
});

// ===================================
// NOTIFICACIONES PUSH (FUTURO)
// ===================================
self.addEventListener('push', function(event) {
    console.log('🔔 Service Worker: Push recibido:', event);
    // Futuro: notificaciones para recordatorios de entrenamiento/nutrición
});

// ===================================
// SYNC EN SEGUNDO PLANO (FUTURO)
// ===================================
self.addEventListener('sync', function(event) {
    console.log('🔄 Service Worker: Background sync:', event.tag);
    // Futuro: sincronización de datos cuando vuelva la conexión
});

console.log('✅ Service Worker v1.0 cargado correctamente para Sulo Fitness App');
