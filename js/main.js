// --- Variables Globales ---
let pyodide = null;
let generadorPython = null; // Módulo de Python para generar ejercicios
let currentExercise = null;
let currentTopic = null;
const userProgress = JSON.parse(localStorage.getItem("mathpro-progress")) || {};
window.pythonDisponible = false; // Estado global para el indicador

// --- Función Principal de Inicialización ---
async function main() {
    const pythonIndicator = document.getElementById('pythonIndicator');
    try {
        console.log("[v1] Iniciando carga de Pyodide...");
        pythonIndicator.textContent = '🔄 Cargando Pyodide...';
        pyodide = await loadPyodide();
        
        console.log("[v1] Pyodide cargado. Obteniendo archivos Python...");
        pythonIndicator.textContent = '🐍 Obteniendo Scripts...';

        // Descargamos el contenido de los archivos .py en paralelo
        const [aritmeticaPy, generadorPy] = await Promise.all([
            fetch('./aritmetica.py').then(res => res.text()),
            fetch('./generador.py').then(res => res.text())
        ]);

        console.log("[v1] Scripts obtenidos. Escribiendo en el sistema de archivos virtual...");
        
        // Escribimos los archivos en el sistema virtual de Pyodide
        pyodide.FS.writeFile("aritmetica.py", aritmeticaPy);
        pyodide.FS.writeFile("generador.py", generadorPy);

        console.log("[v1] Archivos escritos. Importando el módulo principal...");
        pythonIndicator.textContent = '🐍 Compilando Python...';

        // Importamos el módulo generador (que a su vez importa aritmetica)
        generadorPython = pyodide.pyimport("generador");

        window.pythonDisponible = true;
        pythonIndicator.textContent = '✅ Python Activo';
        console.log("[v1] ¡Entorno de Python completamente listo!");
        
        // Una vez que todo está cargado, activamos la interfaz
        enableUI();

    } catch (error) {
        console.error("[v1] Fallo crítico al inicializar el entorno de Python:", error);
        pythonIndicator.textContent = '⚡ Error (Modo Básico)';
        window.pythonDisponible = false;
        // Opcional: mostrar un mensaje más visible al usuario
        showNotification("Error al cargar Python. La app está en modo básico.", "error");
    }
}

// --- Lógica de la Aplicación (Funciones de Interfaz) ---

function enableUI() {
    document.querySelectorAll(".topic-card, .btn").forEach(el => {
        el.classList.remove('disabled');
        el.disabled = false;
    });
    console.log("[v1] Interfaz de usuario habilitada.");
}

function getTopicName(topicId) {
    const names = {
        'conjuntos_numericos': 'Conjuntos Numéricos',
        'numeros_primos': 'Números Primos',
        'fraccionarios': 'Fraccionarios',
        'potenciacion_radicacion': 'Potenciación y Radicación'
    };
    return names[topicId] || topicId;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3500);
}

function showStudyMode(topic) {
    document.getElementById("topicSelection").style.display = "none";
    const studyInterface = document.getElementById("studyInterface");
    studyInterface.style.display = "block";
    
    document.getElementById("studyTitle").textContent = getTopicName(topic);
    // Asignar eventos a los botones del modo de estudio
    document.getElementById("practiceBtn").onclick = () => startStudyMode(topic);
    document.getElementById("examBtn").onclick = () => startExamMode(topic);
}

function startStudyMode(topic) {
    currentTopic = topic;
    document.getElementById("studyInterface").style.display = "none";
    document.getElementById("exerciseInterface").style.display = "block";
    generateExercise(topic);
}

function startExamMode(topic) {
    showNotification("La función de examen aún está en desarrollo.", "info");
    startStudyMode(topic); // Temporalmente, redirige al modo de práctica
}

function generateExercise(topic) {
    if (!generadorPython) {
        showNotification("El módulo de Python no está listo.", "error");
        return;
    }
    try {
        // Llamamos a la función directamente desde el módulo importado
        const exerciseData = generadorPython.generar_ejercicio_tema(topic, 'medio').toJs({ dict_converter: Object.fromEntries });
        
        currentExercise = exerciseData;
        
        document.getElementById("exerciseQuestion").textContent = currentExercise.pregunta;
        document.getElementById("userAnswer").value = "";
        document.getElementById("feedback").innerHTML = "";
        
    } catch (error) {
        console.error("[v1] Error al generar ejercicio:", error);
        showNotification("No se pudo generar el ejercicio.", "error");
    }
}

function checkAnswer() {
    if (!currentExercise) return;
    
    const userAnswer = document.getElementById("userAnswer").value.trim();
    const feedbackEl = document.getElementById("feedback");
    
    // Comparación flexible para evitar problemas de tipo (ej. "5" vs 5)
    if (userAnswer == currentExercise.respuesta) {
        feedbackEl.innerHTML = `<p class="correct">✅ ¡Correcto!</p><p><strong>Explicación:</strong> ${currentExercise.explicacion}</p>`;
        showNotification("¡Respuesta Correcta!", "success");
    } else {
        feedbackEl.innerHTML = `<p class="incorrect">❌ Incorrecto. La respuesta era: <strong>${currentExercise.respuesta}</strong></p><p><strong>Explicación:</strong> ${currentExercise.explicacion}</p>`;
        showNotification("Inténtalo de nuevo.", "error");
    }
}

function showTopicSelection() {
    document.getElementById("studyInterface").style.display = "none";
    document.getElementById("exerciseInterface").style.display = "none";
    document.getElementById("topicSelection").style.display = "block";
    currentExercise = null;
    currentTopic = null;
}

// --- Configuración de Eventos ---

function setupEventListeners() {
    document.querySelectorAll(".topic-card").forEach(card => {
        card.addEventListener("click", () => {
            if (window.pythonDisponible) {
                showStudyMode(card.dataset.topic);
            } else {
                showNotification("El entorno Python no está disponible.", "error");
            }
        });
    });

    document.getElementById("checkAnswer").addEventListener("click", checkAnswer);
    document.getElementById("nextExercise").addEventListener("click", () => {
        if (currentTopic) generateExercise(currentTopic);
    });
    
    document.getElementById("backToTopicsBtn").addEventListener("click", showTopicSelection);
    document.getElementById("backToStudyModeBtn").addEventListener("click", () => {
        // Esta función te regresa desde la pantalla de ejercicios a la de estudio/examen
        document.getElementById("exerciseInterface").style.display = "none";
        showStudyMode(currentTopic);
    });
}

// --- Punto de Entrada de la Aplicación ---
document.addEventListener("DOMContentLoaded", () => {
    // Deshabilitar la UI por defecto hasta que todo cargue
    document.querySelectorAll(".topic-card, .btn").forEach(el => {
        el.classList.add('disabled');
        el.disabled = true;
    });
    
    setupEventListeners();
    main(); // Iniciar la carga de Pyodide y los scripts
});
