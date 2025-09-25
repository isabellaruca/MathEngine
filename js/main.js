// --- Variables Globales ---
let pyodide = null
let currentExercise = null
const currentExam = null
let currentTopic = null
const userProgress = JSON.parse(localStorage.getItem("mathpro-progress")) || {}
window.pythonDisponible = false // Variable global para el indicador de estado

// Import Pyodide
const { loadPyodide } = window

// --- Función Principal de Inicialización ---
async function main() {
  const pythonIndicator = document.getElementById("pythonIndicator")
  try {
    console.log("[v0] Cargando Pyodide...")
    pythonIndicator.textContent = "🔄 Cargando Pyodide..."
    pyodide = await loadPyodide()

    console.log("[v0] Cargando archivos de Python...")
    pythonIndicator.textContent = "🐍 Cargando Módulos..."

    // Obtenemos el contenido de los archivos .py
    const aritmeticaPy = await fetch("./py/aritmetica.py").then((res) => res.text())
    const generadorPy = await fetch("./py/generador.py").then((res) => res.text())

    // Ejecutamos el código Python en el entorno de Pyodide
    pyodide.runPython(aritmeticaPy)
    console.log("[v0] Módulo 'aritmetica.py' cargado.")
    pyodide.runPython(generadorPy)
    console.log("[v0] Módulo 'generador.py' cargado.")

    // Marcamos Python como listo y activamos la UI
    window.pythonDisponible = true
    pythonIndicator.textContent = "🐍 Python Activo"
    console.log("[v0] ¡Entorno de Python listo!")

    enableUI()
  } catch (error) {
    console.error("[v0] Error al cargar el entorno de Python:", error)
    pythonIndicator.textContent = "⚡ Modo Básico (Error)"
    window.pythonDisponible = false
  }
}

// --- Lógica de la Aplicación ---

function enableUI() {
  // Activa los botones y otros elementos interactivos
  document.querySelectorAll(".topic-card, .btn").forEach((el) => {
    el.classList.remove("disabled")
    el.disabled = false
  })
  console.log("[v0] Interfaz de usuario habilitada.")
}

function getTopicName(topicId) {
  const names = {
    conjuntos_numericos: "Conjuntos Numéricos",
    numeros_primos: "Números Primos",
    fraccionarios: "Fraccionarios",
    potenciacion_radicacion: "Potenciación y Radicación",
  }
  return names[topicId] || topicId
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message
  document.body.appendChild(notification)
  setTimeout(() => {
    notification.remove()
  }, 3000)
}

// --- Funciones de la Interfaz ---

function showStudyMode(topic) {
  console.log(`[v0] Mostrando modo de estudio para: ${topic}`)
  document.getElementById("topicSelection").style.display = "none"
  const studyInterface = document.getElementById("studyInterface")
  studyInterface.style.display = "block"

  document.getElementById("studyTitle").textContent = getTopicName(topic)
  document.getElementById("practiceBtn").onclick = () => startStudyMode(topic)
  document.getElementById("examBtn").onclick = () => startExamMode(topic)
}

function startStudyMode(topic) {
  console.log(`[v0] Iniciando modo estudio: ${topic}`)
  currentTopic = topic
  document.getElementById("studyInterface").style.display = "none"
  document.getElementById("exerciseInterface").style.display = "block"
  document.getElementById("backToTopicsBtn").style.display = "block"
  document.getElementById("backToStudyModeBtn").style.display = "none"

  generateExercise(topic)
}

async function generateExercise(topic) {
  if (!pyodide) {
    showNotification("El entorno de Python no está listo.", "error")
    return
  }
  console.log(`[v0] Generando ejercicio para: ${topic}`)
  try {
    const generar = pyodide.globals.get("generar_ejercicio_tema")
    const exerciseData = generar(topic, "medio").toJs()

    currentExercise = Object.fromEntries(exerciseData)

    document.getElementById("exerciseQuestion").textContent = currentExercise.pregunta
    document.getElementById("userAnswer").value = ""
    document.getElementById("feedback").innerHTML = ""

    generar.destroy()
  } catch (error) {
    console.error("Error al generar ejercicio:", error)
    showNotification("No se pudo generar el ejercicio.", "error")
  }
}

function checkAnswer() {
  if (!currentExercise) return

  const userAnswer = document.getElementById("userAnswer").value.trim()
  const feedbackEl = document.getElementById("feedback")

  if (userAnswer == currentExercise.respuesta) {
    feedbackEl.innerHTML = `<p class="correct">✅ ¡Correcto!</p><p><strong>Explicación:</strong> ${currentExercise.explicacion}</p>`
    showNotification("¡Respuesta Correcta!", "success")
  } else {
    feedbackEl.innerHTML = `<p class="incorrect">❌ Incorrecto. La respuesta correcta es: <strong>${currentExercise.respuesta}</strong></p><p><strong>Explicación:</strong> ${currentExercise.explicacion}</p>`
    showNotification("Inténtalo de nuevo.", "error")
  }
}

function showTopicSelection() {
  console.log("[v0] Mostrando selección de temas")
  document.getElementById("studyInterface").style.display = "none"
  document.getElementById("exerciseInterface").style.display = "none"
  document.getElementById("topicSelection").style.display = "block"
  currentExercise = null
  currentTopic = null
}

// --- Event Listeners ---

function setupEventListeners() {
  console.log("[v0] Configurando listeners de eventos...")

  document.querySelectorAll(".topic-card").forEach((card) => {
    card.addEventListener("click", () => {
      if (window.pythonDisponible) {
        const topic = card.dataset.topic
        showStudyMode(topic)
      } else {
        showNotification("El entorno de Python aún no está listo.", "info")
      }
    })
  })

  document.getElementById("checkAnswer").addEventListener("click", checkAnswer)
  document.getElementById("nextExercise").addEventListener("click", () => {
    if (currentTopic) generateExercise(currentTopic)
  })

  document.getElementById("backToTopicsBtn").addEventListener("click", showTopicSelection)
}

// --- Punto de Entrada ---
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".topic-card, .btn").forEach((el) => {
    el.classList.add("disabled")
    el.disabled = true
  })

  setupEventListeners()
  main()
})

function startExamMode(topic) {
  console.log(`[v0] Iniciando modo examen: ${topic}`)
  showNotification("Función de examen en desarrollo.", "info")
  startStudyMode(topic)
}
