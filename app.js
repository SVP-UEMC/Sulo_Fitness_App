// app.js - Sistema Integral de Entrenamiento y Nutrición
// ================================================================

// 1. REGISTRO DEL SERVICE WORKER (PWA)
// ===================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.js')
      .then(function(registration) {
        console.log('✅ Service Worker registrado correctamente:', registration.scope);
      })
      .catch(function(error) {
        console.log('❌ Error al registrar Service Worker:', error);
      });
  });
} else {
  console.log('❌ Service Worker no soportado en este navegador');
}

// 2. VARIABLES GLOBALES
// ====================
let datosApp = {
  perfil: null,
  ingredientes: null,
  objetivos: null,
  comidas: null,
  entrenamientos: null,
  equipamiento: null,
  configuracion: null
};

let fechaActual = new Date();
let vistaActual = 'diaria'; // 'diaria' o 'semanal'

// 3. INICIALIZACIÓN DE LA APP
// ==========================
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Inicializando aplicación...');
  
  // Crear estructura básica si no existe
  if (!document.getElementById('app')) {
    document.body.innerHTML = '<div id="app"></div>';
  }
  
  // Cargar datos desde archivos JSON
  cargarDatosIniciales();
});

// 4. CARGA DE DATOS JSON
// ======================
async function cargarDatosIniciales() {
  try {
    console.log('📥 Cargando datos desde archivos JSON...');
    
    // Cargar todos los archivos JSON
    const [perfil, ingredientes, objetivos, comidas, entrenamientos, equipamiento, configuracion] = await Promise.all([
      fetch('data/perfil.json').then(res => res.json()),
      fetch('data/ingredientes.json').then(res => res.json()),
      fetch('data/objetivos.json').then(res => res.json()),
      fetch('data/comidas.json').then(res => res.json()),
      fetch('data/entrenamientos.json').then(res => res.json()),
      fetch('data/equipamiento.json').then(res => res.json()),
      fetch('data/configuracion.json').then(res => res.json())
    ]);
    
    // Guardar datos globalmente
    datosApp = {
      perfil,
      ingredientes,
      objetivos,
      comidas,
      entrenamientos,
      equipamiento,
      configuracion
    };
    
    console.log('✅ Datos cargados correctamente:', datosApp);
    
    // Aplicar tema de colores
    aplicarTemaColores();
    
    // Cargar datos del usuario desde localStorage si existen
    cargarDatosUsuario();
    
    // Inicializar interfaz
    inicializarInterfaz();
    
  } catch (error) {
    console.error('❌ Error cargando datos:', error);
    mostrarError('Error al cargar la configuración de la aplicación');
  }
}

// 5. APLICAR TEMA DE COLORES
// =========================
function aplicarTemaColores() {
  const colores = datosApp.configuracion.tema.colores;
  
  // Crear variables CSS dinámicamente
  const root = document.documentElement;
  root.style.setProperty('--color-primario', colores.primario);
  root.style.setProperty('--color-secundario', colores.secundario);
  root.style.setProperty('--color-fondo-claro', colores.fondo_claro);
  root.style.setProperty('--color-destacado', colores.destacado);
  
  console.log('🎨 Tema aplicado:', colores);
}

// 6. CARGAR/GUARDAR DATOS DE USUARIO
// ==================================
function cargarDatosUsuario() {
  const datosGuardados = localStorage.getItem('fitness-app-datos-usuario');
  if (datosGuardados) {
    try {
      const datos = JSON.parse(datosGuardados);
      // Actualizar perfil con datos guardados
      datosApp.perfil = { ...datosApp.perfil, ...datos.perfil };
      console.log('✅ Datos de usuario cargados desde localStorage');
    } catch (error) {
      console.error('❌ Error al cargar datos de usuario:', error);
    }
  }
}

function guardarDatosUsuario() {
  try {
    const datosParaGuardar = {
      perfil: datosApp.perfil,
      fecha_guardado: new Date().toISOString(),
      version: datosApp.configuracion.app_info.version
    };
    
    localStorage.setItem('fitness-app-datos-usuario', JSON.

