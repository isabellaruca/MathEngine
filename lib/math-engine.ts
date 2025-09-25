export interface Exercise {
  id: string
  type: string
  question: string
  answer: number | string
  explanation: string
  difficulty: "easy" | "medium" | "hard"
  steps?: string[]
  hints?: string[]
}

export interface ExerciseOptions {
  difficulty?: "easy" | "medium" | "hard"
  count?: number
  subtopic?: string
}

export class MathEngine {
  private exerciseGenerators: Map<string, (options: ExerciseOptions) => Exercise[]> = new Map()

  constructor() {
    this.initializeGenerators()
  }

  private initializeGenerators() {
    // Conjuntos Numéricos
    this.exerciseGenerators.set("conjuntos_numericos", (options) => this.generateConjuntosNumericos(options))

    // Números Primos
    this.exerciseGenerators.set("numeros_primos", (options) => this.generateNumerosPrimos(options))

    // Fraccionarios
    this.exerciseGenerators.set("fraccionarios", (options) => this.generateFraccionarios(options))

    // Potenciación y Radicación
    this.exerciseGenerators.set("potenciacion_radicacion", (options) => this.generatePotenciacionRadicacion(options))
  }

  generateExercises(topic: string, options: ExerciseOptions = {}): Exercise[] {
    const generator = this.exerciseGenerators.get(topic)
    if (!generator) {
      throw new Error(`No generator found for topic: ${topic}`)
    }

    const count = options.count || 1
    const exercises = generator(options)

    // Return requested number of exercises, cycling if necessary
    const result: Exercise[] = []
    for (let i = 0; i < count; i++) {
      result.push(exercises[i % exercises.length])
    }

    return result
  }

  private generateConjuntosNumericos(options: ExerciseOptions): Exercise[] {
    const exercises: Exercise[] = []
    const difficulty = options.difficulty || "easy"

    if (difficulty === "easy") {
      // Clasificación de números
      const numbers = [3.14, -5, 0, 7, -2.5, 1 / 3, Math.sqrt(2)]
      const randomNum = numbers[Math.floor(Math.random() * numbers.length)]

      exercises.push({
        id: `conjuntos_${Date.now()}`,
        type: "classification",
        question: `Clasifica el número ${randomNum} según los conjuntos numéricos (Natural, Entero, Racional, Irracional, Real)`,
        answer: this.classifyNumber(randomNum),
        explanation: `El número ${randomNum} ${this.getNumberClassificationExplanation(randomNum)}`,
        difficulty: "easy",
        steps: this.getClassificationSteps(randomNum),
      })
    } else if (difficulty === "medium") {
      // Operaciones con propiedades
      const a = Math.floor(Math.random() * 10) + 1
      const b = Math.floor(Math.random() * 10) + 1
      const c = Math.floor(Math.random() * 10) + 1

      exercises.push({
        id: `conjuntos_${Date.now()}`,
        type: "properties",
        question: `Usando las propiedades de los números reales, simplifica: ${a} × (${b} + ${c})`,
        answer: a * (b + c),
        explanation: `Aplicando la propiedad distributiva: ${a} × (${b} + ${c}) = ${a} × ${b} + ${a} × ${c} = ${a * b} + ${a * c} = ${a * (b + c)}`,
        difficulty: "medium",
        steps: [
          `Identificar la propiedad distributiva: a × (b + c) = a × b + a × c`,
          `Aplicar: ${a} × ${b} + ${a} × ${c}`,
          `Calcular: ${a * b} + ${a * c} = ${a * (b + c)}`,
        ],
      })
    } else {
      // Teorema fundamental de la aritmética
      const num = Math.floor(Math.random() * 50) + 20
      const factors = this.getPrimeFactorization(num)

      exercises.push({
        id: `conjuntos_${Date.now()}`,
        type: "factorization",
        question: `Encuentra la factorización prima de ${num}`,
        answer: factors.join(" × "),
        explanation: `La factorización prima de ${num} es ${factors.join(" × ")} según el Teorema Fundamental de la Aritmética`,
        difficulty: "hard",
        steps: this.getFactorizationSteps(num),
      })
    }

    return exercises
  }

