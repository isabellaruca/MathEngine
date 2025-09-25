// --- [MATHPRO V2] ---
// --- Variables Globales y de Estado ---
let pyodide = null;
let generadorPython = null; // Referencia al módulo 'generador.py'

const AppState = {
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error'
};
let appStatus = AppState.LOADING;

let currentTopic = null;
let currentExercise = null;

// --- Función Principal de Inicialización del Entorno Python ---
async function inicializarEntornoPython() {
  const indicador = document.getElementById('pythonIndicator');
  
  try {
    console.log('[INIT] Iniciando carga de Pyodide...');
    indicador.textContent = '🔄 Cargando Entorno Python...';
    
    // 1. Cargar el motor de Pyodide
    pyodide = await loadPyodide();
    console.log('[INIT] Pyodide cargado.');
    indicador.textContent = '🐍 Obteniendo Scripts...';

    // 2. Descargar el código de tus archivos .py
    console.log('[INIT] Descargando archivos aritmetica.py y generador.py...');
    const [aritmeticaCode, generadorCode] = await Promise.all([
      fetch('./aritmetica.py').then(res => res.text()),
      fetch('./generador.py').then(res => res.text())
    ]);
    console.log('[INIT] Scripts descargados correctamente.');
    indicador.textContent = '🐍 Preparando Sistema Virtual...';

    // 3. Escribir los archivos en el sistema de archivos virtual de Pyodide
    // Esto es CRUCIAL para que el 'import' de Python funcione
    pyodide.FS.writeFile("aritmetica.py", aritmeticaCode);
    pyodide.FS.writeFile("generador.py", generadorCode);
    console.log('[INIT] Archivos escritos en el sistema virtual.');
    indicador.textContent = '🐍 Compilando Módulos...';
    
    // 4. Importar el módulo principal de Python
    generadorPython = pyodide.pyimport("generador");
    console.log('[INIT] Módulo "generador" importado con éxito.');

    // 5. Entorno listo
    appStatus = AppState.READY;
    indicador.textContent = '✅ Python Activo';
    console.log('✅ ¡Entorno Python listo para usarse!');
    habilitarInterfaz();

  } catch (error) {
    appStatus = AppState.ERROR;
    indicador.textContent = '⚡ Error (Modo Básico)';
    console.error('❌ Error Crítico al inicializar el entorno Python:', error);
    mostrarNotificacion("Error al cargar los módulos. La app funcionará en modo básico.", "error");
  }
}

// --- Funciones de la Interfaz de Usuario (UI) ---

function habilitarInterfaz() {
  document.querySelectorAll(".topic-card, .btn").forEach(el => {
    el.classList.remove('disabled');
    el.disabled = false;
  });
  console.log('[UI] Interfaz de usuario HABILITADA.');
}

function mostrarNotificacion(mensaje, tipo = 'info') {
  const notificacion = document.createElement('div');
  notificacion.className = `notification ${tipo}`;
  notificacion.textContent = mensaje;
  document.body.appendChild(notificacion);
  setTimeout(() => notificacion.remove(), 4000);
}

function obtenerNombreTema(topicId) {
    const nombres = {
        'conjuntos_numericos': 'Conjuntos Numéricos',
        'numeros_primos': 'Números Primos',
        'fraccionarios': 'Fraccionarios',
        'potenciacion_radicacion': 'Potenciación y Radicación'
    };
    return nombres[topicId] || topicId;
}


// --- Lógica Principal de la Aplicación ---

function mostrarModoEstudio(tema) {
  currentTopic = tema;
  document.getElementById("topicSelection").style.display = "none";
  const studyInterface = document.getElementById("studyInterface");
  studyInterface.style.display = "block";
  document.getElementById("exerciseInterface").style.display = "none";
  
  document.getElementById("studyTitle").textContent = obtenerNombreTema(tema);
  document.getElementById("practiceBtn").onclick = () => iniciarModoPractica(tema);
  document.getElementById("examBtn").onclick = () => iniciarModoExamen(tema);
}

