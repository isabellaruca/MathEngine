// --- Variables Globales ---
let pyodide = null
let currentExercise = null
const currentExam = null
let currentTopic = null
const userProgress = JSON.parse(localStorage.getItem("mathpro-progress")) || {}
window.pythonDisponible = false // Variable global para el indicador de estado

// --- Función Principal de Inicialización ---
async function main() {
  const pythonIndicator = document.getElementById("pythonIndicator")

  console.log("[v0] Iniciando carga de Python...")
  console.log("[v0] Verificando disponibilidad de loadPyodide:", typeof window.loadPyodide)

  try {
    if (typeof window.loadPyodide === "undefined") {
      throw new Error(
        "loadPyodide no está disponible. Verifica que el script de Pyodide se haya cargado correctamente.",
      )
    }

    console.log("[v0] Cargando Pyodide...")
    pythonIndicator.textContent = "🔄 Cargando Pyodide..."
    pyodide = await window.loadPyodide()
    console.log("[v0] Pyodide cargado exitosamente")

    console.log("[v0] Intentando cargar archivos de Python...")
    pythonIndicator.textContent = "🐍 Cargando Módulos..."

    console.log("[v0] Verificando archivo aritmetica.py...")
    const aritmeticaResponse = await fetch("./py/aritmetica.py")
    console.log("[v0] Respuesta aritmetica.py:", aritmeticaResponse.status, aritmeticaResponse.statusText)

    if (!aritmeticaResponse.ok) {
      throw new Error(`No se pudo cargar aritmetica.py: ${aritmeticaResponse.status} ${aritmeticaResponse.statusText}`)
    }

    const aritmeticaPy = await aritmeticaResponse.text()
    console.log("[v0] Contenido de aritmetica.py cargado, longitud:", aritmeticaPy.length)

    console.log("[v0] Verificando archivo generador.py...")
    const generadorResponse = await fetch("./py/generador.py")
    console.log("[v0] Respuesta generador.py:", generadorResponse.status, generadorResponse.statusText)

    if (!generadorResponse.ok) {
      throw new Error(`No se pudo cargar generador.py: ${generadorResponse.status} ${generadorResponse.statusText}`)
    }

    const generadorPy = await generadorResponse.text()
    console.log("[v0] Contenido de generador.py cargado, longitud:", generadorPy.length)

    console.log("[v0] Ejecutando aritmetica.py...")
    try {
      pyodide.runPython(aritmeticaPy)
      console.log("[v0] Módulo 'aritmetica.py' ejecutado exitosamente")
    } catch (pythonError) {
      console.error("[v0] Error al ejecutar aritmetica.py:", pythonError)
      throw new Error(`Error en aritmetica.py: ${pythonError.message}`)
    }

    console.log("[v0] Registrando módulo 'aritmetica' en sys.modules...")
    const aritmeticaJson = JSON.stringify(aritmeticaPy)
    try {
      pyodide.runPython(`
import types, sys
mod = types.ModuleType("aritmetica")
exec(${aritmeticaJson}, mod.__dict__)
sys.modules["aritmetica"] = mod
`)
      console.log("[v0] Módulo 'aritmetica' registrado exitosamente en sys.modules")
    } catch (moduleError) {
      console.error("[v0] Error al registrar módulo aritmetica:", moduleError)
      throw new Error(`Error al registrar módulo aritmetica: ${moduleError.message}`)
    }

    console.log("[v0] Ejecutando generador.py...")
    try {
      pyodide.runPython(generadorPy)
      console.log("[v0] Módulo 'generador.py' ejecutado exitosamente")
    } catch (pythonError) {
      console.error("[v0] Error al ejecutar generador.py:", pythonError)
      throw new Error(`Error en generador.py: ${pythonError.message}`)
    }

    console.log("[v0] Verificando funciones Python disponibles...")
    try {
      const generar = pyodide.globals.get("generar_ejercicio_tema")
      if (!generar) {
        throw new Error("La función 'generar_ejercicio_tema' no está disponible")
      }
      console.log("[v0] Función 'generar_ejercicio_tema' encontrada")
      generar.destroy()
    } catch (verifyError) {
      console.error("[v0] Error al verificar funciones Python:", verifyError)
      throw verifyError
    }

    // Marcamos Python como listo y activamos la UI
    window.pythonDisponible = true
    pythonIndicator.textContent = "🐍 Python Activo"
    console.log("[v0] ¡Entorno de Python completamente listo!")

    enableUI()
  } catch (error) {
    console.error("[v0] Error detallado al cargar el entorno de Python:", error)
    console.error("[v0] Stack trace:", error.stack)
    pythonIndicator.textContent = "⚡ Modo Básico (Error)"
    window.pythonDisponible = false

    showNotification(`Error de Python: ${error.message}`, "error")
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
  console.log(`[v0] Generando ejercicio para tema: ${topic}`)

  if (!pyodide) {
    console.log("[v0] Pyodide no está disponible, usando modo fallback")
    showNotification("El entorno de Python no está listo.", "error")
    return
  }

  try {
    console.log("[v0] Verificando función generar_ejercicio_tema...")
    const generar = pyodide.globals.get("generar_ejercicio_tema")

    if (!generar) {
      console.error("[v0] La función 'generar_ejercicio_tema' no está disponible")
      throw new Error("Función Python no disponible")
    }

    console.log("[v0] Función encontrada, generando ejercicio...")
    const exerciseData = generar(topic, "medio")

    let exerciseObj
    if (exerciseData && typeof exerciseData.toJs === "function") {
      exerciseObj = Object.fromEntries(exerciseData.toJs())
    } else {
      // Si no es un dict de Python, intentar usar directamente
      exerciseObj = exerciseData
    }

    console.log("[v0] Ejercicio generado:", exerciseObj)
    currentExercise = exerciseObj

    if (!currentExercise || !currentExercise.pregunta) {
      throw new Error("El ejercicio generado no tiene el formato correcto")
    }

    document.getElementById("exerciseQuestion").textContent = currentExercise.pregunta
    document.getElementById("userAnswer").value = ""
    document.getElementById("feedback").innerHTML = ""

    generar.destroy()
    console.log("[v0] Ejercicio mostrado exitosamente")
  } catch (error) {
    console.error("[v0] Error generando ejercicio:", error)
    console.log("[v0] Usando modo fallback para generar ejercicio")

    const fallbackExercises = {
      conjuntos_numericos: [
        {
          pregunta: "¿Cuál es el resultado de 15 + 23?",
          respuesta: "38",
          explicacion: "15 + 23 = 38. Suma básica de números naturales.",
        },
        {
          pregunta: "¿Es el número 17 primo? (Responde 'si' o 'no')",
          respuesta: "si",
          explicacion: "17 es primo porque solo es divisible por 1 y 17.",
        },
        {
          pregunta: "¿Cuál es el valor absoluto de -12?",
          respuesta: "12",
          explicacion: "|-12| = 12. El valor absoluto es la distancia al cero.",
        },
      ],
      numeros_primos: [
        {
          pregunta: "¿Es 21 un número primo? (Responde 'si' o 'no')",
          respuesta: "no",
          explicacion: "21 no es primo porque es divisible por 1, 3, 7 y 21.",
        },
        {
          pregunta: "¿Cuál es el MCD de 12 y 18?",
          respuesta: "6",
          explicacion: "MCD(12, 18) = 6. Es el mayor divisor común.",
        },
      ],
      fraccionarios: [
        {
          pregunta: "¿Cuál es el resultado de 1/2 + 1/4?",
          respuesta: "3/4",
          explicacion: "1/2 + 1/4 = 2/4 + 1/4 = 3/4",
        },
        {
          pregunta: "Simplifica la fracción 6/8",
          respuesta: "3/4",
          explicacion: "6/8 = 3/4 (dividimos numerador y denominador por 2)",
        },
      ],
      potenciacion_radicacion: [
        {
          pregunta: "¿Cuál es el resultado de 3^4?",
          respuesta: "81",
          explicacion: "3^4 = 3 × 3 × 3 × 3 = 81",
        },
        {
          pregunta: "¿Cuál es la raíz cuadrada de 64?",
          respuesta: "8",
          explicacion: "√64 = 8 porque 8² = 64",
        },
      ],
    }

    const exercises = fallbackExercises[topic] || fallbackExercises.conjuntos_numericos
    const randomExercise = exercises[Math.floor(Math.random() * exercises.length)]

    currentExercise = randomExercise
    document.getElementById("exerciseQuestion").textContent = currentExercise.pregunta
    document.getElementById("userAnswer").value = ""
    document.getElementById("feedback").innerHTML = ""

    showNotification("Usando ejercicios básicos (Python no disponible)", "info")
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
  document.getElementById("backToTopicsFromStudy").addEventListener("click", showTopicSelection)
}

// --- Punto de Entrada ---
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] DOM cargado, iniciando aplicación...")

  const pythonIndicator = document.getElementById("pythonIndicator")
  if (!pythonIndicator) {
    console.error("[v0] ERROR: No se encontró el elemento pythonIndicator")
  }

  const topicCards = document.querySelectorAll(".topic-card")
  console.log("[v0] Tarjetas de temas encontradas:", topicCards.length)

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
