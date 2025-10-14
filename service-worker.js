const CACHE_NAME = 'sulo-fitness-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/manifest.json',
  // Fuentes
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.woff2'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('🔧 Service Worker: Cacheando archivos...');
        return cache.addAll(urlsToCache.map(url => new Request(url, { 
          cache: 'no-cache' 
        })));
      })
      .then(() => {
        console.log('✅ Service Worker: Todos los archivos cacheados correctamente');
        return self.skipWaiting(); // Activar nuevo SW inmediatamente
      })
      .catch(error => {
        console.error('❌ Service Worker: Error cacheando archivos:', error);
        // Intentar cachear archivos individualmente
        return caches.open(CACHE_NAME).then(cache => {
          return Promise.allSettled(
            urlsToCache.map(url => 
              cache.add(new Request(url, { cache: 'no-cache' }))
                .catch(err => console.warn(`No se pudo cachear: ${url}`, err))
            )
          );
        });
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('🔧 Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName.startsWith('sulo-fitness-') && cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('🗑️ Service Worker: Eliminando caché antigua:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activado y cachés limpiadas');
        return self.clients.claim(); // Tomar control de todas las páginas
      })
  );
});

// Intercepción de peticiones de red
self.addEventListener('fetch', event => {
  // Solo interceptar peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Excluir peticiones específicas
  const url = new URL(event.request.url);
  if (url.pathname.includes('/api/') || 
      url.pathname.includes('chrome-extension://') ||
      url.protocol !== 'https:' && url.protocol !== 'http:') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si está en caché, devolverlo
        if (response) {
          console.log('📦 Cache hit:', event.request.url);
          return response;
        }
        
        // Si no está en caché, buscar en red
        console.log('🌐 Network request:', event.request.url);
        return fetch(event.request.clone())
          .then(response => {
            // Verificar si la respuesta es válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Solo cachear respuestas exitosas de nuestro dominio
            if (response.url.includes(self.location.origin) || 
                response.url.includes('fonts.googleapis.com') ||
                response.url.includes('fonts.gstatic.com')) {
              
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                })
                .catch(error => {
                  console.warn('⚠️ No se pudo guardar en caché:', event.request.url, error);
                });
            }
            
            return response;
          })
          .catch(error => {
            console.error('❌ Error de red:', event.request.url, error);
            
            // Fallbacks para diferentes tipos de archivos
            if (event.request.destination === 'document') {
              return caches.match('/index.html')
                .then(cachedResponse => {
                  if (cachedResponse) {
                    return cachedResponse;
                  }
                  // Fallback HTML básico si no hay nada en caché
                  return new Response(`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <title>Sulo Fitness - Sin conexión</title>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                          body { 
                            font-family: Arial, sans-serif; 
                            display: flex; 
                            justify-content: center; 
                            align-items: center; 
                            height: 100vh; 
                            margin: 0; 
                            background: #f8fafc;
                            text-align: center;
                          }
                          .offline-message {
                            padding: 2rem;
                            background: white;
                            border-radius: 12px;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                            border: 2px solid #3b82f6;
                          }
                          h1 { color: #3b82f6; margin-bottom: 1rem; }
                          p { color: #64748b; margin-bottom: 1.5rem; }
                          button {
                            background: #3b82f6;
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 600;
                          }
                        </style>
                      </head>
                      <body>
                        <div class="offline-message">
                          <h1>💪 Sulo Fitness</h1>
                          <p>No hay conexión disponible</p>
                          <p>La aplicación se cargará cuando se restaure la conexión.</p>
                          <button onclick="window.location.reload()">🔄 Reintentar</button>
                        </div>
                      </body>
                    </html>
                  `, {
                    headers: { 'Content-Type': 'text/html' }
                  });
                });
            }
            
            // Para otros recursos, devolver respuesta vacía
            return new Response('', { 
              status: 408, 
              statusText: 'Sin conexión' 
            });
          });
      })
  );
});

// Manejo de mensajes desde la aplicación principal
self.addEventListener('message', event => {
  console.log('📨 Service Worker: Mensaje recibido:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Sincronización en segundo plano (cuando se restaura la conexión)
self.addEventListener('sync', event => {
  console.log('🔄 Service Worker: Sincronización en segundo plano:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aquí podrías enviar datos pendientes al servidor
      Promise.resolve().then(() => {
        console.log('✅ Sincronización completada');
      })
    );
  }
});

// Notificaciones push (para futuras funcionalidades)
self.addEventListener('push', event => {
  console.log('📱 Service Worker: Push notification recibida');
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nueva notificación de Sulo Fitness',
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><text y="70" font-size="60" text-anchor="middle" x="48">💪</text></svg>',
      badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><text y="70" font-size="60" text-anchor="middle" x="48">💪</text></svg>',
      tag: data.tag || 'sulo-fitness',
      requireInteraction: false,
      actions: [
        {
          action: 'open',
          title: 'Abrir App',
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Sulo Fitness', options)
    );
  }
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', event => {
  console.log('📱 Service Worker: Click en notificación:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then(clients => {
          // Si la app ya está abierta, enfocarla
          for (const client of clients) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Si no está abierta, abrir nueva ventana
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// Logging y métricas
self.addEventListener('error', event => {
  console.error('❌ Service Worker: Error global:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('❌ Service Worker: Promise rechazada:', event.reason);
});

console.log('📱 Sulo Fitness Service Worker v1.0.0 cargado correctamente');
