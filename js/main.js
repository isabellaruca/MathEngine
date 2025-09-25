// Global variables
let pyodide = null
const currentTopic = null
let currentExercise = null
const userProgress = JSON.parse(localStorage.getItem("mathpro-progress")) || {}

// Function to load user progress
function loadUserProgress() {
  console.log("[v0] Cargando progreso del usuario...")
  // Implementation to load user progress
}

// Function to set up event listeners
function setupEventListeners() {
  console.log("[v0] Configurando listeners de eventos...")
  // Implementation to set up event listeners
}

// Function to show notifications
function showNotification(message, type) {
  console.log(`[v0] Mostrando notificación: ${message} (${type})`)
  // Implementation to show notifications
}

// Function to get topic name
function getTopicName(topic) {
  const topicNames = {
    conjuntos_numericos: "Conjuntos Numéricos",
    numeros_primos: "Números Primos",
    fraccionarios: "Fraccionarios",
    potenciacion_radicacion: "Potenciación y Radicación",
  }
  return topicNames[topic] || "Tema Desconocido"
}

// Function to update user progress
function updateProgress(topic, isCorrect) {
  console.log(`[v0] Actualizando progreso para tema: ${topic}, respuesta correcta: ${isCorrect}`)
  if (!userProgress[topic]) {
    userProgress[topic] = { correct: 0, incorrect: 0 }
  }
  if (isCorrect) {
    userProgress[topic].correct += 1
  } else {
    userProgress[topic].incorrect += 1
  }
  localStorage.setItem("mathpro-progress", JSON.stringify(userProgress))
}

// Initialize the application
document.addEventListener("DOMContentLoaded", async () => {
  console.log("[v0] MathPro Engineering - Inicializando aplicación...")

  try {
    await initializePyodide()
    loadUserProgress()
    setupEventListeners()
    showNotification("¡Aplicación cargada exitosamente!", "success")
  } catch (error) {
    console.error("[v0] Error inicializando aplicación:", error)
    showNotification("Error cargando la aplicación. Algunas funciones pueden no estar disponibles.", "error")
  }
})