  private generateNumerosPrimos(options: ExerciseOptions): Exercise[] {
    const exercises: Exercise[] = []
    const difficulty = options.difficulty || "easy"

    if (difficulty === "easy") {
      // Identificar números primos
      const numbers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
      const randomNum = numbers[Math.floor(Math.random() * numbers.length)]

      exercises.push({
        id: `primos_${Date.now()}`,
        type: "prime_identification",
        question: `¿Es ${randomNum} un número primo? (Responde: sí o no)`,
        answer: this.isPrime(randomNum) ? "sí" : "no",
        explanation: `${randomNum} ${this.isPrime(randomNum) ? "es primo porque solo es divisible por 1 y por sí mismo" : "no es primo porque tiene divisores además de 1 y sí mismo"}`,
        difficulty: "easy",
        steps: this.getPrimeCheckSteps(randomNum),
      })
    } else if (difficulty === "medium") {
      // MCD y MCM
      const a = Math.floor(Math.random() * 20) + 5
      const b = Math.floor(Math.random() * 20) + 5
      const gcd = this.gcd(a, b)

      exercises.push({
        id: `primos_${Date.now()}`,
        type: "gcd",
        question: `Encuentra el MCD (Máximo Común Divisor) de ${a} y ${b}`,
        answer: gcd,
        explanation: `El MCD de ${a} y ${b} es ${gcd}`,
        difficulty: "medium",
        steps: this.getGcdSteps(a, b),
      })
    } else {
      // Criterios de divisibilidad
      const divisors = [2, 3, 4, 5, 6, 8, 9, 10, 11]
      const divisor = divisors[Math.floor(Math.random() * divisors.length)]
      const num = Math.floor(Math.random() * 1000) + 100

      exercises.push({
        id: `primos_${Date.now()}`,
        type: "divisibility",
        question: `¿Es ${num} divisible por ${divisor}? Aplica el criterio de divisibilidad correspondiente`,
        answer: num % divisor === 0 ? "sí" : "no",
        explanation: this.getDivisibilityExplanation(num, divisor),
        difficulty: "hard",
        steps: this.getDivisibilitySteps(num, divisor),
      })
    }

    return exercises
  }

