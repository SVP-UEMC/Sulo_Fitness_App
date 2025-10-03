// Datos globales para Sulo Fitness App
let datosSuloFitness = {
  ingredientes: [],
  ejercicios: [],
  objetivos: []
};

// Cargar datos iniciales desde carpeta data/
async function cargarDatosIniciales() {
  try {
    const responseIngredientes = await fetch('./data/ingredientes.json');
    const ingredientesData = await responseIngredientes.json();
    datosSuloFitness.ingredientes = ingredientesData.ingredientes;

    const responseEjercicios = await fetch('./data/ejercicios.json');
    const ejerciciosData = await responseEjercicios.json();
    datosSuloFitness.ejercicios = ejerciciosData.ejercicios;

    const responseObjetivos = await fetch('./data/objetivos.json');
    const objetivosData = await responseObjetivos.json();
    datosSuloFitness.objetivos = objetivosData.objetivos;

    console.log('Datos iniciales de Sulo Fitness App cargados correctamente');
    mostrarIngredientes(); // Mostrar contenido inicial
  } catch (error) {
    console.error('Error cargando datos iniciales:', error);
    document.getElementById('contenido').textContent = 'Error cargando datos.';
  }
}

// Funciones para mostrar cada sección

function mostrarIngredientes() {
  const seccion = document.getElementById('contenido');
  seccion.innerHTML = '<h2>Ingredientes</h2>';

  if (datosSuloFitness.ingredientes.length === 0) {
    seccion.innerHTML += '<p>No hay ingredientes disponibles.</p>';
    return;
  }

  const lista = document.createElement('ul');
  datosSuloFitness.ingredientes.forEach(ingrediente => {
    const item = document.createElement('li');
    item.textContent = `${ingrediente.nombre} - Calorías: ${ingrediente.calorias_por_100g} kcal`;
    lista.appendChild(item);
  });
  seccion.appendChild(lista);
}

function mostrarEjercicios() {
  const seccion = document.getElementById('contenido');
  seccion.innerHTML = '<h2>Ejercicios</h2>';

  if (datosSuloFitness.ejercicios.length === 0) {
    seccion.innerHTML += '<p>No hay ejercicios disponibles.</p>';
    return;
  }

  datosSuloFitness.ejercicios.forEach(ejercicio => {
    const bloque = document.createElement('div');
    bloque.classList.add('ejercicio');
    bloque.innerHTML = `
      <h3>${ejercicio.nombre}</h3>
      <p>${ejercicio.descripcion}</p>
      <p><strong>Músculos:</strong> ${ejercicio.musculos_principales.join(', ')}</p>
      <p><strong>Duración estimada:</strong> ${ejercicio.duracion_estimada} segundos</p>
    `;
    seccion.appendChild(bloque);
  });
}

function mostrarObjetivos() {
  const seccion = document.getElementById('contenido');
  seccion.innerHTML = '<h2>Objetivos</h2>';

  if (datosSuloFitness.objetivos.length === 0) {
    seccion.innerHTML += '<p>No hay objetivos disponibles.</p>';
    return;
  }

  datosSuloFitness.objetivos.forEach(objetivo => {
    const item = document.createElement('div');
    item.classList.add('objetivo');
    item.innerHTML = `
      <h3>${objetivo.nombre}</h3>
      <p>${objetivo.descripcion}</p>
      <p><strong>Frecuencia de entrenamiento:</strong> ${objetivo.frecuencia_entrenamientos} días/semana</p>
    `;
    seccion.appendChild(item);
  });
}

// Eventos para menú
document.getElementById('btnVerIngredientes').addEventListener('click', mostrarIngredientes);
document.getElementById('btnVerEjercicios').addEventListener('click', mostrarEjercicios);
document.getElementById('btnVerObjetivos').addEventListener('click', mostrarObjetivos);

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', cargarDatosIniciales);

// Función placeholder para inicializar la app si es necesario
function inicializarApp() {
  // Aquí puedes poner lógica extra si quieres al iniciar
}
// Registrar el service worker para habilitar PWA y cacheo
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado con éxito:', registration.scope);
      })
      .catch(error => {
        console.error('Error al registrar Service Worker:', error);
      });
  });
}
