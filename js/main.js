// Global variables - CORREGIDO: usar let en lugar de const para variables que cambian
let pyodide = null;
let currentTopic = null; // Cambiado de const a let
let currentExercise = null;
const userProgress = JSON.parse(localStorage.getItem("mathpro-progress")) || {};

// Function to load user progress
function loadUserProgress() {
  console.log("[v0] Cargando progreso del usuario...");
  const progressDisplay = document.getElementById("progressDisplay");
  if (progressDisplay && Object.keys(userProgress).length > 0) {
    let progressHTML = "<h3>Tu Progreso:</h3>";
    for (const [topic, data] of Object.entries(userProgress)) {
      const total = data.correct + data.incorrect;
      const percentage = total > 0 ? Math.round((data.correct / total) * 100) : 0;
      progressHTML += `
        <div class="progress-item">
          <span>${getTopicName(topic)}: ${percentage}% (${data.correct}/${total})</span>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    }
    progressDisplay.innerHTML = progressHTML;
  }
}

// Function to set up event listeners - CORREGIDO: mejor manejo de eventos
function setupEventListeners() {
  console.log("[v0] Configurando listeners de eventos...");

  // Topic cards click handlers - CORREGIDO: delegación de eventos mejorada
  document.querySelectorAll(".topic-card").forEach((card) => {
    card.addEventListener("click", function() {
      const topic = this.dataset.topic;
      if (topic) {
        console.log(`[v0] Seleccionado tema: ${topic}`);
        showStudyMode(topic);
      }
    });
  });

  // Study mode buttons - CORREGIDO: usar delegación de eventos
  document.addEventListener('click', function(e) {
    // Botón de estudio
    if (e.target.id === 'studyBtn' || e.target.closest('#studyBtn')) {
      const topic = e.target.dataset.topic || e.target.closest('#studyBtn').dataset.topic;
      if (topic) {
        console.log(`[v0] Iniciando estudio de: ${topic}`);
        startStudyMode(topic);
      }
    }
    
    // Botón de examen
    if (e.target.id === 'examBtn' || e.target.closest('#examBtn')) {
      const topic = e.target.dataset.topic || e.target.closest('#examBtn').dataset.topic;
      if (topic) {
        console.log(`[v0] Iniciando examen de: ${topic}`);
        startExamMode(topic);
      }
    }
    
    // Botón de enviar respuesta
    if (e.target.id === 'submitAnswer' || e.target.closest('#submitAnswer')) {
      checkAnswer();
    }
    
    // Botón de siguiente ejercicio
    if (e.target.id === 'nextExercise' || e.target.closest('#nextExercise')) {
      const topic = currentTopic;
      if (topic) {
        generateExercise(topic);
      }
    }
    
    // Botón de volver a temas
    if (e.target.id === 'backToTopics' || e.target.closest('#backToTopics')) {
      showTopicSelection();
    }
  });

  // Answer input enter key
  const answerInput = document.getElementById("answerInput");
  if (answerInput) {
    answerInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        checkAnswer();
      }
    });
  }

  // Navigation smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
}

// Function to show notifications
function showNotification(message, type = "info") {
  console.log(`[v0] Mostrando notificación: ${message} (${type})`);

  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((n) => n.remove());

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()">&times;</button>
  `;

  document.body.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// Function to get topic name
function getTopicName(topic) {
  const topicNames = {
    conjuntos_numericos: "Conjuntos Numéricos",
    numeros_primos: "Números Primos",
    fraccionarios: "Fraccionarios",
    potenciacion_radicacion: "Potenciación y Radicación",
  };
  return topicNames[topic] || "Tema Desconocido";
}

// Function to update user progress
function updateProgress(topic, isCorrect) {
  console.log(`[v0] Actualizando progreso para tema: ${topic}, respuesta correcta: ${isCorrect}`);
  if (!userProgress[topic]) {
    userProgress[topic] = { correct: 0, incorrect: 0 };
  }
  if (isCorrect) {
    userProgress[topic].correct += 1;
  } else {
    userProgress[topic].incorrect += 1;
  }
  localStorage.setItem("mathpro-progress", JSON.stringify(userProgress));
  
  // Actualizar la barra de progreso visualmente
  updateProgressBars();
}

// Actualizar barras de progreso visualmente
function updateProgressBars() {
  document.querySelectorAll(".topic-card").forEach((card) => {
    const topic = card.dataset.topic;
    if (userProgress[topic]) {
      const data = userProgress[topic];
      const total = data.correct + data.incorrect;
      const percentage = total > 0 ? Math.round((data.correct / total) * 100) : 0;
      
      const progressFill = card.querySelector(".progress-fill");
      const progressText = card.querySelector(".progress-text");
      
      if (progressFill) {
        progressFill.style.width = `${percentage}%`;
      }
      if (progressText) {
        progressText.textContent = `${percentage}% completado`;
      }
    }
  });
}

// Initialize the application
document.addEventListener("DOMContentLoaded", async () => {
  console.log("[v0] MathPro Engineering - Inicializando aplicación...");

  try {
    // Cargar progreso primero
    loadUserProgress();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Intentar cargar Pyodide después de que todo esté listo
    setTimeout(() => {
      initializePyodide();
    }, 1000);
    
    showNotification("¡Aplicación cargada exitosamente!", "success");
  } catch (error) {
    console.error("[v0] Error inicializando aplicación:", error);
    showNotification("Error cargando la aplicación. Algunas funciones pueden no estar disponibles.", "error");
  }
});

// Initialize Pyodide for Python integration
async function initializePyodide() {
  try {
    console.log("[v0] Iniciando carga de Pyodide...");

    // Solo cargar Pyodide si no está ya cargado
    if (window.pyodide) {
      console.log("[v0] Pyodide ya está cargado");
      return;
    }

    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
    });
    
    console.log("[v0] Pyodide cargado exitosamente");

    // Cargar módulos Python básicos
    await pyodide.loadPackage(["micropip"]);
    
    console.log("[v0] Módulos Python cargados exitosamente");
    window.pythonDisponible = true;

    const indicator = document.getElementById("pythonIndicator");
    if (indicator) {
      indicator.textContent = "🐍 Python Activo";
      indicator.style.color = "#10b981";
    }
    
    showNotification("Motor Python cargado correctamente", "success");
  } catch (error) {
    console.error("[v0] Error cargando Pyodide:", error);
    activarModoFallback();
  }
}

function activarModoFallback() {
  console.log("[v0] Activando modo fallback sin Python");
  window.pythonDisponible = false;

  const indicator = document.getElementById("pythonIndicator");
  if (indicator) {
    indicator.textContent = "⚡ Modo Básico";
    indicator.style.color = "#f59e0b";
  }

  // Definir ejercicios básicos en JavaScript
  window.ejerciciosFallback = {
    conjuntos_numericos: [
      {
        pregunta: "¿Cuál es el resultado de 15 + 23?",
        respuesta: "38",
        explicacion: "15 + 23 = 38. Suma directa de números naturales.",
        tipo: "suma",
      },
      {
        pregunta: "¿Cuál es el resultado de 45 - 17?",
        respuesta: "28",
        explicacion: "45 - 17 = 28. Resta de números naturales.",
        tipo: "resta",
      },
      {
        pregunta: "¿Cuál es el resultado de 7 × 8?",
        respuesta: "56",
        explicacion: "7 × 8 = 56. Multiplicación básica.",
        tipo: "multiplicacion",
      },
    ],
    numeros_primos: [
      {
        pregunta: "¿Es 17 un número primo? (responde 'si' o 'no')",
        respuesta: "si",
        explicacion: "17 es primo porque solo es divisible por 1 y por sí mismo.",
        tipo: "primo",
      },
      {
        pregunta: "¿Cuál es el MCD de 12 y 18?",
        respuesta: "6",
        explicacion: "MCD(12,18) = 6. Los divisores comunes son 1, 2, 3, 6.",
        tipo: "mcd",
      },
      {
        pregunta: "¿Es 21 un número primo? (responde 'si' o 'no')",
        respuesta: "no",
        explicacion: "21 no es primo porque es divisible por 3 y 7.",
        tipo: "primo",
      },
    ],
    fraccionarios: [
      {
        pregunta: "¿Cuál es el resultado de 1/2 + 1/4? (formato: numerador/denominador)",
        respuesta: "3/4",
        explicacion: "1/2 + 1/4 = 2/4 + 1/4 = 3/4",
        tipo: "suma_fracciones",
      },
      {
        pregunta: "¿Cuál es el resultado de 2/3 × 3/4? (formato: numerador/denominador)",
        respuesta: "1/2",
        explicacion: "2/3 × 3/4 = 6/12 = 1/2",
        tipo: "multiplicacion_fracciones",
      },
    ],
    potenciacion_radicacion: [
      {
        pregunta: "¿Cuál es el resultado de 2³?",
        respuesta: "8",
        explicacion: "2³ = 2 × 2 × 2 = 8",
        tipo: "potencia",
      },
      {
        pregunta: "¿Cuál es el resultado de √16?",
        respuesta: "4",
        explicacion: "√16 = 4 porque 4² = 16",
        tipo: "raiz_cuadrada",
      },
      {
        pregunta: "¿Cuál es el resultado de 3²?",
        respuesta: "9",
        explicacion: "3² = 3 × 3 = 9",
        tipo: "potencia",
      },
    ],
  };
  
  showNotification("Modo básico activado - Funcionalidades limitadas", "info");
}

async function generateExercise(topic) {
  try {
    console.log(`[v0] Generando ejercicio para tema: ${topic}`);
    let ejercicio;

    // Siempre usar modo fallback por ahora para evitar problemas con Pyodide
    console.log("[v0] Usando modo fallback para generar ejercicio");
    const topicKey = topic; // Usar el topic directamente
    
    const ejerciciosDisponibles = window.ejerciciosFallback[topicKey] || window.ejerciciosFallback.conjuntos_numericos;
    ejercicio = ejerciciosDisponibles[Math.floor(Math.random() * ejerciciosDisponibles.length)];
    console.log("[v0] Ejercicio generado con fallback:", ejercicio);

    currentExercise = ejercicio;

    // Update UI
    document.getElementById("exerciseTitle").textContent = `${getTopicName(topic)} - Ejercicio`;
    document.getElementById("exerciseContent").innerHTML = `
      <div class="exercise-question">
        <h4>Pregunta:</h4>
        <p>${currentExercise.pregunta}</p>
      </div>
    `;
    document.getElementById("answerInput").value = "";
    document.getElementById("feedback").style.display = "none";

    console.log("[v0] UI actualizada con nuevo ejercicio");
  } catch (error) {
    console.error("[v0] Error generando ejercicio:", error);
    showNotification("Error al generar ejercicio", "error");

    // Fallback más robusto
    currentExercise = {
      pregunta: "¿Cuál es el resultado de 5 + 3?",
      respuesta: "8",
      explicacion: "5 + 3 = 8. Suma básica.",
      tipo: "suma",
    };

    document.getElementById("exerciseTitle").textContent = "Ejercicio Básico";
    document.getElementById("exerciseContent").innerHTML = `
      <div class="exercise-question">
        <h4>Pregunta:</h4>
        <p>${currentExercise.pregunta}</p>
      </div>
    `;
  }
}

function checkAnswer() {
  if (!currentExercise) {
    console.log("[v0] No hay ejercicio actual");
    showNotification("No hay ejercicio activo", "error");
    return;
  }

  const userAnswer = document.getElementById("answerInput").value.trim();
  if (!userAnswer) {
    showNotification("Por favor ingresa una respuesta", "error");
    return;
  }

  const correctAnswer = currentExercise.respuesta;
  const feedback = document.getElementById("feedback");

  console.log(`[v0] Verificando respuesta: "${userAnswer}" vs "${correctAnswer}"`);

  let isCorrect = false;

  // Comparación de respuestas (case insensitive para texto)
  if (typeof correctAnswer === 'string') {
    isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
  } else {
    // Para números, comparar como strings también
    isCorrect = userAnswer === correctAnswer.toString();
  }

  console.log(`[v0] Respuesta ${isCorrect ? "correcta" : "incorrecta"}`);

  feedback.style.display = "block";
  feedback.className = `feedback ${isCorrect ? "correct" : "incorrect"}`;

  if (isCorrect) {
    feedback.innerHTML = `
      <strong>¡Correcto!</strong><br>
      ${currentExercise.explicacion}
    `;
    updateProgress(currentTopic, true);
    showNotification("¡Respuesta correcta! 🎉", "success");
  } else {
    feedback.innerHTML = `
      <strong>Incorrecto.</strong><br>
      La respuesta correcta es: ${correctAnswer}<br>
      ${currentExercise.explicacion}
    `;
    updateProgress(currentTopic, false);
    showNotification("Respuesta incorrecta. Sigue intentando 💪", "error");
  }
}

// Show study mode for a topic
function showStudyMode(topic) {
  console.log(`[v0] Mostrando modo estudio para: ${topic}`);

  // Hide topic selection
  document.getElementById("topicSelection").style.display = "none";

  // Show study interface
  const studyInterface = document.getElementById("studyInterface");
  studyInterface.style.display = "block";

  // Update buttons with topic data
  const studyBtn = document.getElementById("studyBtn");
  const examBtn = document.getElementById("examBtn");

  if (studyBtn) {
    studyBtn.dataset.topic = topic;
    studyBtn.textContent = `📚 Estudiar ${getTopicName(topic)}`;
  }

  if (examBtn) {
    examBtn.dataset.topic = topic;
    examBtn.textContent = `📝 Examen de ${getTopicName(topic)}`;
  }

  // Update title
  document.getElementById("studyTitle").textContent = getTopicName(topic);
  
  // Actualizar currentTopic
  currentTopic = topic;
}

// Start study mode
function startStudyMode(topic) {
  console.log(`[v0] Iniciando modo estudio: ${topic}`);

  // Hide study interface
  document.getElementById("studyInterface").style.display = "none";

  // Show exercise interface
  const exerciseInterface = document.getElementById("exerciseInterface");
  exerciseInterface.style.display = "block";

  // Set topic for buttons
  const nextBtn = document.getElementById("nextExercise");
  if (nextBtn) {
    nextBtn.dataset.topic = topic;
  }

  // Generate first exercise
  generateExercise(topic);

  // Update current topic
  currentTopic = topic;
}

// Start exam mode
function startExamMode(topic) {
  console.log(`[v0] Iniciando modo examen: ${topic}`);
  showNotification("Función de examen en desarrollo. Usando modo estudio por ahora.", "info");

  // For now, just start study mode
  startStudyMode(topic);
}

// Show topic selection
function showTopicSelection() {
  console.log("[v0] Mostrando selección de temas");

  // Hide all interfaces
  document.getElementById("studyInterface").style.display = "none";
  document.getElementById("exerciseInterface").style.display = "none";

  // Show topic selection
  document.getElementById("topicSelection").style.display = "block";

  // Reset current exercise
  currentExercise = null;
  currentTopic = null;

  // Update progress display
  loadUserProgress();
  updateProgressBars();
}

// Hacer funciones globales para que estén disponibles en los onclick del HTML
window.showStudyMode = showStudyMode;
window.startStudyMode = startStudyMode;
window.startExamMode = startExamMode;
window.showTopicSelection = showTopicSelection;
window.generateExercise = generateExercise;
window.checkAnswer = checkAnswer;
window.showNotification = showNotification;