  private generateFraccionarios(options: ExerciseOptions): Exercise[] {
    const exercises: Exercise[] = []
    const difficulty = options.difficulty || "easy"

    if (difficulty === "easy") {
      // Suma de fracciones con mismo denominador
      const denominator = Math.floor(Math.random() * 8) + 2
      const num1 = Math.floor(Math.random() * denominator) + 1
      const num2 = Math.floor(Math.random() * denominator) + 1
      const result = this.simplifyFraction(num1 + num2, denominator)

      exercises.push({
        id: `fracciones_${Date.now()}`,
        type: "fraction_addition",
        question: `Calcula: ${num1}/${denominator} + ${num2}/${denominator}`,
        answer: `${result.numerator}/${result.denominator}`,
        explanation: `${num1}/${denominator} + ${num2}/${denominator} = ${num1 + num2}/${denominator} = ${result.numerator}/${result.denominator}`,
        difficulty: "easy",
        steps: [
          `Sumar los numeradores: ${num1} + ${num2} = ${num1 + num2}`,
          `Mantener el denominador: ${num1 + num2}/${denominator}`,
          `Simplificar si es posible: ${result.numerator}/${result.denominator}`,
        ],
      })
    } else if (difficulty === "medium") {
      // Suma de fracciones con diferente denominador
      const den1 = Math.floor(Math.random() * 6) + 2
      const den2 = Math.floor(Math.random() * 6) + 2
      const num1 = Math.floor(Math.random() * den1) + 1
      const num2 = Math.floor(Math.random() * den2) + 1
      const lcm = this.lcm(den1, den2)
      const newNum1 = num1 * (lcm / den1)
      const newNum2 = num2 * (lcm / den2)
      const result = this.simplifyFraction(newNum1 + newNum2, lcm)

      exercises.push({
        id: `fracciones_${Date.now()}`,
        type: "fraction_addition_different",
        question: `Calcula: ${num1}/${den1} + ${num2}/${den2}`,
        answer: `${result.numerator}/${result.denominator}`,
        explanation: `Para sumar fracciones con diferente denominador, encontramos el MCM de ${den1} y ${den2} que es ${lcm}`,
        difficulty: "medium",
        steps: [
          `Encontrar MCM de ${den1} y ${den2}: ${lcm}`,
          `Convertir fracciones: ${num1}/${den1} = ${newNum1}/${lcm}, ${num2}/${den2} = ${newNum2}/${lcm}`,
          `Sumar: ${newNum1}/${lcm} + ${newNum2}/${lcm} = ${newNum1 + newNum2}/${lcm}`,
          `Simplificar: ${result.numerator}/${result.denominator}`,
        ],
      })
    } else {
      // Operaciones complejas con fracciones
      const den1 = Math.floor(Math.random() * 5) + 2
      const den2 = Math.floor(Math.random() * 5) + 2
      const num1 = Math.floor(Math.random() * den1) + 1
      const num2 = Math.floor(Math.random() * den2) + 1
      const result = this.simplifyFraction(num1 * den2, den1 * num2)

      exercises.push({
        id: `fracciones_${Date.now()}`,
        type: "fraction_division",
        question: `Calcula: (${num1}/${den1}) ÷ (${num2}/${den2})`,
        answer: `${result.numerator}/${result.denominator}`,
        explanation: `Para dividir fracciones, multiplicamos por el recíproco: (${num1}/${den1}) × (${den2}/${num2})`,
        difficulty: "hard",
        steps: [
          `Convertir división en multiplicación por el recíproco`,
          `(${num1}/${den1}) × (${den2}/${num2})`,
          `Multiplicar: ${num1 * den2}/${den1 * num2}`,
          `Simplificar: ${result.numerator}/${result.denominator}`,
        ],
      })
    }

    return exercises
  }

  private generatePotenciacionRadicacion(options: ExerciseOptions): Exercise[] {
    const exercises: Exercise[] = []
    const difficulty = options.difficulty || "easy"

    if (difficulty === "easy") {
      // Potencias básicas
      const base = Math.floor(Math.random() * 8) + 2
      const exponent = Math.floor(Math.random() * 4) + 2
      const result = Math.pow(base, exponent)

      exercises.push({
        id: `potencias_${Date.now()}`,
        type: "basic_power",
        question: `Calcula: ${base}^${exponent}`,
        answer: result,
        explanation: `${base}^${exponent} = ${base} × ${base}${exponent > 2 ? ` × ${base}`.repeat(exponent - 2) : ""} = ${result}`,
        difficulty: "easy",
        steps: this.getPowerSteps(base, exponent),
      })
    } else if (difficulty === "medium") {
      // Leyes de exponentes
      const base = Math.floor(Math.random() * 5) + 2
      const exp1 = Math.floor(Math.random() * 4) + 1
      const exp2 = Math.floor(Math.random() * 4) + 1
      const result = exp1 + exp2

      exercises.push({
        id: `potencias_${Date.now()}`,
        type: "exponent_laws",
        question: `Simplifica usando las leyes de exponentes: ${base}^${exp1} × ${base}^${exp2}`,
        answer: `${base}^${result}`,
        explanation: `Usando la ley a^m × a^n = a^(m+n): ${base}^${exp1} × ${base}^${exp2} = ${base}^${exp1 + exp2} = ${base}^${result}`,
        difficulty: "medium",
        steps: [
          `Identificar la ley: a^m × a^n = a^(m+n)`,
          `Aplicar: ${base}^${exp1} × ${base}^${exp2} = ${base}^(${exp1}+${exp2})`,
          `Simplificar: ${base}^${result}`,
        ],
      })
    } else {
      // Radicales
      const radicand = Math.pow(Math.floor(Math.random() * 5) + 2, 2)
      const result = Math.sqrt(radicand)

      exercises.push({
        id: `potencias_${Date.now()}`,
        type: "radicals",
        question: `Calcula: √${radicand}`,
        answer: result,
        explanation: `√${radicand} = ${result} porque ${result}² = ${radicand}`,
        difficulty: "hard",
        steps: [
          `Buscar un número que al elevarlo al cuadrado dé ${radicand}`,
          `${result}² = ${result} × ${result} = ${radicand}`,
          `Por lo tanto, √${radicand} = ${result}`,
        ],
      })
    }

    return exercises
  }

