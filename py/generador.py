"""
Generador de Ejercicios Avanzado
Sistema inteligente para crear ejercicios matemáticos variados con múltiples niveles de dificultad
"""

import random
import json
import math
from typing import Dict, List, Any, Tuple, Optional, Union
from aritmetica import (
    AritmeticaBasica, 
    Fraccionarios, 
    Potenciacion, 
    ConjuntosNumericos,
    generar_ejercicio_conjuntos,
    generar_ejercicio_primos,
    generar_ejercicio_fraccionarios,
    generar_ejercicio_potenciacion
)

class GeneradorEjercicios:
    """Generador principal de ejercicios matemáticos con IA adaptativa"""
    
    def __init__(self):
        self.dificultades = ['facil', 'medio', 'dificil', 'experto']
        self.temas_disponibles = [
            'conjuntos_numericos',
            'numeros_primos', 
            'fraccionarios',
            'potenciacion_radicacion'
        ]
        
        # Configuración de rangos por dificultad
        self.rangos_dificultad = {
            'facil': {'min': 1, 'max': 50, 'operaciones': ['+', '-', '*']},
            'medio': {'min': 1, 'max': 100, 'operaciones': ['+', '-', '*', '/']},
            'dificil': {'min': 1, 'max': 500, 'operaciones': ['+', '-', '*', '/', '^']},
            'experto': {'min': 1, 'max': 1000, 'operaciones': ['+', '-', '*', '/', '^', 'sqrt']}
        }
        
        # Historial de ejercicios para evitar repeticiones
        self.historial_ejercicios = []
        self.max_historial = 50
    
    def generar_ejercicio(self, tema: str, dificultad: str = 'medio', subtema: Optional[str] = None) -> Dict[str, Any]:
        """Genera un ejercicio basado en el tema, dificultad y subtema especificados"""
        
        if tema not in self.temas_disponibles:
            raise ValueError(f"Tema '{tema}' no disponible. Temas disponibles: {self.temas_disponibles}")
        
        if dificultad not in self.dificultades:
            dificultad = 'medio'
        
        # Seleccionar generador específico
        generadores = {
            'conjuntos_numericos': self._generar_conjuntos,
            'numeros_primos': self._generar_primos,
            'fraccionarios': self._generar_fraccionarios,
            'potenciacion_radicacion': self._generar_potenciacion
        }
        
        ejercicio = generadores[tema](dificultad, subtema)
        
        # Agregar metadatos
        ejercicio.update({
            'tema': tema,
            'dificultad': dificultad,
            'subtema': subtema,
            'timestamp': self._get_timestamp(),
            'id': self._generar_id_ejercicio()
        })
        
        # Agregar al historial
        self._agregar_al_historial(ejercicio)
        
        return ejercicio
    
    def _generar_conjuntos(self, dificultad: str, subtema: Optional[str] = None) -> Dict[str, Any]:
        """Genera ejercicios sobre conjuntos numéricos"""
        
        subtipos = [
            'operaciones_basicas',
            'propiedades_operaciones',
            'clasificacion_numeros',
            'orden_numeros',
            'valor_absoluto',
            'intervalos'
        ]
        
        if subtema and subtema in subtipos:
            tipo = subtema
        else:
            tipo = random.choice(subtipos)
        
        if tipo == 'operaciones_basicas':
            return self._ejercicio_operaciones_basicas(dificultad)
        elif tipo == 'propiedades_operaciones':
            return self._ejercicio_propiedades(dificultad)
        elif tipo == 'clasificacion_numeros':
            return self._ejercicio_clasificacion(dificultad)
        elif tipo == 'orden_numeros':
            return self._ejercicio_orden(dificultad)
        elif tipo == 'valor_absoluto':
            return self._ejercicio_valor_absoluto(dificultad)
        else:  # intervalos
            return self._ejercicio_intervalos(dificultad)
    
    def _ejercicio_operaciones_basicas(self, dificultad: str) -> Dict[str, Any]:
        """Genera ejercicios de operaciones básicas"""
        
        config = self.rangos_dificultad[dificultad]
        operacion = random.choice(config['operaciones'])
        
        if operacion == '+':
            a, b = random.randint(config['min'], config['max']), random.randint(config['min'], config['max'])
            return {
                'pregunta': f'Calcula: {a} + {b}',
                'respuesta': a + b,
                'explicacion': f'{a} + {b} = {a + b}. Aplicamos la suma en los números reales.',
                'tipo': 'suma',
                'pasos': [
                    f'Identificamos los sumandos: {a} y {b}',
                    f'Aplicamos la operación suma: {a} + {b}',
                    f'Resultado: {a + b}'
                ]
            }
        
        elif operacion == '-':
            a = random.randint(config['min'], config['max'])
            b = random.randint(config['min'], min(a, config['max']))
            return {
                'pregunta': f'Calcula: {a} - {b}',
                'respuesta': a - b,
                'explicacion': f'{a} - {b} = {a - b}. Resta en los números reales.',
                'tipo': 'resta',
                'pasos': [
                    f'Identificamos el minuendo: {a} y el sustraendo: {b}',
                    f'Aplicamos la operación resta: {a} - {b}',
                    f'Resultado: {a - b}'
                ]
            }
        
        elif operacion == '*':
            max_factor = min(config['max'] // 10, 50)
            a, b = random.randint(2, max_factor), random.randint(2, max_factor)
            return {
                'pregunta': f'Calcula: {a} × {b}',
                'respuesta': a * b,
                'explicacion': f'{a} × {b} = {a * b}. Multiplicación usando la propiedad conmutativa.',
                'tipo': 'multiplicacion',
                'pasos': [
                    f'Identificamos los factores: {a} y {b}',
                    f'Aplicamos la multiplicación: {a} × {b}',
                    f'Resultado: {a * b}'
                ]
            }
        
        elif operacion == '/':
            b = random.randint(2, 20)
            cociente = random.randint(2, config['max'] // b)
            a = b * cociente
            return {
                'pregunta': f'Calcula: {a} ÷ {b}',
                'respuesta': cociente,
                'explicacion': f'{a} ÷ {b} = {cociente}. División exacta.',
                'tipo': 'division',
                'pasos': [
                    f'Identificamos el dividendo: {a} y el divisor: {b}',
                    f'Verificamos que la división es exacta',
                    f'Aplicamos la división: {a} ÷ {b} = {cociente}'
                ]
            }
        
        elif operacion == '^':
            base = random.randint(2, 10)
            exponente = random.randint(2, 4)
            resultado = base ** exponente
            return {
                'pregunta': f'Calcula: {base}^{exponente}',
                'respuesta': resultado,
                'explicacion': f'{base}^{exponente} = {resultado}. Potenciación.',
                'tipo': 'potencia',
                'pasos': [
                    f'Base: {base}, Exponente: {exponente}',
                    f'Multiplicamos {base} por sí mismo {exponente} veces',
                    f'Resultado: {resultado}'
                ]
            }
        
        else:  # sqrt
            cuadrados = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225]
            numero = random.choice(cuadrados)
            raiz = int(math.sqrt(numero))
            return {
                'pregunta': f'Calcula: √{numero}',
                'respuesta': raiz,
                'explicacion': f'√{numero} = {raiz} porque {raiz}² = {numero}',
                'tipo': 'raiz_cuadrada',
                'pasos': [
                    f'Buscamos un número que elevado al cuadrado dé {numero}',
                    f'Verificamos: {raiz}² = {raiz * raiz}',
                    f'Por lo tanto: √{numero} = {raiz}'
                ]
            }
    
    def _ejercicio_propiedades(self, dificultad: str) -> Dict[str, Any]:
        """Ejercicios sobre propiedades de las operaciones"""
        
        propiedades = [
            'conmutativa_suma',
            'conmutativa_producto',
            'asociativa_suma',
            'asociativa_producto',
            'distributiva',
            'elemento_neutro'
        ]
        
        propiedad = random.choice(propiedades)
        
        if propiedad == 'conmutativa_suma':
            a, b = random.randint(1, 50), random.randint(1, 50)
            return {
                'pregunta': f'Verifica la propiedad conmutativa: {a} + {b} = {b} + {a}',
                'respuesta': f'{a + b} = {a + b}',
                'explicacion': f'La suma es conmutativa: {a} + {b} = {b} + {a} = {a + b}',
                'tipo': 'propiedad_conmutativa',
                'pasos': [
                    f'Calculamos {a} + {b} = {a + b}',
                    f'Calculamos {b} + {a} = {b + a}',
                    f'Verificamos que ambos resultados son iguales: {a + b}'
                ]
            }
        
        elif propiedad == 'distributiva':
            a, b, c = random.randint(2, 10), random.randint(1, 10), random.randint(1, 10)
            lado_izq = a * (b + c)
            lado_der = a * b + a * c
            return {
                'pregunta': f'Aplica la propiedad distributiva: {a} × ({b} + {c})',
                'respuesta': lado_izq,
                'explicacion': f'{a} × ({b} + {c}) = {a} × {b} + {a} × {c} = {a * b} + {a * c} = {lado_izq}',
                'tipo': 'propiedad_distributiva',
                'pasos': [
                    f'Aplicamos distributiva: {a} × ({b} + {c}) = {a} × {b} + {a} × {c}',
                    f'Calculamos cada producto: {a * b} + {a * c}',
                    f'Sumamos: {lado_izq}'
                ]
            }
        
        else:
            # Ejercicio genérico de propiedades
            return {
                'pregunta': '¿Cuál es el elemento neutro de la suma?',
                'respuesta': 0,
                'explicacion': 'El elemento neutro de la suma es 0, porque a + 0 = a para cualquier número real a.',
                'tipo': 'elemento_neutro',
                'pasos': [
                    'El elemento neutro no cambia el resultado de la operación',
                    'Para la suma: a + 0 = a',
                    'Por lo tanto, el elemento neutro de la suma es 0'
                ]
            }
    
    def _ejercicio_clasificacion(self, dificultad: str) -> Dict[str, Any]:
        """Ejercicios de clasificación de números"""
        
        if dificultad == 'facil':
            numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        elif dificultad == 'medio':
            numeros = [13, 14, 15, 16, 17, 18, 19, 20, 21, 25, 28, 30]
        else:
            numeros = [31, 37, 42, 49, 64, 81, 100, 121, 144, 169]
        
        numero = random.choice(numeros)
        clasificacion = ConjuntosNumericos.clasificar_numero(numero)
        
        tipos_pregunta = ['primo', 'par_impar', 'perfecto', 'conjuntos']
        tipo = random.choice(tipos_pregunta)
        
        if tipo == 'primo':
            return {
                'pregunta': f'¿Es {numero} un número primo? (Responde "si" o "no")',
                'respuesta': 'si' if clasificacion['primo'] else 'no',
                'explicacion': f'{numero} {"es" if clasificacion["primo"] else "no es"} primo. ' +
                              (f'Solo es divisible por 1 y {numero}.' if clasificacion['primo'] else 
                               f'Tiene más divisores: {AritmeticaBasica.divisores(numero)}'),
                'tipo': 'clasificacion_primo',
                'pasos': [
                    f'Verificamos si {numero} tiene divisores además de 1 y {numero}',
                    f'Divisores de {numero}: {AritmeticaBasica.divisores(numero)}',
                    f'Conclusión: {numero} {"es" if clasificacion["primo"] else "no es"} primo'
                ]
            }
        
        elif tipo == 'par_impar':
            return {
                'pregunta': f'¿Es {numero} par o impar?',
                'respuesta': 'par' if clasificacion['par'] else 'impar',
                'explicacion': f'{numero} es {"par" if clasificacion["par"] else "impar"} porque {"es" if clasificacion["par"] else "no es"} divisible por 2.',
                'tipo': 'clasificacion_paridad',
                'pasos': [
                    f'Verificamos si {numero} es divisible por 2',
                    f'{numero} ÷ 2 = {numero / 2}',
                    f'Como {"es" if clasificacion["par"] else "no es"} división exacta, {numero} es {"par" if clasificacion["par"] else "impar"}'
                ]
            }
        
        else:  # conjuntos
            conjuntos = []
            if clasificacion['natural']:
                conjuntos.append('N (Naturales)')
            if clasificacion['entero']:
                conjuntos.append('Z (Enteros)')
            if clasificacion['racional']:
                conjuntos.append('Q (Racionales)')
            conjuntos.append('R (Reales)')
            
            return {
                'pregunta': f'¿A qué conjuntos numéricos pertenece {numero}?',
                'respuesta': ', '.join(conjuntos),
                'explicacion': f'{numero} pertenece a: {", ".join(conjuntos)}',
                'tipo': 'clasificacion_conjuntos',
                'pasos': [
                    f'{numero} es un número entero positivo',
                    'Por lo tanto pertenece a los naturales (N)',
                    'También pertenece a enteros (Z), racionales (Q) y reales (R)'
                ]
            }
    
    def _ejercicio_valor_absoluto(self, dificultad: str) -> Dict[str, Any]:
        """Ejercicios de valor absoluto"""
        
        if dificultad == 'facil':
            numero = random.choice([-10, -5, -3, -1, 0, 1, 3, 5, 10])
        else:
            numero = random.randint(-100, 100)
        
        return {
            'pregunta': f'Calcula: |{numero}|',
            'respuesta': abs(numero),
            'explicacion': f'|{numero}| = {abs(numero)}. El valor absoluto es la distancia al cero.',
            'tipo': 'valor_absoluto',
            'pasos': [
                f'El valor absoluto de {numero} es su distancia al 0',
                f'{"Como es positivo, |" + str(numero) + "| = " + str(numero) if numero >= 0 else "Como es negativo, |" + str(numero) + "| = " + str(-numero)}',
                f'Resultado: {abs(numero)}'
            ]
        }
    
    def _generar_primos(self, dificultad: str, subtema: Optional[str] = None) -> Dict[str, Any]:
        """Genera ejercicios sobre números primos"""
        
        subtipos = [
            'identificar_primo',
            'mcd_mcm',
            'factorizacion',
            'divisibilidad',
            'criba_eratostenes',
            'teorema_fundamental'
        ]
        
        if subtema and subtema in subtipos:
            tipo = subtema
        else:
            tipo = random.choice(subtipos)
        
        if tipo == 'identificar_primo':
            return self._ejercicio_identificar_primo(dificultad)
        elif tipo == 'mcd_mcm':
            return self._ejercicio_mcd_mcm(dificultad)
        elif tipo == 'factorizacion':
            return self._ejercicio_factorizacion(dificultad)
        elif tipo == 'divisibilidad':
            return self._ejercicio_divisibilidad(dificultad)
        elif tipo == 'criba_eratostenes':
            return self._ejercicio_criba(dificultad)
        else:  # teorema_fundamental
            return self._ejercicio_teorema_fundamental(dificultad)
    
    def _ejercicio_identificar_primo(self, dificultad: str) -> Dict[str, Any]:
        """Ejercicio para identificar números primos"""
        
        if dificultad == 'facil':
            numeros = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 17, 19]
        elif dificultad == 'medio':
            numeros = [21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49]
        else:
            numeros = list(range(51, 100)) + [101, 103, 107, 109, 113]
        
        numero = random.choice(numeros)
        es_primo = AritmeticaBasica.es_primo(numero)
        divisores = AritmeticaBasica.divisores(numero)
        
        return {
            'pregunta': f'¿Es {numero} un número primo? (Responde "si" o "no")',
            'respuesta': 'si' if es_primo else 'no',
            'explicacion': f'{numero} {"es" if es_primo else "no es"} primo. ' +
                          (f'Solo es divisible por 1 y {numero}.' if es_primo else 
                           f'Sus divisores son: {divisores}'),
            'tipo': 'identificar_primo',
            'pasos': [
                f'Para verificar si {numero} es primo, buscamos sus divisores',
                f'Divisores de {numero}: {divisores}',
                f'Un número primo solo tiene dos divisores: 1 y él mismo',
                f'Conclusión: {numero} {"es" if es_primo else "no es"} primo'
            ]
        }
    
    def _ejercicio_mcd_mcm(self, dificultad: str) -> Dict[str, Any]:
        """Ejercicio de MCD y MCM"""
        
        if dificultad == 'facil':
            rangos = (6, 30)
        elif dificultad == 'medio':
            rangos = (10, 60)
        else:
            rangos = (15, 120)
        
        a, b = random.randint(*rangos), random.randint(*rangos)
        operacion = random.choice(['mcd', 'mcm'])
        
        if operacion == 'mcd':
            resultado = AritmeticaBasica.mcd(a, b)
            return {
                'pregunta': f'Calcula el MCD de {a} y {b}',
                'respuesta': resultado,
                'explicacion': f'MCD({a}, {b}) = {resultado}. Usando el algoritmo de Euclides.',
                'tipo': 'mcd',
                'pasos': [
                    f'Aplicamos el algoritmo de Euclides para MCD({a}, {b})',
                    f'Divisores de {a}: {AritmeticaBasica.divisores(a)}',
                    f'Divisores de {b}: {AritmeticaBasica.divisores(b)}',
                    f'El mayor divisor común es: {resultado}'
                ]
            }
        else:
            resultado = AritmeticaBasica.mcm(a, b)
            mcd = AritmeticaBasica.mcd(a, b)
            return {
                'pregunta': f'Calcula el MCM de {a} y {b}',
                'respuesta': resultado,
                'explicacion': f'MCM({a}, {b}) = {resultado}. Usando la fórmula: MCM = (a × b) ÷ MCD',
                'tipo': 'mcm',
                'pasos': [
                    f'Primero calculamos MCD({a}, {b}) = {mcd}',
                    f'Aplicamos la fórmula: MCM = (a × b) ÷ MCD',
                    f'MCM = ({a} × {b}) ÷ {mcd} = {a * b} ÷ {mcd} = {resultado}'
                ]
            }
    
    def _ejercicio_factorizacion(self, dificultad: str) -> Dict[str, Any]:
        """Ejercicio de factorización prima"""
        
        if dificultad == 'facil':
            numeros = [12, 18, 20, 24, 30, 36]
        elif dificultad == 'medio':
            numeros = [42, 48, 54, 60, 72, 84, 90, 96]
        else:
            numeros = [120, 144, 180, 210, 240, 300, 360, 420]
        
        numero = random.choice(numeros)
        factores = AritmeticaBasica.factores_primos(numero)
        factorizacion = AritmeticaBasica.factorizacion_completa(numero)
        
        # Crear representación de la factorización
        factorizacion_str = ' × '.join([f'{p}^{e}' if e > 1 else str(p) for p, e in factorizacion.items()])
        
        return {
            'pregunta': f'Encuentra la factorización prima de {numero}',
            'respuesta': factorizacion_str,
            'explicacion': f'{numero} = {factorizacion_str}',
            'tipo': 'factorizacion',
            'pasos': [
                f'Dividimos {numero} por números primos sucesivamente',
                f'Factores primos encontrados: {factores}',
                f'Agrupamos factores repetidos: {factorizacion}',
                f'Factorización prima: {numero} = {factorizacion_str}'
            ]
        }
    
    def _ejercicio_divisibilidad(self, dificultad: str) -> Dict[str, Any]:
        """Ejercicio de criterios de divisibilidad"""
        
        if dificultad == 'facil':
            numeros = [24, 36, 45, 60, 72, 90]
            divisores = [2, 3, 5]
        elif dificultad == 'medio':
            numeros = [108, 126, 144, 162, 180, 198]
            divisores = [2, 3, 4, 5, 6, 9]
        else:
            numeros = [264, 396, 528, 660, 792, 924]
            divisores = [2, 3, 4, 6, 8, 9, 11]
        
        numero = random.choice(numeros)
        divisor = random.choice(divisores)
        
        criterios = AritmeticaBasica.criterios_divisibilidad(numero)
        es_divisible = criterios.get(divisor, numero % divisor == 0)
        
        return {
            'pregunta': f'¿Es {numero} divisible por {divisor}? (Responde "si" o "no")',
            'respuesta': 'si' if es_divisible else 'no',
            'explicacion': f'{numero} {"es" if es_divisible else "no es"} divisible por {divisor}. ' +
                          self._explicar_criterio_divisibilidad(numero, divisor),
            'tipo': 'divisibilidad',
            'pasos': self._pasos_criterio_divisibilidad(numero, divisor)
        }
    
    def _generar_fraccionarios(self, dificultad: str, subtema: Optional[str] = None) -> Dict[str, Any]:
        """Genera ejercicios sobre fracciones"""
        
        subtipos = [
            'operaciones_fracciones',
            'simplificacion',
            'comparacion',
            'conversion_decimal',
            'fracciones_mixtas',
            'problemas_aplicados'
        ]
        
        if subtema and subtema in subtipos:
            tipo = subtema
        else:
            tipo = random.choice(subtipos)
        
        if tipo == 'operaciones_fracciones':
            return self._ejercicio_operaciones_fracciones(dificultad)
        elif tipo == 'simplificacion':
            return self._ejercicio_simplificacion(dificultad)
        elif tipo == 'comparacion':
            return self._ejercicio_comparacion_fracciones(dificultad)
        elif tipo == 'conversion_decimal':
            return self._ejercicio_conversion_decimal(dificultad)
        elif tipo == 'fracciones_mixtas':
            return self._ejercicio_fracciones_mixtas(dificultad)
        else:  # problemas_aplicados
            return self._ejercicio_problemas_fracciones(dificultad)
    
    def _ejercicio_operaciones_fracciones(self, dificultad: str) -> Dict[str, Any]:
        """Ejercicio de operaciones con fracciones"""
        
        if dificultad == 'facil':
            rango = (1, 10)
        elif dificultad == 'medio':
            rango = (1, 20)
        else:
            rango = (1, 50)
        
        # Generar fracciones
        n1, d1 = random.randint(*rango), random.randint(2, rango[1])
        n2, d2 = random.randint(*rango), random.randint(2, rango[1])
        
        operacion = random.choice(['+', '-', '*', '/'])
        
        if operacion == '+':
            num_res, den_res = Fraccionarios.sumar_fracciones(n1, d1, n2, d2)
            mcm = AritmeticaBasica.mcm(d1, d2)
            return {
                'pregunta': f'Calcula: {n1}/{d1} + {n2}/{d2}',
                'respuesta': f'{num_res}/{den_res}',
                'explicacion': f'{n1}/{d1} + {n2}/{d2} = {num_res}/{den_res}',
                'tipo': 'suma_fracciones',
                'pasos': [
                    f'Encontramos el MCM de {d1} y {d2}: {mcm}',
                    f'Convertimos a denominador común: {n1 * (mcm // d1)}/{mcm} + {n2 * (mcm // d2)}/{mcm}',
                    f'Sumamos numeradores: {n1 * (mcm // d1) + n2 * (mcm // d2)}/{mcm}',
                    f'Simplificamos: {num_res}/{den_res}'
                ]
            }
        
        elif operacion == '-':
            num_res, den_res = Fraccionarios.restar_fracciones(n1, d1, n2, d2)
            mcm = AritmeticaBasica.mcm(d1, d2)
            return {
                'pregunta': f'Calcula: {n1}/{d1} - {n2}/{d2}',
                'respuesta': f'{num_res}/{den_res}',
                'explicacion': f'{n1}/{d1} - {n2}/{d2} = {num_res}/{den_res}',
                'tipo': 'resta_fracciones',
                'pasos': [
                    f'Encontramos el MCM de {d1} y {d2}: {mcm}',
                    f'Convertimos a denominador común: {n1 * (mcm // d1)}/{mcm} - {n2 * (mcm // d2)}/{mcm}',
                    f'Restamos numeradores: {n1 * (mcm // d1) - n2 * (mcm // d2)}/{mcm}',
                    f'Simplificamos: {num_res}/{den_res}'
                ]
            }
        
        elif operacion == '*':
            num_res, den_res = Fraccionarios.multiplicar_fracciones(n1, d1, n2, d2)
            return {
                'pregunta': f'Calcula: {n1}/{d1} × {n2}/{d2}',
                'respuesta': f'{num_res}/{den_res}',
                'explicacion': f'{n1}/{d1} × {n2}/{d2} = ({n1} × {n2})/({d1} × {d2}) = {num_res}/{den_res}',
                'tipo': 'multiplicacion_fracciones',
                'pasos': [
                    f'Multiplicamos numeradores: {n1} × {n2} = {n1 * n2}',
                    f'Multiplicamos denominadores: {d1} × {d2} = {d1 * d2}',
                    f'Resultado: {n1 * n2}/{d1 * d2}',
                    f'Simplificamos: {num_res}/{den_res}'
                ]
            }
        
        else:  # división
            if n2 != 0:
                num_res, den_res = Fraccionarios.dividir_fracciones(n1, d1, n2, d2)
                return {
                    'pregunta': f'Calcula: {n1}/{d1} ÷ {n2}/{d2}',
                    'respuesta': f'{num_res}/{den_res}',
                    'explicacion': f'{n1}/{d1} ÷ {n2}/{d2} = {n1}/{d1} × {d2}/{n2} = {num_res}/{den_res}',
                    'tipo': 'division_fracciones',
                    'pasos': [
                        f'Convertimos la división en multiplicación por el recíproco',
                        f'{n1}/{d1} ÷ {n2}/{d2} = {n1}/{d1} × {d2}/{n2}',
                        f'Multiplicamos: ({n1} × {d2})/({d1} × {n2}) = {n1 * d2}/{d1 * n2}',
                        f'Simplificamos: {num_res}/{den_res}'
                    ]
                }
            else:
                # Recursión para evitar división por cero
                return self._ejercicio_operaciones_fracciones(dificultad)
    
    def _ejercicio_simplificacion(self, dificultad: str) -> Dict[str, Any]:
        """Ejercicio de simplificación de fracciones"""
        
        # Generar fracción que se pueda simplificar
        if dificultad == 'facil':
            factor = random.randint(2, 4)
            n_simple = random.randint(1, 6)
            d_simple = random.randint(2, 6)
        elif dificultad == 'medio':
            factor = random.randint(2, 8)
            n_simple = random.randint(1, 10)
            d_simple = random.randint(2, 10)
        else:
            factor = random.randint(2, 12)
            n_simple = random.randint(1, 15)
            d_simple = random.randint(2, 15)
        
        numerador = n_simple * factor
        denominador = d_simple * factor
        
        num_simp, den_simp = Fraccionarios.simplificar_fraccion(numerador, denominador)
        mcd = AritmeticaBasica.mcd(numerador, denominador)
        
        return {
            'pregunta': f'Simplifica la fracción {numerador}/{denominador}',
            'respuesta': f'{num_simp}/{den_simp}',
            'explicacion': f'{numerador}/{denominador} = {num_simp}/{den_simp}',
            'tipo': 'simplificacion',
            'pasos': [
                f'Encontramos el MCD de {numerador} y {denominador}',
                f'MCD({numerador}, {denominador}) = {mcd}',
                f'Dividimos numerador y denominador por el MCD',
                f'{numerador} ÷ {mcd} = {num_simp}, {denominador} ÷ {mcd} = {den_simp}',
                f'Fracción simplificada: {num_simp}/{den_simp}'
            ]
        }
    
    def _generar_potenciacion(self, dificultad: str, subtema: Optional[str] = None) -> Dict[str, Any]:
        """Genera ejercicios sobre potenciación y radicación"""
        
        subtipos = [
            'potencias',
            'raices',
            'leyes_exponentes',
            'simplificacion_radicales',
            'exponentes_negativos',
            'notacion_cientifica'
        ]
        
        if subtema and subtema in subtipos:
            tipo = subtema
        else:
            tipo = random.choice(subtipos)
        
        if tipo == 'potencias':
            return self._ejercicio_potencias(dificultad)
        elif tipo == 'raices':
            return self._ejercicio_raices(dificultad)
        elif tipo == 'leyes_exponentes':
            return self._ejercicio_leyes_exponentes(dificultad)
        elif tipo == 'simplificacion_radicales':
            return self._ejercicio_simplificacion_radicales(dificultad)
        elif tipo == 'exponentes_negativos':
            return self._ejercicio_exponentes_negativos(dificultad)
        else:  # notacion_cientifica
            return self._ejercicio_notacion_cientifica(dificultad)
    
    def _ejercicio_potencias(self, dificultad: str) -> Dict[str, Any]:
        """Ejercicio de potencias"""
        
        if dificultad == 'facil':
            base = random.randint(2, 5)
            exponente = random.randint(2, 4)
        elif dificultad == 'medio':
            base = random.randint(2, 10)
            exponente = random.randint(2, 5)
        else:
            base = random.randint(2, 12)
            exponente = random.randint(2, 6)
        
        resultado = base ** exponente
        
        return {
            'pregunta': f'Calcula: {base}^{exponente}',
            'respuesta': resultado,
            'explicacion': f'{base}^{exponente} = {resultado}',
            'tipo': 'potencia',
            'pasos': [
                f'Base: {base}, Exponente: {exponente}',
                f'Multiplicamos {base} por sí mismo {exponente} veces',
                f'{" × ".join([str(base)] * exponente)} = {resultado}'
            ]
        }
    
    def _ejercicio_raices(self, dificultad: str) -> Dict[str, Any]:
        """Ejercicio de raíces"""
        
        if dificultad == 'facil':
            cuadrados = [4, 9, 16, 25, 36, 49, 64, 81, 100]
        elif dificultad == 'medio':
            cuadrados = [121, 144, 169, 196, 225, 256, 289, 324, 361, 400]
        else:
            cuadrados = [441, 484, 529, 576, 625, 676, 729, 784, 841, 900]
        
        numero = random.choice(cuadrados)
        raiz = int(math.sqrt(numero))
        
        return {
            'pregunta': f'Calcula: √{numero}',
            'respuesta': raiz,
            'explicacion': f'√{numero} = {raiz} porque {raiz}² = {numero}',
            'tipo': 'raiz_cuadrada',
            'pasos': [
                f'Buscamos un número que elevado al cuadrado dé {numero}',
                f'Probamos: {raiz}² = {raiz * raiz}',
                f'Verificamos: {raiz * raiz} = {numero} ✓',
                f'Por lo tanto: √{numero} = {raiz}'
            ]
        }
    
    # Métodos auxiliares
    def _explicar_criterio_divisibilidad(self, numero: int, divisor: int) -> str:
        """Explica el criterio de divisibilidad aplicado"""
        
        if divisor == 2:
            return f"Un número es divisible por 2 si termina en cifra par. {numero} termina en {str(numero)[-1]}."
        elif divisor == 3:
            suma = sum(int(d) for d in str(numero))
            return f"Un número es divisible por 3 si la suma de sus cifras es divisible por 3. Suma: {suma}."
        elif divisor == 5:
            return f"Un número es divisible por 5 si termina en 0 o 5. {numero} termina en {str(numero)[-1]}."
        else:
            return f"Verificamos dividiendo: {numero} ÷ {divisor} = {numero / divisor}"
    
    def _pasos_criterio_divisibilidad(self, numero: int, divisor: int) -> List[str]:
        """Devuelve los pasos para verificar divisibilidad"""
        
        if divisor == 2:
            return [
                f"Verificamos si {numero} es divisible por 2",
                f"Criterio: Un número es divisible por 2 si termina en cifra par",
                f"{numero} termina en {str(numero)[-1]}",
                f"Conclusión: {numero} {'es' if numero % 2 == 0 else 'no es'} divisible por 2"
            ]
        elif divisor == 3:
            suma = sum(int(d) for d in str(numero))
            return [
                f"Verificamos si {numero} es divisible por 3",
                f"Criterio: Un número es divisible por 3 si la suma de sus cifras es divisible por 3",
                f"Suma de cifras: {' + '.join(str(numero))} = {suma}",
                f"¿Es {suma} divisible por 3? {suma % 3 == 0}",
                f"Conclusión: {numero} {'es' if numero % 3 == 0 else 'no es'} divisible por 3"
            ]
        else:
            return [
                f"Verificamos si {numero} es divisible por {divisor}",
                f"Realizamos la división: {numero} ÷ {divisor}",
                f"Resultado: {numero / divisor}",
                f"Conclusión: {'Es división exacta' if numero % divisor == 0 else 'No es división exacta'}"
            ]
    
    def _get_timestamp(self) -> str:
        """Genera timestamp para el ejercicio"""
        import time
        return str(int(time.time()))
    
    def _generar_id_ejercicio(self) -> str:
        """Genera ID único para el ejercicio"""
        import hashlib
        import time
        data = f"{time.time()}{random.random()}"
        return hashlib.md5(data.encode()).hexdigest()[:8]
    
    def _agregar_al_historial(self, ejercicio: Dict[str, Any]) -> None:
        """Agrega ejercicio al historial"""
        self.historial_ejercicios.append(ejercicio)
        if len(self.historial_ejercicios) > self.max_historial:
            self.historial_ejercicios.pop(0)
    
    def generar_examen(self, tema: str, num_preguntas: int = 10, dificultad: str = 'medio') -> List[Dict[str, Any]]:
        """Genera un examen completo con múltiples ejercicios"""
        
        examen = []
        subtipos_usados = set()
        
        for i in range(num_preguntas):
            # Intentar variar los subtipos
            max_intentos = 5
            for _ in range(max_intentos):
                ejercicio = self.generar_ejercicio(tema, dificultad)
                if ejercicio['tipo'] not in subtipos_usados or len(subtipos_usados) >= 5:
                    break
            
            ejercicio['numero'] = i + 1
            subtipos_usados.add(ejercicio['tipo'])
            examen.append(ejercicio)
        
        return examen
    
    def evaluar_respuestas(self, examen: List[Dict[str, Any]], respuestas: List[str]) -> Dict[str, Any]:
        """Evalúa las respuestas de un examen"""
        
        if len(examen) != len(respuestas):
            raise ValueError("El número de respuestas no coincide con el número de preguntas")
        
        correctas = 0
        incorrectas = 0
        detalles = []
        puntos_por_dificultad = {'facil': 1, 'medio': 2, 'dificil': 3, 'experto': 4}
        puntos_totales = 0
        puntos_obtenidos = 0
        
        for i, (ejercicio, respuesta) in enumerate(zip(examen, respuestas)):
            respuesta_correcta = str(ejercicio['respuesta']).lower().strip()
            respuesta_usuario = respuesta.lower().strip()
            
            # Manejo especial para diferentes tipos de respuesta
            es_correcta = self._comparar_respuestas(respuesta_correcta, respuesta_usuario, ejercicio['tipo'])
            
            puntos_pregunta = puntos_por_dificultad.get(ejercicio.get('dificultad', 'medio'), 2)
            puntos_totales += puntos_pregunta
            
            if es_correcta:
                correctas += 1
                puntos_obtenidos += puntos_pregunta
            else:
                incorrectas += 1
            
            detalles.append({
                'numero': i + 1,
                'pregunta': ejercicio['pregunta'],
                'respuesta_usuario': respuesta,
                'respuesta_correcta': ejercicio['respuesta'],
                'es_correcta': es_correcta,
                'explicacion': ejercicio['explicacion'],
                'pasos': ejercicio.get('pasos', []),
                'puntos': puntos_pregunta if es_correcta else 0,
                'tipo': ejercicio['tipo']
            })
        
        porcentaje = (puntos_obtenidos / puntos_totales) * 100 if puntos_totales > 0 else 0
        
        return {
            'correctas': correctas,
            'incorrectas': incorrectas,
            'total': len(examen),
            'porcentaje': porcentaje,
            'puntos_obtenidos': puntos_obtenidos,
            'puntos_totales': puntos_totales,
            'calificacion': self._obtener_calificacion(porcentaje),
            'nivel_dominio': self._obtener_nivel_dominio(porcentaje),
            'detalles': detalles,
            'recomendaciones': self._generar_recomendaciones(detalles)
        }
    
    def _comparar_respuestas(self, correcta: str, usuario: str, tipo: str) -> bool:
        """Compara respuestas considerando el tipo de ejercicio"""
        
        if tipo in ['suma_fracciones', 'resta_fracciones', 'multiplicacion_fracciones', 'division_fracciones', 'simplificacion']:
            # Para fracciones, comparar numerador y denominador
            try:
                if '/' in correcta and '/' in usuario:
                    n1, d1 = map(int, correcta.split('/'))
                    n2, d2 = map(int, usuario.split('/'))
                    # Verificar si son fracciones equivalentes
                    return n1 * d2 == n2 * d1
            except:
                pass
        
        # Comparación numérica para respuestas numéricas
        try:
            return abs(float(correcta) - float(usuario)) < 0.001
        except:
            pass
        
        # Comparación de texto
        return correcta == usuario
    
    def _obtener_calificacion(self, porcentaje: float) -> str:
        """Obtiene la calificación basada en el porcentaje"""
        if porcentaje >= 95:
            return 'Excelente'
        elif porcentaje >= 85:
            return 'Muy Bueno'
        elif porcentaje >= 75:
            return 'Bueno'
        elif porcentaje >= 65:
            return 'Regular'
        elif porcentaje >= 50:
            return 'Suficiente'
        else:
            return 'Insuficiente'
    
    def _obtener_nivel_dominio(self, porcentaje: float) -> str:
        """Obtiene el nivel de dominio del tema"""
        if porcentaje >= 90:
            return 'Dominio Avanzado'
        elif porcentaje >= 75:
            return 'Dominio Intermedio'
        elif porcentaje >= 60:
            return 'Dominio Básico'
        else:
            return 'Requiere Refuerzo'
    
    def _generar_recomendaciones(self, detalles: List[Dict[str, Any]]) -> List[str]:
        """Genera recomendaciones basadas en los errores"""
        
        recomendaciones = []
        tipos_incorrectos = [d['tipo'] for d in detalles if not d['es_correcta']]
        
        if 'suma' in tipos_incorrectos or 'resta' in tipos_incorrectos:
            recomendaciones.append("Practica más operaciones básicas de suma y resta")
        
        if 'multiplicacion' in tipos_incorrectos or 'division' in tipos_incorrectos:
            recomendaciones.append("Refuerza las tablas de multiplicar y división")
        
        if any('fraccion' in tipo for tipo in tipos_incorrectos):
            recomendaciones.append("Estudia más las operaciones con fracciones")
        
        if 'primo' in tipos_incorrectos:
            recomendaciones.append("Repasa los conceptos de números primos")
        
        if not recomendaciones:
            recomendaciones.append("¡Excelente trabajo! Continúa practicando para mantener tu nivel")
        
        return recomendaciones

# Instancia global del generador
generador = GeneradorEjercicios()

# Funciones de conveniencia para usar desde JavaScript
def generar_ejercicio_tema(tema: str, dificultad: str = 'medio') -> Dict[str, Any]:
    """Función de conveniencia para generar ejercicios desde JavaScript"""
    return generador.generar_ejercicio(tema, dificultad)

def generar_examen_tema(tema: str, num_preguntas: int = 10, dificultad: str = 'medio') -> List[Dict[str, Any]]:
    """Función de conveniencia para generar exámenes desde JavaScript"""
    return generador.generar_examen(tema, num_preguntas, dificultad)

def evaluar_examen(examen: List[Dict[str, Any]], respuestas: List[str]) -> Dict[str, Any]:
    """Función de conveniencia para evaluar exámenes desde JavaScript"""
    return generador.evaluar_respuestas(examen, respuestas)