function iniciarModoPractica(tema) {
  document.getElementById("studyInterface").style.display = "none";
  document.getElementById("exerciseInterface").style.display = "block";
  generarEjercicio(tema);
}

function iniciarModoExamen(tema) {
    mostrarNotificacion("La función de examen aún está en desarrollo.", "info");
    iniciarModoPractica(tema); // Temporal
}

function generarEjercicio(tema) {
  if (appStatus !== AppState.READY) {
    mostrarNotificacion("El entorno de Python no está disponible.", "error");
    return;
  }
  try {
    // Llama a la función del módulo Python importado
    const ejercicioProxy = generadorPython.generar_ejercicio_tema(tema, 'medio');
    // Convierte el resultado de Python a un objeto de JavaScript
    currentExercise = ejercicioProxy.toJs({ dict_converter: Object.fromEntries });
    ejercicioProxy.destroy(); // Libera memoria

    document.getElementById("exerciseQuestion").textContent = currentExercise.pregunta;
    document.getElementById("userAnswer").value = "";
    document.getElementById("feedback").innerHTML = "";

  } catch (error) {
    console.error(`Error al generar ejercicio para '${tema}':`, error);
    mostrarNotificacion("Hubo un error al crear el ejercicio.", "error");
  }
}

function revisarRespuesta() {
  if (!currentExercise) return;
  
  const respuestaUsuario = document.getElementById("userAnswer").value.trim();
  const feedbackEl = document.getElementById("feedback");
  
  // Usar '==' para una comparación flexible (string vs número)
  if (respuestaUsuario == currentExercise.respuesta) {
    feedbackEl.innerHTML = `<p class="correct">✅ ¡Correcto!</p><p><strong>Explicación:</strong> ${currentExercise.explicacion}</p>`;
    mostrarNotificacion("¡Respuesta Correcta!", "success");
  } else {
    feedbackEl.innerHTML = `<p class="incorrect">❌ Incorrecto. La respuesta era: <strong>${currentExercise.respuesta}</strong></p><p><strong>Explicación:</strong> ${currentExercise.explicacion}</p>`;
    mostrarNotificacion("Respuesta incorrecta. ¡Sigue intentando!", "error");
  }
}

function volverAMenu() {
    document.getElementById("studyInterface").style.display = "none";
    document.getElementById("exerciseInterface").style.display = "none";
    document.getElementById("topicSelection").style.display = "block";
    currentTopic = null;
    currentExercise = null;
}

// --- Configuración Inicial y Eventos ---

function configurarEventListeners() {
  document.querySelectorAll(".topic-card").forEach(card => {
    card.addEventListener("click", () => {
      if (appStatus === AppState.READY) {
        mostrarModoEstudio(card.dataset.topic);
      } else {
        mostrarNotificacion("El entorno Python aún se está cargando...", "info");
      }
    });
  });

  document.getElementById("checkAnswer").addEventListener("click", revisarRespuesta);
  document.getElementById("nextExercise").addEventListener("click", () => {
    if (currentTopic) generarEjercicio(currentTopic);
  });
  
  document.getElementById("backToTopicsBtn").addEventListener("click", volverAMenu);
  document.getElementById("backToStudyModeBtn").addEventListener("click", () => {
      if (currentTopic) mostrarModoEstudio(currentTopic);
  });
}

// --- Punto de Entrada de la Aplicación ---
document.addEventListener("DOMContentLoaded", () => {
  console.log('[APP] DOM cargado. Iniciando aplicación.');
  
  // Deshabilitar la UI por defecto hasta que todo esté listo
  document.querySelectorAll(".topic-card, .btn").forEach(el => {
      el.classList.add('disabled');
      el.disabled = true;
  });

  configurarEventListeners();
  inicializarEntornoPython(); // Inicia la carga de Pyodide
});
