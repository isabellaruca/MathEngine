// Global variables
let pyodide = null
let currentTopic = null
let currentExercise = null
const userProgress = JSON.parse(localStorage.getItem("mathpro-progress")) || {}

// Import loadPyodide function
const { loadPyodide } = window

// Initialize the application
document.addEventListener("DOMContentLoaded", async () => {
  console.log("MathPro Engineering - Inicializando aplicación...")

  try {
    await initializePyodide()
    loadUserProgress()
    setupEventListeners()
    showNotification("¡Aplicación cargada exitosamente!", "success")
  } catch (error) {
    console.error("Error inicializando aplicación:", error)
    showNotification("Error cargando la aplicación. Algunas funciones pueden no estar disponibles.", "error")
  }
})

// Initialize Pyodide for Python integration
async function initializePyodide() {
  try {
    console.log("Cargando Pyodide...")

    const loadPromise = loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
    })

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout cargando Pyodide")), 15000),
    )

    pyodide = await Promise.race([loadPromise, timeoutPromise])

    await pyodide.runPython(`
      import sys
      import math
      import random
      from fractions import Fraction
      import json
      
      # Definir todas las funciones matemáticas directamente
      class ConjuntosNumericos:
          @staticmethod
          def es_natural(n):
              return isinstance(n, int) and n > 0
          
          @staticmethod
          def es_entero(n):
              return isinstance(n, int)
          
          @staticmethod
          def es_racional(n):
              try:
                  Fraction(n)
                  return True
              except:
                  return False
      
      class NumerosPrimos:
          @staticmethod
          def es_primo(n):
              if n < 2:
                  return False
              for i in range(2, int(n**0.5) + 1):
                  if n % i == 0:
                      return False
              return True
          
          @staticmethod
          def mcd(a, b):
              while b:
                  a, b = b, a % b
              return a
          
          @staticmethod
          def mcm(a, b):
              return abs(a * b) // NumerosPrimos.mcd(a, b)
      
      class Fraccionarios:
          @staticmethod
          def sumar_fracciones(num1, den1, num2, den2):
              den_comun = NumerosPrimos.mcm(den1, den2)
              num_resultado = (num1 * den_comun // den1) + (num2 * den_comun // den2)
              mcd_resultado = NumerosPrimos.mcd(num_resultado, den_comun)
              return num_resultado // mcd_resultado, den_comun // mcd_resultado
      
      class Potenciacion:
          @staticmethod
          def potencia(base, exponente):
              return base ** exponente
          
          @staticmethod
          def raiz_cuadrada(n):
              return n ** 0.5
      
      # Generador de ejercicios mejorado
      def generar_ejercicio_basico(tema):
          if tema == 'conjuntos' or tema == 'conjuntos_numericos':
              tipo = random.choice(['suma', 'resta', 'multiplicacion'])
              if tipo == 'suma':
                  a, b = random.randint(1, 50), random.randint(1, 50)
                  return {
                      'pregunta': f'¿Cuál es el resultado de {a} + {b}?',
                      'respuesta': a + b,
                      'explicacion': f'{a} + {b} = {a + b}',
                      'tipo': 'suma'
                  }
              elif tipo == 'resta':
                  a, b = random.randint(20, 100), random.randint(1, 19)
                  return {
                      'pregunta': f'¿Cuál es el resultado de {a} - {b}?',
                      'respuesta': a - b,
                      'explicacion': f'{a} - {b} = {a - b}',
                      'tipo': 'resta'
                  }
              else:
                  a, b = random.randint(2, 12), random.randint(2, 12)
                  return {
                      'pregunta': f'¿Cuál es el resultado de {a} × {b}?',
                      'respuesta': a * b,
                      'explicacion': f'{a} × {b} = {a * b}',
                      'tipo': 'multiplicacion'
                  }
          
          elif tema == 'primos' or tema == 'numeros_primos':
              tipo = random.choice(['identificar_primo', 'mcd', 'mcm'])
              if tipo == 'identificar_primo':
                  numero = random.choice([7, 11, 13, 17, 19, 23, 29, 8, 9, 10, 12, 15, 16, 18])
                  es_primo = NumerosPrimos.es_primo(numero)
                  return {
                      'pregunta': f'¿Es {numero} un número primo? (1 para sí, 0 para no)',
                      'respuesta': 1 if es_primo else 0,
                      'explicacion': f'{numero} {"es" if es_primo else "no es"} primo',
                      'tipo': 'identificar_primo'
                  }
              elif tipo == 'mcd':
                  a, b = random.randint(6, 24), random.randint(6, 24)
                  resultado = NumerosPrimos.mcd(a, b)
                  return {
                      'pregunta': f'¿Cuál es el MCD de {a} y {b}?',
                      'respuesta': resultado,
                      'explicacion': f'MCD({a}, {b}) = {resultado}',
                      'tipo': 'mcd'
                  }
              else:
                  a, b = random.randint(3, 8), random.randint(3, 8)
                  resultado = NumerosPrimos.mcm(a, b)
                  return {
                      'pregunta': f'¿Cuál es el MCM de {a} y {b}?',
                      'respuesta': resultado,
                      'explicacion': f'MCM({a}, {b}) = {resultado}',
                      'tipo': 'mcm'
                  }
          
          elif tema == 'fraccionarios':
              tipo = random.choice(['suma_fracciones', 'simplificacion'])
              if tipo == 'suma_fracciones':
                  num1, den1 = random.randint(1, 5), random.randint(2, 8)
                  num2, den2 = random.randint(1, 5), random.randint(2, 8)
                  num_res, den_res = Fraccionarios.sumar_fracciones(num1, den1, num2, den2)
                  return {
                      'pregunta': f'¿Cuál es el resultado de {num1}/{den1} + {num2}/{den2}? (formato: numerador/denominador)',
                      'respuesta': f'{num_res}/{den_res}',
                      'explicacion': f'{num1}/{den1} + {num2}/{den2} = {num_res}/{den_res}',
                      'tipo': 'suma_fracciones'
                  }
              else:
                  num = random.randint(2, 12)
                  den = random.randint(4, 16)
                  mcd = NumerosPrimos.mcd(num, den)
                  if mcd > 1:
                      return {
                          'pregunta': f'Simplifica la fracción {num}/{den} (formato: numerador/denominador)',
                          'respuesta': f'{num//mcd}/{den//mcd}',
                          'explicacion': f'{num}/{den} = {num//mcd}/{den//mcd} (dividiendo por {mcd})',
                          'tipo': 'simplificacion'
                      }
                  else:
                      return generar_ejercicio_basico('fraccionarios')
          
          else:  # potenciacion_radicacion
              tipo = random.choice(['potencia', 'raiz_cuadrada'])
              if tipo == 'potencia':
                  base = random.randint(2, 6)
                  exp = random.randint(2, 4)
                  resultado = Potenciacion.potencia(base, exp)
                  return {
                      'pregunta': f'¿Cuál es el resultado de {base}^{exp}?',
                      'respuesta': resultado,
                      'explicacion': f'{base}^{exp} = {resultado}',
                      'tipo': 'potencia'
                  }
              else:
                  numeros_cuadrados = [4, 9, 16, 25, 36, 49, 64, 81, 100]
                  numero = random.choice(numeros_cuadrados)
                  resultado = int(Potenciacion.raiz_cuadrada(numero))
                  return {
                      'pregunta': f'¿Cuál es el resultado de √{numero}?',
                      'respuesta': resultado,
                      'explicacion': f'√{numero} = {resultado}',
                      'tipo': 'raiz_cuadrada'
                  }
      
      # Generador de exámenes
      def generar_examen_tema(tema, num_preguntas, dificultad):
          examen = []
          for i in range(num_preguntas):
              ejercicio = generar_ejercicio_basico(tema)
              ejercicio['numero'] = i + 1
              ejercicio['tema'] = tema
              ejercicio['dificultad'] = dificultad
              examen.append(ejercicio)
          return examen
      
      # Evaluador de exámenes
      def evaluar_examen(examen_data, respuestas_data):
          correctas = 0
          total = len(examen_data)
          detalles = []
          
          for i, (pregunta, respuesta) in enumerate(zip(examen_data, respuestas_data)):
              respuesta_correcta = str(pregunta['respuesta']).lower().strip()
              respuesta_usuario = respuesta.lower().strip()
              
              # Comparación inteligente
              es_correcta = False
              try:
                  if '/' in respuesta_correcta and '/' in respuesta_usuario:
                      # Comparar fracciones
                      es_correcta = respuesta_correcta == respuesta_usuario
                  else:
                      # Comparar números
                      num_correcta = float(respuesta_correcta)
                      num_usuario = float(respuesta_usuario)
                      es_correcta = abs(num_correcta - num_usuario) < 0.01
              except:
                  es_correcta = respuesta_correcta == respuesta_usuario
              
              if es_correcta:
                  correctas += 1
              
              detalles.append({
                  'numero': i + 1,
                  'pregunta': pregunta['pregunta'],
                  'respuesta_usuario': respuesta,
                  'respuesta_correcta': pregunta['respuesta'],
                  'es_correcta': es_correcta,
                  'explicacion': pregunta['explicacion'],
                  'pasos': [],
                  'puntos': 1 if es_correcta else 0,
                  'tipo': pregunta.get('tipo', 'basico')
              })
          
          porcentaje = (correctas / total) * 100 if total > 0 else 0
          
          # Generar recomendaciones
          recomendaciones = []
          if porcentaje < 60:
              recomendaciones.append("Revisa los conceptos básicos del tema")
              recomendaciones.append("Practica más ejercicios similares")
          elif porcentaje < 80:
              recomendaciones.append("Buen progreso, continúa practicando")
              recomendaciones.append("Enfócate en los tipos de ejercicios donde tuviste errores")
          else:
              recomendaciones.append("¡Excelente trabajo!")
              recomendaciones.append("Puedes intentar ejercicios de mayor dificultad")
          
          return {
              'correctas': correctas,
              'incorrectas': total - correctas,
              'total': total,
              'porcentaje': porcentaje,
              'puntos_obtenidos': correctas,
              'puntos_totales': total,
              'calificacion': 'Excelente' if porcentaje >= 90 else 'Bueno' if porcentaje >= 70 else 'Regular',
              'nivel_dominio': 'Avanzado' if porcentaje >= 90 else 'Intermedio' if porcentaje >= 70 else 'Básico',
              'detalles': detalles,
              'recomendaciones': recomendaciones
          }
      
      print("Módulos Python cargados exitosamente")
    `)

    console.log("Pyodide cargado exitosamente")
    window.pythonDisponible = true

    const loadingElement = document.querySelector(".loading-status")
    if (loadingElement) {
      loadingElement.textContent = "Python cargado correctamente"
      loadingElement.style.color = "#4ade80"
    }
  } catch (error) {
    console.error("Error cargando Pyodide:", error)
    activarModoFallback()
  }
}