  // Helper methods
  private classifyNumber(num: number): string {
    if (Number.isInteger(num)) {
      if (num > 0) return "Natural, Entero, Racional, Real"
      if (num === 0) return "Entero, Racional, Real"
      return "Entero, Racional, Real"
    }
    if (this.isRational(num)) return "Racional, Real"
    return "Irracional, Real"
  }

  private isRational(num: number): boolean {
    // Simple check for common irrational numbers
    const irrationals = [Math.PI, Math.E, Math.sqrt(2), Math.sqrt(3), Math.sqrt(5)]
    return !irrationals.some((irrational) => Math.abs(num - irrational) < 0.0001)
  }

  private getNumberClassificationExplanation(num: number): string {
    if (Number.isInteger(num)) {
      if (num > 0) return "es un número natural (positivo), por lo tanto también es entero, racional y real."
      if (num === 0) return "es cero, por lo tanto es entero, racional y real, pero no natural."
      return "es un entero negativo, por lo tanto también es racional y real, pero no natural."
    }
    if (this.isRational(num))
      return "es un número decimal que puede expresarse como fracción, por lo tanto es racional y real."
    return "es un número irracional (no puede expresarse como fracción), pero sí es real."
  }

  private getClassificationSteps(num: number): string[] {
    const steps = ["Analizar el tipo de número"]
    if (Number.isInteger(num)) {
      steps.push("Es un número entero")
      if (num > 0) steps.push("Como es positivo, también es natural")
      steps.push("Todo entero es racional (puede escribirse como fracción)")
    } else {
      steps.push("Es un número decimal")
      if (this.isRational(num)) {
        steps.push("Puede expresarse como fracción, por lo tanto es racional")
      } else {
        steps.push("No puede expresarse como fracción, por lo tanto es irracional")
      }
    }
    steps.push("Todo número racional e irracional pertenece a los reales")
    return steps
  }