// Initialize Pyodide for Python integration
async function initializePyodide() {
  try {
    console.log("[v0] Iniciando carga de Pyodide...")

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout cargando Pyodide")), 15000)
    })

    const pyodidePromise = window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
    })

    pyodide = await Promise.race([pyodidePromise, timeoutPromise])
    console.log("[v0] Pyodide cargado exitosamente")

    await pyodide.runPython(`
import sys
import math
import random
from fractions import Fraction
import json

print("[Python] Iniciando carga de módulos matemáticos...")

# ===== MÓDULO DE ARITMÉTICA =====
class ConjuntosNumericos:
    @staticmethod
    def es_natural(n):
        return isinstance(n, int) and n > 0
    
    @staticmethod
    def es_entero(n):
        return isinstance(n, int)
    
    @staticmethod
    def es_racional(n):
        return isinstance(n, (int, float, Fraction))
    
    @staticmethod
    def clasificar_numero(n):
        if ConjuntosNumericos.es_natural(n):
            return "Natural"
        elif ConjuntosNumericos.es_entero(n):
            return "Entero"
        elif ConjuntosNumericos.es_racional(n):
            return "Racional"
        else:
            return "Real"

class NumerosPrimos:
    @staticmethod
    def es_primo(n):
        if n < 2:
            return False
        if n == 2:
            return True
        if n % 2 == 0:
            return False
        for i in range(3, int(math.sqrt(n)) + 1, 2):
            if n % i == 0:
                return False
        return True
    
    @staticmethod
    def mcd(a, b):
        while b:
            a, b = b, a % b
        return abs(a)
    
    @staticmethod
    def mcm(a, b):
        return abs(a * b) // NumerosPrimos.mcd(a, b)
    
    @staticmethod
    def factorizar(n):
        factores = []
        d = 2
        while d * d <= n:
            while n % d == 0:
                factores.append(d)
                n //= d
            d += 1
        if n > 1:
            factores.append(n)
        return factores

class Fraccionarios:
    @staticmethod
    def simplificar_fraccion(numerador, denominador):
        mcd = NumerosPrimos.mcd(numerador, denominador)
        return numerador // mcd, denominador // mcd
    
    @staticmethod
    def sumar_fracciones(n1, d1, n2, d2):
        denominador_comun = NumerosPrimos.mcm(d1, d2)
        numerador_resultado = n1 * (denominador_comun // d1) + n2 * (denominador_comun // d2)
        return Fraccionarios.simplificar_fraccion(numerador_resultado, denominador_comun)
    
    @staticmethod
    def multiplicar_fracciones(n1, d1, n2, d2):
        numerador = n1 * n2
        denominador = d1 * d2
        return Fraccionarios.simplificar_fraccion(numerador, denominador)

class Potenciacion:
    @staticmethod
    def potencia(base, exponente):
        return base ** exponente
    
    @staticmethod
    def raiz_cuadrada(n):
        return math.sqrt(n)
    
    @staticmethod
    def simplificar_radical(n):
        factores = NumerosPrimos.factorizar(n)
        dentro_radical = 1
        fuera_radical = 1
        
        factor_count = {}
        for factor in factores:
            factor_count[factor] = factor_count.get(factor, 0) + 1
        
        for factor, count in factor_count.items():
            fuera_radical *= factor ** (count // 2)
            if count % 2 == 1:
                dentro_radical *= factor
        
        return fuera_radical, dentro_radical

# ===== GENERADOR DE EJERCICIOS =====
def generar_ejercicio_conjuntos(dificultad="medio"):
    tipos = ["suma", "resta", "multiplicacion", "clasificacion"]
    tipo = random.choice(tipos)
    
    if tipo == "suma":
        a, b = random.randint(1, 50), random.randint(1, 50)
        return {
            'pregunta': f'¿Cuál es el resultado de {a} + {b}?',
            'respuesta': a + b,
            'explicacion': f'{a} + {b} = {a + b}',
            'tipo': 'suma'
        }
    elif tipo == "resta":
        a, b = random.randint(20, 100), random.randint(1, 19)
        return {
            'pregunta': f'¿Cuál es el resultado de {a} - {b}?',
            'respuesta': a - b,
            'explicacion': f'{a} - {b} = {a - b}',
            'tipo': 'resta'
        }
    elif tipo == "multiplicacion":
        a, b = random.randint(2, 12), random.randint(2, 12)
        return {
            'pregunta': f'¿Cuál es el resultado de {a} × {b}?',
            'respuesta': a * b,
            'explicacion': f'{a} × {b} = {a * b}',
            'tipo': 'multiplicacion'
        }
    else:  # clasificacion
        numero = random.choice([-5, -2, 0, 3, 7, 15])
        clasificacion = ConjuntosNumericos.clasificar_numero(numero)
        return {
            'pregunta': f'¿A qué conjunto numérico pertenece {numero}? (Natural/Entero/Racional)',
            'respuesta': clasificacion,
            'explicacion': f'{numero} pertenece al conjunto de números {clasificacion.lower()}s',
            'tipo': 'clasificacion'
        }

def generar_ejercicio_primos(dificultad="medio"):
    tipos = ["identificar_primo", "mcd", "mcm", "factorizacion"]
    tipo = random.choice(tipos)
    
    if tipo == "identificar_primo":
        numero = random.choice([7, 11, 13, 17, 19, 23, 8, 9, 10, 12, 15, 16, 21, 25])
        es_primo = NumerosPrimos.es_primo(numero)
        return {
            'pregunta': f'¿Es {numero} un número primo? (1 para sí, 0 para no)',
            'respuesta': 1 if es_primo else 0,
            'explicacion': f'{numero} {"es" if es_primo else "no es"} primo',
            'tipo': 'primo'
        }
    elif tipo == "mcd":
        a, b = random.randint(12, 48), random.randint(8, 36)
        mcd = NumerosPrimos.mcd(a, b)
        return {
            'pregunta': f'¿Cuál es el MCD de {a} y {b}?',
            'respuesta': mcd,
            'explicacion': f'MCD({a}, {b}) = {mcd}',
            'tipo': 'mcd'
        }
    elif tipo == "mcm":
        a, b = random.randint(4, 12), random.randint(6, 15)
        mcm = NumerosPrimos.mcm(a, b)
        return {
            'pregunta': f'¿Cuál es el MCM de {a} y {b}?',
            'respuesta': mcm,
            'explicacion': f'MCM({a}, {b}) = {mcm}',
            'tipo': 'mcm'
        }
    else:  # factorizacion
        numero = random.choice([12, 18, 24, 30, 36, 42, 48])
        factores = NumerosPrimos.factorizar(numero)
        factores_str = " × ".join(map(str, factores))
        return {
            'pregunta': f'Factoriza {numero} en números primos (escribe los factores separados por comas)',
            'respuesta': ",".join(map(str, sorted(factores))),
            'explicacion': f'{numero} = {factores_str}',
            'tipo': 'factorizacion'
        }

def generar_ejercicio_fracciones(dificultad="medio"):
    tipos = ["suma_fracciones", "multiplicacion_fracciones", "simplificacion"]
    tipo = random.choice(tipos)
    
    if tipo == "suma_fracciones":
        n1, d1 = random.randint(1, 5), random.randint(2, 8)
        n2, d2 = random.randint(1, 5), random.randint(2, 8)
        num_resultado, den_resultado = Fraccionarios.sumar_fracciones(n1, d1, n2, d2)
        return {
            'pregunta': f'¿Cuál es el resultado de {n1}/{d1} + {n2}/{d2}? (formato: numerador/denominador)',
            'respuesta': f'{num_resultado}/{den_resultado}',
            'explicacion': f'{n1}/{d1} + {n2}/{d2} = {num_resultado}/{den_resultado}',
            'tipo': 'suma_fracciones'
        }
    elif tipo == "multiplicacion_fracciones":
        n1, d1 = random.randint(1, 6), random.randint(2, 8)
        n2, d2 = random.randint(1, 6), random.randint(2, 8)
        num_resultado, den_resultado = Fraccionarios.multiplicar_fracciones(n1, d1, n2, d2)
        return {
            'pregunta': f'¿Cuál es el resultado de {n1}/{d1} × {n2}/{d2}? (formato: numerador/denominador)',
            'respuesta': f'{num_resultado}/{den_resultado}',
            'explicacion': f'{n1}/{d1} × {n2}/{d2} = {num_resultado}/{den_resultado}',
            'tipo': 'multiplicacion_fracciones'
        }
    else:  # simplificacion
        factor = random.randint(2, 6)
        n_simple = random.randint(1, 8)
        d_simple = random.randint(2, 10)
        n_complejo = n_simple * factor
        d_complejo = d_simple * factor
        return {
            'pregunta': f'Simplifica la fracción {n_complejo}/{d_complejo} (formato: numerador/denominador)',
            'respuesta': f'{n_simple}/{d_simple}',
            'explicacion': f'{n_complejo}/{d_complejo} = {n_simple}/{d_simple}',
            'tipo': 'simplificacion'
        }

def generar_ejercicio_potencias(dificultad="medio"):
    tipos = ["potencia", "raiz_cuadrada", "leyes_exponentes"]
    tipo = random.choice(tipos)
    
    if tipo == "potencia":
        base = random.randint(2, 6)
        exponente = random.randint(2, 4)
        resultado = Potenciacion.potencia(base, exponente)
        return {
            'pregunta': f'¿Cuál es el resultado de {base}^{exponente}?',
            'respuesta': resultado,
            'explicacion': f'{base}^{exponente} = {resultado}',
            'tipo': 'potencia'
        }
    elif tipo == "raiz_cuadrada":
        numeros_perfectos = [4, 9, 16, 25, 36, 49, 64, 81, 100]
        numero = random.choice(numeros_perfectos)
        resultado = int(Potenciacion.raiz_cuadrada(numero))
        return {
            'pregunta': f'¿Cuál es el resultado de √{numero}?',
            'respuesta': resultado,
            'explicacion': f'√{numero} = {resultado}',
            'tipo': 'raiz_cuadrada'
        }
    else:  # leyes_exponentes
        base = random.randint(2, 5)
        exp1 = random.randint(2, 4)
        exp2 = random.randint(1, 3)
        resultado = exp1 + exp2
        return {
            'pregunta': f'Si {base}^{exp1} × {base}^{exp2} = {base}^x, ¿cuál es el valor de x?',
            'respuesta': resultado,
            'explicacion': f'{base}^{exp1} × {base}^{exp2} = {base}^{exp1 + exp2} = {base}^{resultado}',
            'tipo': 'leyes_exponentes'
        }

# Función principal para generar ejercicios
def generar_ejercicio_basico(tema):
    if tema == 'conjuntos':
        return generar_ejercicio_conjuntos()
    elif tema == 'primos':
        return generar_ejercicio_primos()
    elif tema == 'fraccionarios':
        return generar_ejercicio_fracciones()
    elif tema == 'potenciacion':
        return generar_ejercicio_potencias()
    else:
        return generar_ejercicio_conjuntos()

# Función para generar exámenes
def generar_examen_tema(tema, num_preguntas, dificultad):
    examen = []
    for i in range(num_preguntas):
        ejercicio = generar_ejercicio_basico(tema)
        ejercicio['numero'] = i + 1
        ejercicio['tema'] = tema
        ejercicio['dificultad'] = dificultad
        examen.append(ejercicio)
    return examen

# Función para evaluar exámenes
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
            # Intentar comparación numérica
            num_correcta = float(respuesta_correcta)
            num_usuario = float(respuesta_usuario)
            es_correcta = abs(num_correcta - num_usuario) < 0.01
        except:
            # Comparación de texto
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
        'recomendaciones': ['Continúa practicando para mejorar tu rendimiento']
    }

print("[Python] Módulos matemáticos cargados exitosamente")
    `)

    console.log("[v0] Módulos Python cargados exitosamente")
    window.pythonDisponible = true

    const indicator = document.getElementById("pythonIndicator")
    if (indicator) {
      indicator.textContent = "🐍 Python Activo"
      indicator.style.color = "#10b981"
    }
  } catch (error) {
    console.error("[v0] Error cargando Pyodide:", error)
    activarModoFallback()
  }
}