function activarModoFallback() {
  console.log("Activando modo fallback sin Python")
  window.pythonDisponible = false

  // Definir ejercicios básicos en JavaScript
  window.ejerciciosFallback = {
    conjuntos: [
      {
        pregunta: "¿Cuál es el resultado de 15 + 23?",
        respuesta: 38,
        explicacion: "15 + 23 = 38. Suma directa de números naturales.",
      },
      {
        pregunta: "¿Cuál es el resultado de 45 - 17?",
        respuesta: 28,
        explicacion: "45 - 17 = 28. Resta de números naturales.",
      },
    ],
    primos: [
      {
        pregunta: "¿Es 17 un número primo? (1 para sí, 0 para no)",
        respuesta: 1,
        explicacion: "17 es primo porque solo es divisible por 1 y por sí mismo.",
      },
      {
        pregunta: "¿Cuál es el MCD de 12 y 18?",
        respuesta: 6,
        explicacion: "MCD(12,18) = 6. Los divisores comunes son 1, 2, 3, 6.",
      },
    ],
    fraccionarios: [
      {
        pregunta: "¿Cuál es el resultado de 1/2 + 1/3? (como decimal con 2 decimales)",
        respuesta: 0.83,
        explicacion: "1/2 + 1/3 = 3/6 + 2/6 = 5/6 ≈ 0.83",
      },
    ],
    potenciacion: [
      {
        pregunta: "¿Cuál es el resultado de 2³?",
        respuesta: 8,
        explicacion: "2³ = 2 × 2 × 2 = 8",
      },
      {
        pregunta: "¿Cuál es el resultado de √16?",
        respuesta: 4,
        explicacion: "√16 = 4 porque 4² = 16",
      },
    ],
  }
}