  private isPrime(n: number): boolean {
    if (n < 2) return false
    if (n === 2) return true
    if (n % 2 === 0) return false
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false
    }
    return true
  }

  private getPrimeFactorization(n: number): number[] {
    const factors: number[] = []
    let divisor = 2

    while (n > 1) {
      while (n % divisor === 0) {
        factors.push(divisor)
        n /= divisor
      }
      divisor++
    }

    return factors
  }

  private getFactorizationSteps(n: number): string[] {
    const steps: string[] = []
    let current = n
    let divisor = 2

    steps.push(`Comenzar con ${n}`)

    while (current > 1) {
      if (current % divisor === 0) {
        steps.push(`${current} ÷ ${divisor} = ${current / divisor}`)
        current /= divisor
      } else {
        divisor++
      }
    }

    return steps
  }

  private getPrimeCheckSteps(n: number): string[] {
    const steps = [`Verificar si ${n} es primo`]

    if (n < 2) {
      steps.push("Los números menores que 2 no son primos")
      return steps
    }

    if (n === 2) {
      steps.push("2 es el único número primo par")
      return steps
    }

    if (n % 2 === 0) {
      steps.push("Es par y mayor que 2, por lo tanto no es primo")
      return steps
    }

    steps.push("Verificar divisibilidad por números impares hasta √n")

    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) {
        steps.push(`${n} ÷ ${i} = ${n / i}, por lo tanto no es primo`)
        return steps
      }
    }

    steps.push("No se encontraron divisores, por lo tanto es primo")
    return steps
  }

  private gcd(a: number, b: number): number {
    while (b !== 0) {
      const temp = b
      b = a % b
      a = temp
    }
    return a
  }

  private lcm(a: number, b: number): number {
    return (a * b) / this.gcd(a, b)
  }

  private getGcdSteps(a: number, b: number): string[] {
    const steps: string[] = []
    let x = a,
      y = b

    steps.push(`Encontrar MCD de ${a} y ${b} usando el algoritmo de Euclides`)

    while (y !== 0) {
      const remainder = x % y
      steps.push(`${x} = ${y} × ${Math.floor(x / y)} + ${remainder}`)
      x = y
      y = remainder
    }

    steps.push(`MCD = ${x}`)
    return steps
  }

  private getDivisibilityExplanation(num: number, divisor: number): string {
    const isDivisible = num % divisor === 0

    switch (divisor) {
      case 2:
        return `${num} ${isDivisible ? "es" : "no es"} divisible por 2 porque ${isDivisible ? "termina en cifra par" : "termina en cifra impar"}`
      case 3:
        const sumDigits = num
          .toString()
          .split("")
          .reduce((sum, digit) => sum + Number.parseInt(digit), 0)
        return `${num} ${isDivisible ? "es" : "no es"} divisible por 3 porque la suma de sus dígitos (${sumDigits}) ${isDivisible ? "es" : "no es"} divisible por 3`
      case 5:
        return `${num} ${isDivisible ? "es" : "no es"} divisible por 5 porque ${isDivisible ? "termina en 0 o 5" : "no termina en 0 o 5"}`
      default:
        return `${num} ${isDivisible ? "es" : "no es"} divisible por ${divisor}`
    }
  }

  private getDivisibilitySteps(num: number, divisor: number): string[] {
    const steps: string[] = []

    switch (divisor) {
      case 2:
        steps.push("Criterio de divisibilidad por 2: el número debe terminar en cifra par (0, 2, 4, 6, 8)")
        steps.push(`${num} termina en ${num % 10}`)
        steps.push(`${num % 10} ${num % 2 === 0 ? "es par" : "es impar"}`)
        break
      case 3:
        const digits = num
          .toString()
          .split("")
          .map((d) => Number.parseInt(d))
        const sum = digits.reduce((a, b) => a + b, 0)
        steps.push("Criterio de divisibilidad por 3: la suma de los dígitos debe ser divisible por 3")
        steps.push(`Dígitos de ${num}: ${digits.join(" + ")} = ${sum}`)
        steps.push(`${sum} ${sum % 3 === 0 ? "es" : "no es"} divisible por 3`)
        break
      case 5:
        steps.push("Criterio de divisibilidad por 5: el número debe terminar en 0 o 5")
        steps.push(`${num} termina en ${num % 10}`)
        break
      default:
        steps.push(`Verificar si ${num} es divisible por ${divisor}`)
        steps.push(`${num} ÷ ${divisor} = ${num / divisor}`)
    }

    return steps
  }

  private simplifyFraction(numerator: number, denominator: number): { numerator: number; denominator: number } {
    const gcdValue = this.gcd(Math.abs(numerator), Math.abs(denominator))
    return {
      numerator: numerator / gcdValue,
      denominator: denominator / gcdValue,
    }
  }

  private getPowerSteps(base: number, exponent: number): string[] {
    const steps: string[] = []
    steps.push(`${base}^${exponent} significa multiplicar ${base} por sí mismo ${exponent} veces`)

    let calculation = base.toString()
    let result = base

    for (let i = 1; i < exponent; i++) {
      calculation += ` × ${base}`
      result *= base
      if (i < exponent - 1) {
        steps.push(`${calculation} = ${result}`)
      }
    }

    steps.push(`${calculation} = ${result}`)
    return steps
  }

  evaluateAnswer(exercise: Exercise, userAnswer: string): { correct: boolean; feedback: string } {
    const normalizedUserAnswer = userAnswer.trim().toLowerCase()
    const normalizedCorrectAnswer = exercise.answer.toString().toLowerCase()

    const correct = normalizedUserAnswer === normalizedCorrectAnswer

    const feedback = correct
      ? "¡Correcto! " + exercise.explanation
      : `Incorrecto. La respuesta correcta es: ${exercise.answer}. ${exercise.explanation}`

    return { correct, feedback }
  }
}