function activarModoFallback() {
  console.log("[v0] Activando modo fallback sin Python")
  window.pythonDisponible = false

  const indicator = document.getElementById("pythonIndicator")
  if (indicator) {
    indicator.textContent = "⚡ Modo Básico"
    indicator.style.color = "#f59e0b"
  }

  // Definir ejercicios básicos en JavaScript
  window.ejerciciosFallback = {
    conjuntos: [
      {
        pregunta: "¿Cuál es el resultado de 15 + 23?",
        respuesta: 38,
        explicacion: "15 + 23 = 38. Suma directa de números naturales.",
        tipo: "suma",
      },
      {
        pregunta: "¿Cuál es el resultado de 45 - 17?",
        respuesta: 28,
        explicacion: "45 - 17 = 28. Resta de números naturales.",
        tipo: "resta",
      },
      {
        pregunta: "¿Cuál es el resultado de 7 × 8?",
        respuesta: 56,
        explicacion: "7 × 8 = 56. Multiplicación básica.",
        tipo: "multiplicacion",
      },
    ],
    primos: [
      {
        pregunta: "¿Es 17 un número primo? (1 para sí, 0 para no)",
        respuesta: 1,
        explicacion: "17 es primo porque solo es divisible por 1 y por sí mismo.",
        tipo: "primo",
      },
      {
        pregunta: "¿Cuál es el MCD de 12 y 18?",
        respuesta: 6,
        explicacion: "MCD(12,18) = 6. Los divisores comunes son 1, 2, 3, 6.",
        tipo: "mcd",
      },
      {
        pregunta: "¿Es 21 un número primo? (1 para sí, 0 para no)",
        respuesta: 0,
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
    potenciacion: [
      {
        pregunta: "¿Cuál es el resultado de 2³?",
        respuesta: 8,
        explicacion: "2³ = 2 × 2 × 2 = 8",
        tipo: "potencia",
      },
      {
        pregunta: "¿Cuál es el resultado de √16?",
        respuesta: 4,
        explicacion: "√16 = 4 porque 4² = 16",
        tipo: "raiz_cuadrada",
      },
      {
        pregunta: "¿Cuál es el resultado de 3²?",
        respuesta: 9,
        explicacion: "3² = 3 × 3 = 9",
        tipo: "potencia",
      },
    ],
  }
}

async function generateExercise(topic) {
  try {
    console.log(`[v0] Generando ejercicio para tema: ${topic}`)
    let ejercicio

    if (pyodide && window.pythonDisponible === true) {
      console.log("[v0] Usando Python para generar ejercicio")
      const pythonCode = `
try:
    ejercicio = generar_ejercicio_basico('${topic}')
    print(f"[v0] Ejercicio generado: {ejercicio}")
    ejercicio
except Exception as e:
    print(f"[v0] Error en Python: {e}")
    {
        'pregunta': 'Error generando ejercicio',
        'respuesta': 0,
        'explicacion': f'Error: {str(e)}',
        'tipo': 'error'
    }
      `

      const result = pyodide.runPython(pythonCode)
      ejercicio = result.toJs({ dict_converter: Object.fromEntries })
      console.log("[v0] Ejercicio generado con Python:", ejercicio)
    } else {
      console.log("[v0] Usando modo fallback para generar ejercicio")
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
      console.log("[v0] Ejercicio generado con fallback:", ejercicio)
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

    console.log("[v0] UI actualizada con nuevo ejercicio")
  } catch (error) {
    console.error("[v0] Error generando ejercicio:", error)
    showNotification("Error al generar ejercicio", "error")

    // Fallback más robusto
    currentExercise = {
      pregunta: "¿Cuál es el resultado de 5 + 3?",
      respuesta: 8,
      explicacion: "5 + 3 = 8. Suma básica.",
      tipo: "suma",
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

function checkAnswer() {
  if (!currentExercise) {
    console.log("[v0] No hay ejercicio actual")
    return
  }

  const userAnswer = document.getElementById("answerInput").value.trim()
  const correctAnswer = currentExercise.respuesta
  const feedback = document.getElementById("feedback")

  console.log(`[v0] Verificando respuesta: "${userAnswer}" vs "${correctAnswer}"`)

  let isCorrect = false

  // Mejor comparación de respuestas
  try {
    if (typeof correctAnswer === "string" && correctAnswer.includes("/")) {
      // Comparación de fracciones
      isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase()
    } else {
      // Comparación numérica
      const userNum = Number.parseFloat(userAnswer)
      const correctNum = Number.parseFloat(correctAnswer)
      isCorrect = !isNaN(userNum) && !isNaN(correctNum) && Math.abs(userNum - correctNum) < 0.01
    }
  } catch (error) {
    console.error("[v0] Error comparando respuestas:", error)
    isCorrect = userAnswer.toLowerCase() === String(correctAnswer).toLowerCase()
  }

  console.log(`[v0] Respuesta ${isCorrect ? "correcta" : "incorrecta"}`)

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