// Setup event listeners
function setupEventListeners() {
  // Navigation
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const target = this.getAttribute("href").substring(1)
      navigateToSection(target)
    })
  })

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    const modal = document.getElementById("exerciseModal")
    if (e.target === modal) {
      closeModal()
    }
  })

  // Enter key in answer input
  document.getElementById("answerInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      checkAnswer()
    }
  })

  // Setup intersection observer for nav highlighting
  setupIntersectionObserver()

  // Setup keyboard support for modals
  setupModalKeyboardSupport()

  // Setup topic card hover effects
  setupTopicCardEffects()
}

// Navigation functions
function navigateToSection(sectionId) {
  // Update active nav link
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active")
  })

  const targetLink = document.querySelector(`[href="#${sectionId}"]`)
  if (targetLink) {
    targetLink.classList.add("active")
  }

  // Scroll to section with offset for fixed navbar
  const targetSection = document.getElementById(sectionId)
  if (targetSection) {
    const navbarHeight = document.querySelector(".navbar").offsetHeight
    const targetPosition = targetSection.offsetTop - navbarHeight - 20

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    })
  }
}

function startLearning() {
  navigateToSection("topics")
}

function showDemo() {
  openTopic("conjuntos")
}

// Topic management
function openTopic(topicName) {
  currentTopic = topicName

  // Add loading animation
  showLoadingState()

  // Generate exercise with delay for smooth UX
  setTimeout(() => {
    generateExercise(topicName)
    hideLoadingState()
    document.getElementById("exerciseModal").style.display = "block"

    // Focus on answer input for better UX
    setTimeout(() => {
      document.getElementById("answerInput").focus()
    }, 300)
  }, 500)
}

// Exercise generation and management
async function generateExercise(topic) {
  try {
    let ejercicio

    if (pyodide && window.pythonDisponible !== false) {
      const pythonCode = `
def generate_exercise_safe(topic):
    try:
        if topic == 'conjuntos':
            return generar_ejercicio_basico('conjuntos')
        elif topic == 'primos':
            return generar_ejercicio_basico('primos')
        elif topic == 'fraccionarios':
            return generar_ejercicio_basico('fraccionarios')
        elif topic == 'potenciacion':
            return generar_ejercicio_basico('potenciacion')
        else:
            return generar_ejercicio_basico('conjuntos')
    except Exception as e:
        return {
            'pregunta': 'Error generando ejercicio',
            'respuesta': 0,
            'explicacion': f'Error: {str(e)}'
        }

# Generate exercise
exercise = generate_exercise_safe('${topic}')
exercise
      `

      const result = pyodide.runPython(pythonCode)
      ejercicio = result.toJs({ dict_converter: Object.fromEntries })
    } else {
      const topicKey =
        topic === "conjuntos_numericos"
          ? "conjuntos"
          : topic === "numeros_primos"
            ? "primos"
            : topic === "potenciacion_radicacion"
              ? "potenciacion"
              : topic

      const ejerciciosDisponibles = window.ejerciciosFallback[topicKey] || window.ejerciciosFallback.conjuntos
      ejercicio = ejerciciosDisponibles[Math.floor(Math.random() * ejerciciosDisponibles.length)]
    }

    currentExercise = ejercicio

    // Update UI
    document.getElementById("exerciseTitle").textContent = `${getTopicName(topic)} - Ejercicio`
    document.getElementById("exerciseContent").innerHTML = `
      <div class="exercise-question">
        <h4>Pregunta:</h4>
        <p>${currentExercise.pregunta}</p>
      </div>
    `
    document.getElementById("answerInput").value = ""
    document.getElementById("feedback").style.display = "none"
  } catch (error) {
    console.error("Error generando ejercicio:", error)
    showNotification("Error al generar ejercicio. Usando modo básico.", "warning")

    currentExercise = {
      pregunta: "¿Cuál es el resultado de 5 + 3?",
      respuesta: 8,
      explicacion: "5 + 3 = 8. Suma básica.",
    }

    document.getElementById("exerciseTitle").textContent = "Ejercicio Básico"
    document.getElementById("exerciseContent").innerHTML = `
      <div class="exercise-question">
        <h4>Pregunta:</h4>
        <p>${currentExercise.pregunta}</p>
      </div>
    `
  }
}

