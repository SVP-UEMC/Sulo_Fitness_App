// service-worker.js - Sistema Integral de Entrenamiento y Nutrición
// ==================================================================

const CACHE_NAME = 'fitness-app-v1';
const urlsToCache = [
  // Archivos principales
  '/',
  '/index.html',
  '/style.css', 
  '/app.js',
  '/manifest.json',
  
  // Archivos de configuración JSON
  '/data/perfil.json',
  '/data/ingredientes.json',
  '/data/objetivos.json',
  '/data/comidas.json',
  '/data/entrenamientos.json',
  '/data/equipamiento.json',
  '/data/configuracion.json',
  
  // Posibles iconos (se agregarán cuando los tengas)
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico'
];

// ===================================
// INSTALACIÓN DEL SERVICE WORKER
// ===================================
self.addEventListener('install', function(event) {
  console.log('🔧 Service Worker: Instalando versión', CACHE_NAME);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 Service Worker: Guardando archivos en caché...');
        
        // Intentar cachear todos los archivos
        return cache.addAll(urlsToCache.map(url => {
          return new Request(url, { cache: 'reload' });
        }));
      })
      .then(() => {
        console.log('✅ Service Worker: Todos los archivos cacheados correctamente');
        // Forzar que el nuevo SW tome control inmediatamente
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Service Worker: Error al cachear archivos:', error);
      })
  );
});

// ===================================
// ACTIVACIÓN DEL SERVICE WORKER
// ===================================
self.addEventListener('activate', function(event) {
  console.log('🚀 Service Worker: Activando versión', CACHE_NAME);
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          // Borrar cachés de versiones anteriores
          if (cacheName !== CACHE_NAME && cacheName.startsWith('fitness-app-')) {
            console.log('🗑️ Service Worker: Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activado y listo');
      // Tomar control de todas las pestañas inmediatamente
      return self.clients.claim();
    })
  );
});

// ===================================
// INTERCEPTAR PETICIONES DE RED
// ===================================
self.addEventListener('fetch', function(event) {
  // Solo manejar peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(cachedResponse) {
        // Si está en caché, devolverlo
        if (cachedResponse) {
          console.log('📱 Servido desde caché:', event.request.url);
          return cachedResponse;
        }
        
        // Si no está en caché, ir a la red
        console.log('🌐 Cargando desde red:', event.request.url);
        
        return fetch(event.request)
          .then(response => {
            // Solo cachear respuestas exitosas
            if (response && response.status === 200 && response.type === 'basic') {
              // Clonar la respuesta porque puede ser consumida solo una vez
              const responseClone = response.clone();
              
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseClone);
                });
            }
            
            return response;
          })
          .catch(error => {
            console.error('❌ Error de red:', error);
            
            // Si es una página HTML y falla la red, devolver página offline
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            // Para otros recursos, devolver respuesta vacía
            return new Response('Recurso no disponible offline', {
              status: 503,
              statusText: 'Sin conexión'
            });
          });
      })
  );
});

// ===================================
// MANEJO DE MENSAJES (COMUNICACIÓN CON LA APP)
// ===================================
self.addEventListener('message', function(event) {
  console.log('💬 Service Worker: Mensaje recibido:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        // Forzar activación del nuevo service worker
        self.skipWaiting();
        break;
        
      case 'CACHE_UPDATE':
        // Forzar actualización de caché
        event.waitUntil(
          caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
          })
        );
        break;
        
      case 'CLEAR_CACHE':
        // Limpiar toda la caché
        event.waitUntil(
          caches.keys().then(cacheNames => {
            return Promise.all(
              cacheNames.map(cacheName => caches.delete(cacheName))
            );
          })
        );
        break;
    }
  }
});

// ===================================
// NOTIFICACIONES (FUTURO)
// ===================================
self.addEventListener('push', function(event) {
  console.log('🔔 Service Worker: Push recibido:', event);
  
  // Por ahora solo logging, en futuras versiones se pueden añadir notificaciones
  // para recordar entrenamientos, comidas, etc.
});

console.log('✅ Service Worker cargado correctamente');