function getTopicName(topic) {
  const names = {
    conjuntos_numericos: "Conjuntos Numéricos",
    numeros_primos: "Números Primos",
    fraccionarios: "Fraccionarios",
    potenciacion_radicacion: "Potenciación y Radicación",
  }
  return names[topic] || topic
}

// Answer checking
function checkAnswer() {
  if (!currentExercise) return

  const userAnswer = document.getElementById("answerInput").value.trim()
  const correctAnswer = currentExercise.respuesta
  const feedback = document.getElementById("feedback")

  // Convert answers for comparison
  const userNum = Number.parseFloat(userAnswer)
  const correctNum = Number.parseFloat(correctAnswer)

  const isCorrect = Math.abs(userNum - correctNum) < 0.01 // Allow small floating point differences

  feedback.style.display = "block"
  feedback.className = `feedback ${isCorrect ? "correct" : "incorrect"}`

  if (isCorrect) {
    feedback.innerHTML = `
            <strong>¡Correcto!</strong><br>
            ${currentExercise.explicacion}
        `
    updateProgress(currentTopic, true)
  } else {
    feedback.innerHTML = `
            <strong>Incorrecto.</strong><br>
            La respuesta correcta es: ${correctAnswer}<br>
            ${currentExercise.explicacion}
        `
    updateProgress(currentTopic, false)
  }
}

function showSolution() {
  if (!currentExercise) return

  const feedback = document.getElementById("feedback")
  feedback.style.display = "block"
  feedback.className = "feedback"
  feedback.innerHTML = `
        <strong>Solución:</strong><br>
        Respuesta: ${currentExercise.respuesta}<br>
        ${currentExercise.explicacion}
    `
}

// Progress management
function updateProgress(topic, isCorrect) {
  if (!userProgress[topic]) {
    userProgress[topic] = { correct: 0, total: 0 }
  }

  userProgress[topic].total++
  if (isCorrect) {
    userProgress[topic].correct++
  }

  saveUserProgress()
  updateProgressUI(topic)
}

function saveUserProgress() {
  localStorage.setItem("mathpro-progress", JSON.stringify(userProgress))
}

function loadUserProgress() {
  // Update progress bars in UI
  Object.keys(userProgress).forEach((topic) => {
    updateProgressUI(topic)
  })
}

function updateProgressUI(topic) {
  const topicCard = document.querySelector(`[data-topic="${topic}"]`)
  if (!topicCard) return

  const progress = userProgress[topic]
  const percentage = progress.total > 0 ? Math.round((progress.correct / progress.total) * 100) : 0

  const progressFill = topicCard.querySelector(".progress-fill")
  const progressText = topicCard.querySelector(".progress-text")

  progressFill.style.width = `${percentage}%`
  progressText.textContent = `${percentage}% completado (${progress.correct}/${progress.total})`
}

// Modal management
function closeModal() {
  document.getElementById("exerciseModal").style.display = "none"
}

function generateNewExercise() {
  if (currentTopic) {
    generateExercise(currentTopic)
  }
}

// Practice modes
function startPractice() {
  const practiceModal = document.createElement("div")
  practiceModal.className = "modal"
  practiceModal.id = "practiceModal"
  practiceModal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Seleccionar Modo de Práctica</h3>
        <button class="close-btn" onclick="closePracticeModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="practice-options">
          <div class="practice-option" onclick="startQuickPractice()">
            <h4>Práctica Rápida</h4>
            <p>5 ejercicios aleatorios para práctica inmediata</p>
          </div>
          <div class="practice-option" onclick="startCustomPractice()">
            <h4>Práctica Personalizada</h4>
            <p>Configura tema, dificultad y número de preguntas</p>
          </div>
          <div class="practice-option" onclick="startAdaptivePractice()">
            <h4>Práctica Adaptativa</h4>
            <p>Ejercicios que se adaptan a tu nivel de conocimiento</p>
          </div>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(practiceModal)
  practiceModal.style.display = "block"
}

function startExam() {
  const examModal = document.createElement("div")
  examModal.className = "modal"
  examModal.id = "examModal"
  examModal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Configurar Examen</h3>
        <button class="close-btn" onclick="closeExamModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="exam-config">
          <div class="config-group">
            <label for="examTopic">Tema:</label>
            <select id="examTopic">
              <option value="conjuntos_numericos">Conjuntos Numéricos</option>
              <option value="numeros_primos">Números Primos</option>
              <option value="fraccionarios">Fraccionarios</option>
              <option value="potenciacion_radicacion">Potenciación y Radicación</option>
            </select>
          </div>
          
          <div class="config-group">
            <label for="examDifficulty">Dificultad:</label>
            <select id="examDifficulty">
              <option value="facil">Fácil</option>
              <option value="medio" selected>Medio</option>
              <option value="dificil">Difícil</option>
              <option value="experto">Experto</option>
            </select>
          </div>
          
          <div class="config-group">
            <label for="examQuestions">Número de Preguntas:</label>
            <select id="examQuestions">
              <option value="5">5 preguntas</option>
              <option value="10" selected>10 preguntas</option>
              <option value="15">15 preguntas</option>
              <option value="20">20 preguntas</option>
            </select>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeExamModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="startConfiguredExam()">Comenzar Examen</button>
      </div>
    </div>
  `

  document.body.appendChild(examModal)
  examModal.style.display = "block"
}

function startConfiguredExam() {
  const topic = document.getElementById("examTopic").value
  const difficulty = document.getElementById("examDifficulty").value
  const numQuestions = Number.parseInt(document.getElementById("examQuestions").value)

  closeExamModal()
  evaluationSystem.startExam(topic, numQuestions, difficulty)
}

function closePracticeModal() {
  const modal = document.getElementById("practiceModal")
  if (modal) {
    modal.remove()
  }
}

function closeExamModal() {
  const modal = document.getElementById("examModal")
  if (modal) {
    modal.remove()
  }
}

function startQuickPractice() {
  closePracticeModal()
  // Start a quick 5-question practice session
  const topics = ["conjuntos_numericos", "numeros_primos", "fraccionarios", "potenciacion_radicacion"]
  const randomTopic = topics[Math.floor(Math.random() * topics.length)]
  evaluationSystem.startExam(randomTopic, 5, "medio")
}

function startCustomPractice() {
  closePracticeModal()
  startExam() // Reuse exam configuration modal
}

function startAdaptivePractice() {
  closePracticeModal()
  showNotification("Práctica adaptativa próximamente disponible", "info")
}

class EvaluationSystem {
  constructor() {
    this.currentExam = null
    this.examResults = null
    this.performanceHistory = JSON.parse(localStorage.getItem("mathpro-performance")) || {}
  }

  async startExam(topic, numQuestions = 10, difficulty = "medio") {
    try {
      showLoadingState()

      let examen

      if (pyodide && window.pythonDisponible !== false) {
        const pythonCode = `
def generar_examen_seguro(tema, num_preguntas, dificultad):
    try:
        # Intentar usar el generador avanzado
        return generar_examen_tema(tema, num_preguntas, dificultad)
    except:
        # Fallback: generar examen básico
        examen = []
        for i in range(num_preguntas):
            ejercicio = generar_ejercicio_basico(tema)
            ejercicio['numero'] = i + 1
            ejercicio['tema'] = tema
            ejercicio['dificultad'] = dificultad
            examen.append(ejercicio)
        return examen

import json
examen = generar_examen_seguro('${topic}', ${numQuestions}, '${difficulty}')
json.dumps(examen, ensure_ascii=False)
        `

        const result = pyodide.runPython(pythonCode)
        examen = JSON.parse(result)
      } else {
        examen = this.generarExamenFallback(topic, numQuestions, difficulty)
      }

      this.currentExam = examen
      hideLoadingState()
      this.displayExam()
    } catch (error) {
      console.error("Error generando examen:", error)
      showNotification("Error al generar el examen", "error")
      hideLoadingState()
    }
  }

  generarExamenFallback(topic, numQuestions, difficulty) {
    const topicKey =
      topic === "conjuntos_numericos"
        ? "conjuntos"
        : topic === "numeros_primos"
          ? "primos"
          : topic === "potenciacion_radicacion"
            ? "potenciacion"
            : topic

    const ejerciciosBase = window.ejerciciosFallback[topicKey] || window.ejerciciosFallback.conjuntos
    const examen = []

    for (let i = 0; i < numQuestions; i++) {
      const ejercicio = { ...ejerciciosBase[i % ejerciciosBase.length] }
      ejercicio.numero = i + 1
      ejercicio.tema = topic
      ejercicio.dificultad = difficulty
      ejercicio.tipo = ejercicio.tipo || "basico"
      examen.push(ejercicio)
    }

    return examen
  }

  async submitExam() {
    try {
      // Collect answers
      const answers = []
      for (let i = 0; i < this.currentExam.length; i++) {
        const answerInput = document.getElementById(`answer_${i}`)
        answers.push(answerInput.value.trim())
      }

      let results

      if (pyodide && window.pythonDisponible !== false) {
        const pythonCode = `
def evaluar_examen_seguro(examen_data, respuestas_data):
    try:
        return evaluar_examen(examen_data, respuestas_data)
    except:
        # Evaluación básica en Python
        correctas = 0
        total = len(examen_data)
        detalles = []
        
        for i, (pregunta, respuesta) in enumerate(zip(examen_data, respuestas_data)):
            respuesta_correcta = str(pregunta['respuesta']).lower().strip()
            respuesta_usuario = respuesta.lower().strip()
            es_correcta = respuesta_correcta == respuesta_usuario
            
            if es_correcta:
                correctas += 1
            
            detalles.append({
                'numero': i + 1,
                'pregunta': pregunta['pregunta'],
                'respuesta_usuario': respuesta,
                'respuesta_correcta': pregunta['respuesta'],
                'es_correcta': es_correcta,
                'explicacion': pregunta['explicacion'],
                'pasos': [],
                'puntos': 1 if es_correcta else 0,
                'tipo': pregunta.get('tipo', 'basico')
            })
        
        porcentaje = (correctas / total) * 100 if total > 0 else 0
        
        return {
            'correctas': correctas,
            'incorrectas': total - correctas,
            'total': total,
            'porcentaje': porcentaje,
            'puntos_obtenidos': correctas,
            'puntos_totales': total,
            'calificacion': 'Excelente' if porcentaje >= 90 else 'Bueno' if porcentaje >= 70 else 'Regular',
            'nivel_dominio': 'Avanzado' if porcentaje >= 90 else 'Intermedio' if porcentaje >= 70 else 'Básico',
            'detalles': detalles,
            'recomendaciones': ['Continúa practicando para mejorar']
        }

import json
exam_data = ${JSON.stringify(this.currentExam)}
answers_data = ${JSON.stringify(answers)}
results = evaluar_examen_seguro(exam_data, answers_data)
json.dumps(results, ensure_ascii=False)
        `

        const result = pyodide.runPython(pythonCode)
        results = JSON.parse(result)
      } else {
        results = this.evaluarExamenFallback(this.currentExam, answers)
      }

      this.examResults = results

      // Stop timer
      if (this.examTimer) {
        clearInterval(this.examTimer)
      }

      // Save performance data
      this.savePerformanceData()

      // Display results
      this.displayResults()
    } catch (error) {
      console.error("Error evaluando examen:", error)
      showNotification("Error al evaluar el examen", "error")
    }
  }

  evaluarExamenFallback(examen, respuestas) {
    let correctas = 0
    const total = examen.length
    const detalles = []

    for (let i = 0; i < examen.length; i++) {
      const pregunta = examen[i]
      const respuesta = respuestas[i]
      const respuestaCorrecta = String(pregunta.respuesta).toLowerCase().trim()
      const respuestaUsuario = respuesta.toLowerCase().trim()

      // Comparación básica
      let esCorrecta = false
      try {
        // Intentar comparación numérica
        const numCorrecta = Number.parseFloat(respuestaCorrecta)
        const numUsuario = Number.parseFloat(respuestaUsuario)
        if (!isNaN(numCorrecta) && !isNaN(numUsuario)) {
          esCorrecta = Math.abs(numCorrecta - numUsuario) < 0.01
        } else {
          esCorrecta = respuestaCorrecta === respuestaUsuario
        }
      } catch {
        esCorrecta = respuestaCorrecta === respuestaUsuario
      }

      if (esCorrecta) correctas++

      detalles.push({
        numero: i + 1,
        pregunta: pregunta.pregunta,
        respuesta_usuario: respuesta,
        respuesta_correcta: pregunta.respuesta,
        es_correcta: esCorrecta,
        explicacion: pregunta.explicacion,
        pasos: [],
        puntos: esCorrecta ? 1 : 0,
        tipo: pregunta.tipo || "basico",
      })
    }

    const porcentaje = (correctas / total) * 100

    return {
      correctas,
      incorrectas: total - correctas,
      total,
      porcentaje,
      puntos_obtenidos: correctas,
      puntos_totales: total,
      calificacion: porcentaje >= 90 ? "Excelente" : porcentaje >= 70 ? "Bueno" : "Regular",
      nivel_dominio: porcentaje >= 90 ? "Avanzado" : porcentaje >= 70 ? "Intermedio" : "Básico",
      detalles,
      recomendaciones: ["Continúa practicando para mejorar tu rendimiento"],
    }
  }

  displayExam() {
    const modal = document.getElementById("exerciseModal")
    const modalContent = modal.querySelector(".modal-content")

    modalContent.innerHTML = `
      <div class="modal-header">
        <h3>Examen - ${this.getTopicName(this.currentExam[0].tema)}</h3>
        <button class="close-btn" onclick="evaluationSystem.closeExam()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="exam-info">
          <div class="exam-stats">
            <span class="stat">
              <strong>Preguntas:</strong> ${this.currentExam.length}
            </span>
            <span class="stat">
              <strong>Dificultad:</strong> ${this.currentExam[0].dificultad}
            </span>
            <span class="stat">
              <strong>Tiempo:</strong> <span id="examTimer">--:--</span>
            </span>
          </div>
        </div>
        
        <div class="exam-questions">
          ${this.currentExam
            .map(
              (q, index) => `
            <div class="question-card" data-question="${index}">
              <div class="question-header">
                <span class="question-number">Pregunta ${q.numero}</span>
                <span class="question-type">${this.getTypeLabel(q.tipo)}</span>
              </div>
              <div class="question-content">
                <p class="question-text">${q.pregunta}</p>
                <div class="answer-input-group">
                  <input type="text" 
                         class="exam-answer-input" 
                         id="answer_${index}"
                         placeholder="Tu respuesta">
                  <span class="input-feedback" id="feedback_${index}"></span>
                </div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="evaluationSystem.closeExam()">Cancelar</button>
        <button class="btn btn-primary" onclick="evaluationSystem.submitExam()">Enviar Examen</button>
      </div>
    `

    modal.style.display = "block"
    this.startTimer()
  }

  startTimer() {
    const timerElement = document.getElementById("examTimer")
    let seconds = 0

    this.examTimer = setInterval(() => {
      seconds++
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      timerElement.textContent = `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    }, 1000)
  }

  displayResults() {
    const modal = document.getElementById("exerciseModal")
    const modalContent = modal.querySelector(".modal-content")

    const results = this.examResults
    const timerText = document.getElementById("examTimer")?.textContent || "00:00"

    modalContent.innerHTML = `
      <div class="modal-header">
        <h3>Resultados del Examen</h3>
        <button class="close-btn" onclick="evaluationSystem.closeExam()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="results-summary">
          <div class="score-display">
            <div class="score-circle ${this.getScoreClass(results.porcentaje)}">
              <span class="score-percentage">${Math.round(results.porcentaje)}%</span>
              <span class="score-label">${results.calificacion}</span>
            </div>
          </div>
          
          <div class="results-stats">
            <div class="stat-item">
              <span class="stat-label">Correctas</span>
              <span class="stat-value correct">${results.correctas}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Incorrectas</span>
              <span class="stat-value incorrect">${results.incorrectas}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Puntos</span>
              <span class="stat-value">${results.puntos_obtenidos}/${results.puntos_totales}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Tiempo</span>
              <span class="stat-value">${timerText}</span>
            </div>
          </div>
          
          <div class="level-indicator">
            <h4>Nivel de Dominio</h4>
            <div class="level-bar">
              <div class="level-fill ${this.getLevelClass(results.porcentaje)}" 
                   style="width: ${results.porcentaje}%"></div>
            </div>
            <span class="level-text">${results.nivel_dominio}</span>
          </div>
        </div>

        <div class="recommendations">
          <h4>Recomendaciones</h4>
          <ul class="recommendation-list">
            ${results.recomendaciones.map((rec) => `<li>${rec}</li>`).join("")}
          </ul>
        </div>

        <div class="detailed-results">
          <h4>Revisión Detallada</h4>
          <div class="questions-review">
            ${results.detalles
              .map(
                (detail, index) => `
              <div class="question-review ${detail.es_correcta ? "correct" : "incorrect"}">
                <div class="review-header">
                  <span class="question-num">Pregunta ${detail.numero}</span>
                  <span class="review-status ${detail.es_correcta ? "correct" : "incorrect"}">
                    ${detail.es_correcta ? "✓ Correcta" : "✗ Incorrecta"}
                  </span>
                  <span class="points">${detail.puntos} pts</span>
                </div>
                <div class="review-content">
                  <p class="review-question">${detail.pregunta}</p>
                  <div class="review-answers">
                    <div class="user-answer">
                      <strong>Tu respuesta:</strong> ${detail.respuesta_usuario || "Sin respuesta"}
                    </div>
                    <div class="correct-answer">
                      <strong>Respuesta correcta:</strong> ${detail.respuesta_correcta}
                    </div>
                  </div>
                  <div class="explanation">
                    <strong>Explicación:</strong> ${detail.explicacion}
                  </div>
                  ${
                    detail.pasos && detail.pasos.length > 0
                      ? `
                    <div class="solution-steps">
                      <strong>Pasos de solución:</strong>
                      <ol>
                        ${detail.pasos.map((paso) => `<li>${paso}</li>`).join("")}
                      </ol>
                    </div>
                  `
                      : ""
                  }
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="evaluationSystem.closeExam()">Cerrar</button>
        <button class="btn btn-primary" onclick="evaluationSystem.retakeExam()">Repetir Examen</button>
        <button class="btn btn-outline" onclick="evaluationSystem.exportResults()">Exportar Resultados</button>
      </div>
    `
  }

  savePerformanceData() {
    const topic = this.currentExam[0].tema
    const difficulty = this.currentExam[0].dificultad

    if (!this.performanceHistory[topic]) {
      this.performanceHistory[topic] = {}
    }

    if (!this.performanceHistory[topic][difficulty]) {
      this.performanceHistory[topic][difficulty] = []
    }

    const performanceData = {
      date: new Date().toISOString(),
      score: this.examResults.porcentaje,
      correctas: this.examResults.correctas,
      total: this.examResults.total,
      puntos: this.examResults.puntos_obtenidos,
      tiempo: document.getElementById("examTimer")?.textContent || "00:00",
      calificacion: this.examResults.calificacion,
      nivel: this.examResults.nivel_dominio,
    }

    this.performanceHistory[topic][difficulty].push(performanceData)

    // Keep only last 10 attempts per topic/difficulty
    if (this.performanceHistory[topic][difficulty].length > 10) {
      this.performanceHistory[topic][difficulty] = this.performanceHistory[topic][difficulty].slice(-10)
    }

    localStorage.setItem("mathpro-performance", JSON.stringify(this.performanceHistory))
  }

  getScoreClass(percentage) {
    if (percentage >= 90) return "excellent"
    if (percentage >= 75) return "good"
    if (percentage >= 60) return "average"
    return "needs-improvement"
  }

  getLevelClass(percentage) {
    if (percentage >= 90) return "advanced"
    if (percentage >= 75) return "intermediate"
    if (percentage >= 60) return "basic"
    return "beginner"
  }

  getTypeLabel(type) {
    const labels = {
      suma: "Suma",
      resta: "Resta",
      multiplicacion: "Multiplicación",
      division: "División",
      potencia: "Potenciación",
      raiz_cuadrada: "Raíz Cuadrada",
      identificar_primo: "Números Primos",
      mcd: "MCD",
      mcm: "MCM",
      factorizacion: "Factorización",
      suma_fracciones: "Suma de Fracciones",
      simplificacion: "Simplificación",
    }
    return labels[type] || type
  }

  getTopicName(topic) {
    const names = {
      conjuntos_numericos: "Conjuntos Numéricos",
      numeros_primos: "Números Primos",
      fraccionarios: "Fraccionarios",
      potenciacion_radicacion: "Potenciación y Radicación",
    }
    return names[topic] || topic
  }

  retakeExam() {
    if (this.currentExam) {
      const topic = this.currentExam[0].tema
      const difficulty = this.currentExam[0].dificultad
      const numQuestions = this.currentExam.length
      this.startExam(topic, numQuestions, difficulty)
    }
  }

  exportResults() {
    if (!this.examResults) return

    const exportData = {
      fecha: new Date().toLocaleDateString(),
      tema: this.getTopicName(this.currentExam[0].tema),
      dificultad: this.currentExam[0].dificultad,
      resultados: this.examResults,
      preguntas: this.currentExam,
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(dataBlob)
    link.download = `examen_${this.currentExam[0].tema}_${new Date().toISOString().split("T")[0]}.json`
    link.click()

    showNotification("Resultados exportados exitosamente", "success")
  }

  closeExam() {
    if (this.examTimer) {
      clearInterval(this.examTimer)
    }
    document.getElementById("exerciseModal").style.display = "none"
    this.currentExam = null
    this.examResults = null
  }

  getPerformanceHistory(topic = null, difficulty = null) {
    if (!topic) return this.performanceHistory
    if (!difficulty) return this.performanceHistory[topic] || {}
    return this.performanceHistory[topic]?.[difficulty] || []
  }

  getAverageScore(topic, difficulty) {
    const history = this.getPerformanceHistory(topic, difficulty)
    if (history.length === 0) return 0

    const totalScore = history.reduce((sum, attempt) => sum + attempt.score, 0)
    return Math.round(totalScore / history.length)
  }

  getProgressTrend(topic, difficulty) {
    const history = this.getPerformanceHistory(topic, difficulty)
    if (history.length < 2) return "stable"

    const recent = history.slice(-3)
    const older = history.slice(-6, -3)

    if (older.length === 0) return "stable"

    const recentAvg = recent.reduce((sum, a) => sum + a.score, 0) / recent.length
    const olderAvg = older.reduce((sum, a) => sum + a.score, 0) / older.length

    if (recentAvg > olderAvg + 5) return "improving"
    if (recentAvg < olderAvg - 5) return "declining"
    return "stable"
  }
}

const evaluationSystem = new EvaluationSystem()

// Utility functions
function showNotification(message, type = "info") {
  // Simple notification system
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--bg-card);
        color: var(--text-primary);
        padding: 1rem 2rem;
        border-radius: var(--border-radius);
        border: 1px solid var(--border-color);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.remove()
  }, 3000)
}

// Add CSS for notification animation
const style = document.createElement("style")
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`
document.head.appendChild(style)

function setupIntersectionObserver() {
  const sections = document.querySelectorAll("section[id]")
  const navLinks = document.querySelectorAll(".nav-link")

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Remove active class from all nav links
          navLinks.forEach((link) => link.classList.remove("active"))

          // Add active class to corresponding nav link
          const correspondingLink = document.querySelector(`[href="#${entry.target.id}"]`)
          if (correspondingLink) {
            correspondingLink.classList.add("active")
          }
        }
      })
    },
    {
      threshold: 0.3,
      rootMargin: "-80px 0px -50% 0px",
    },
  )

  sections.forEach((section) => observer.observe(section))
}

function showLoadingState() {
  const modal = document.getElementById("exerciseModal")
  modal.style.display = "block"

  document.getElementById("exerciseTitle").textContent = "Generando ejercicio..."
  document.getElementById("exerciseContent").innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Preparando tu ejercicio personalizado...</p>
    </div>
  `
  document.getElementById("answerInput").disabled = true
  document.querySelector(".modal-footer").style.display = "none"
}

function hideLoadingState() {
  document.getElementById("answerInput").disabled = false
  document.querySelector(".modal-footer").style.display = "flex"
}

function setupModalKeyboardSupport() {
  document.addEventListener("keydown", (e) => {
    const modal = document.getElementById("exerciseModal")

    if (modal.style.display === "block") {
      if (e.key === "Escape") {
        closeModal()
      } else if (e.key === "Enter" && e.target.id !== "answerInput") {
        e.preventDefault()
        checkAnswer()
      }
    }
  })
}

function setupTopicCardEffects() {
  const topicCards = document.querySelectorAll(".topic-card")

  topicCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-8px) scale(1.02)"
      this.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    })

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)"
    })
  })
}
