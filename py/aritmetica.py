"""
Módulo de Aritmética Básica
Contiene funciones para operaciones básicas, números primos, MCD, MCM, etc.
Versión mejorada con más funcionalidades y validaciones
"""

import math
import random
from typing import List, Tuple, Dict, Any, Union
from fractions import Fraction

class ConjuntosNumericos:
    """Clase para trabajar con conjuntos numéricos y sus propiedades"""
    
    @staticmethod
    def clasificar_numero(n: Union[int, float]) -> Dict[str, bool]:
        """Clasifica un número según los conjuntos numéricos a los que pertenece"""
        clasificacion = {
            'natural': False,
            'entero': False,
            'racional': False,
            'irracional': False,
            'real': True,  # Asumimos que trabajamos solo con números reales
            'par': False,
            'impar': False,
            'primo': False,
            'compuesto': False,
            'perfecto': False
        }
        
        # Verificar si es entero
        if isinstance(n, int) or (isinstance(n, float) and n.is_integer()):
            n_int = int(n)
            clasificacion['entero'] = True
            clasificacion['racional'] = True
            
            # Verificar si es natural
            if n_int > 0:
                clasificacion['natural'] = True
            
            # Verificar paridad
            if n_int % 2 == 0:
                clasificacion['par'] = True
            else:
                clasificacion['impar'] = True
            
            # Verificar si es primo
            if AritmeticaBasica.es_primo(abs(n_int)):
                clasificacion['primo'] = True
            elif abs(n_int) > 1:
                clasificacion['compuesto'] = True
            
            # Verificar si es perfecto
            if ConjuntosNumericos.es_perfecto(abs(n_int)):
                clasificacion['perfecto'] = True
        
        elif isinstance(n, float):
            # Es racional si se puede expresar como fracción
            try:
                frac = Fraction(n).limit_denominator(10000)
                if abs(float(frac) - n) < 1e-10:
                    clasificacion['racional'] = True
                else:
                    clasificacion['irracional'] = True
            except:
                clasificacion['irracional'] = True
        
        return clasificacion
    
    @staticmethod
    def es_perfecto(n: int) -> bool:
        """Verifica si un número es perfecto (suma de sus divisores propios = n)"""
        if n <= 1:
            return False
        
        suma_divisores = 1  # 1 siempre es divisor propio
        for i in range(2, int(math.sqrt(n)) + 1):
            if n % i == 0:
                suma_divisores += i
                if i != n // i:  # Evitar contar dos veces la raíz cuadrada
                    suma_divisores += n // i
        
        return suma_divisores == n
    
    @staticmethod
    def propiedades_operaciones() -> Dict[str, str]:
        """Devuelve las propiedades de las operaciones en los reales"""
        return {
            'conmutativa_suma': 'a + b = b + a',
            'conmutativa_producto': 'a × b = b × a',
            'asociativa_suma': '(a + b) + c = a + (b + c)',
            'asociativa_producto': '(a × b) × c = a × (b × c)',
            'distributiva': 'a × (b + c) = a × b + a × c',
            'elemento_neutro_suma': 'a + 0 = a',
            'elemento_neutro_producto': 'a × 1 = a',
            'elemento_inverso_suma': 'a + (-a) = 0',
            'elemento_inverso_producto': 'a × (1/a) = 1 (a ≠ 0)'
        }

class AritmeticaBasica:
    """Clase para manejar operaciones de aritmética básica"""
    
    @staticmethod
    def es_primo(n: int) -> bool:
        """Verifica si un número es primo"""
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
    def generar_primos(limite: int) -> List[int]:
        """Genera todos los números primos hasta un límite usando la Criba de Eratóstenes"""
        if limite < 2:
            return []
        
        es_primo = [True] * (limite + 1)
        es_primo[0] = es_primo[1] = False
        
        for i in range(2, int(math.sqrt(limite)) + 1):
            if es_primo[i]:
                for j in range(i * i, limite + 1, i):
                    es_primo[j] = False
        
        return [i for i in range(2, limite + 1) if es_primo[i]]
    
    @staticmethod
    def factores_primos(n: int) -> List[int]:
        """Encuentra los factores primos de un número"""
        if n <= 1:
            return []
        
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
    
    @staticmethod
    def factorizacion_completa(n: int) -> Dict[int, int]:
        """Devuelve la factorización completa como diccionario {factor: exponente}"""
        factores = AritmeticaBasica.factores_primos(n)
        factorizacion = {}
        
        for factor in factores:
            factorizacion[factor] = factorizacion.get(factor, 0) + 1
        
        return factorizacion
    
    @staticmethod
    def mcd(a: int, b: int) -> int:
        """Calcula el Máximo Común Divisor usando el algoritmo de Euclides"""
        a, b = abs(a), abs(b)
        while b:
            a, b = b, a % b
        return a
    
    @staticmethod
    def mcd_extendido(a: int, b: int) -> Tuple[int, int, int]:
        """Algoritmo extendido de Euclides: devuelve (mcd, x, y) donde ax + by = mcd"""
        if a == 0:
            return b, 0, 1
        
        mcd, x1, y1 = AritmeticaBasica.mcd_extendido(b % a, a)
        x = y1 - (b // a) * x1
        y = x1
        
        return mcd, x, y
    
    @staticmethod
    def mcm(a: int, b: int) -> int:
        """Calcula el Mínimo Común Múltiplo"""
        if a == 0 or b == 0:
            return 0
        return abs(a * b) // AritmeticaBasica.mcd(a, b)
    
    @staticmethod
    def mcm_lista(numeros: List[int]) -> int:
        """Calcula el MCM de una lista de números"""
        if not numeros:
            return 0
        
        resultado = numeros[0]
        for i in range(1, len(numeros)):
            resultado = AritmeticaBasica.mcm(resultado, numeros[i])
        
        return resultado
    
    @staticmethod
    def mcd_lista(numeros: List[int]) -> int:
        """Calcula el MCD de una lista de números"""
        if not numeros:
            return 0
        
        resultado = numeros[0]
        for i in range(1, len(numeros)):
            resultado = AritmeticaBasica.mcd(resultado, numeros[i])
        
        return resultado
    
    @staticmethod
    def divisores(n: int) -> List[int]:
        """Encuentra todos los divisores de un número"""
        if n == 0:
            return []
        
        n = abs(n)
        divisores = []
        
        for i in range(1, int(math.sqrt(n)) + 1):
            if n % i == 0:
                divisores.append(i)
                if i != n // i:
                    divisores.append(n // i)
        
        return sorted(divisores)
    
    @staticmethod
    def es_divisible(dividendo: int, divisor: int) -> bool:
        """Verifica si un número es divisible por otro"""
        if divisor == 0:
            return False
        return dividendo % divisor == 0
    
    @staticmethod
    def criterios_divisibilidad(n: int) -> Dict[int, bool]:
        """Aplica criterios de divisibilidad para números del 2 al 11"""
        n_abs = abs(n)
        n_str = str(n_abs)
        criterios = {}
        
        # Divisibilidad por 2
        criterios[2] = n_abs % 2 == 0
        
        # Divisibilidad por 3
        suma_digitos = sum(int(d) for d in n_str)
        criterios[3] = suma_digitos % 3 == 0
        
        # Divisibilidad por 4
        if len(n_str) >= 2:
            ultimos_dos = int(n_str[-2:])
            criterios[4] = ultimos_dos % 4 == 0
        else:
            criterios[4] = n_abs % 4 == 0
        
        # Divisibilidad por 5
        criterios[5] = n_str[-1] in ['0', '5']
        
        # Divisibilidad por 6
        criterios[6] = criterios[2] and criterios[3]
        
        # Divisibilidad por 7 (método de divisibilidad)
        if len(n_str) >= 2:
            resto = n_abs
            while resto >= 70:
                ultimo_digito = resto % 10
                resto = resto // 10
                resto -= 2 * ultimo_digito
            criterios[7] = resto % 7 == 0
        else:
            criterios[7] = n_abs % 7 == 0
        
        # Divisibilidad por 8
        if len(n_str) >= 3:
            ultimos_tres = int(n_str[-3:])
            criterios[8] = ultimos_tres % 8 == 0
        else:
            criterios[8] = n_abs % 8 == 0
        
        # Divisibilidad por 9
        criterios[9] = suma_digitos % 9 == 0
        
        # Divisibilidad por 10
        criterios[10] = n_str[-1] == '0'
        
        # Divisibilidad por 11
        suma_alternada = 0
        for i, digito in enumerate(n_str[::-1]):
            if i % 2 == 0:
                suma_alternada += int(digito)
            else:
                suma_alternada -= int(digito)
        criterios[11] = suma_alternada % 11 == 0
        
        return criterios

class Fraccionarios:
    """Clase para manejar operaciones con fracciones"""
    
    @staticmethod
    def simplificar_fraccion(numerador: int, denominador: int) -> Tuple[int, int]:
        """Simplifica una fracción a su mínima expresión"""
        if denominador == 0:
            raise ValueError("El denominador no puede ser cero")
        
        # Manejar signos
        if denominador < 0:
            numerador = -numerador
            denominador = -denominador
        
        mcd = AritmeticaBasica.mcd(abs(numerador), abs(denominador))
        return numerador // mcd, denominador // mcd
    
    @staticmethod
    def sumar_fracciones(n1: int, d1: int, n2: int, d2: int) -> Tuple[int, int]:
        """Suma dos fracciones y devuelve el resultado simplificado"""
        denominador_comun = AritmeticaBasica.mcm(d1, d2)
        numerador_resultado = n1 * (denominador_comun // d1) + n2 * (denominador_comun // d2)
        return Fraccionarios.simplificar_fraccion(numerador_resultado, denominador_comun)
    
    @staticmethod
    def restar_fracciones(n1: int, d1: int, n2: int, d2: int) -> Tuple[int, int]:
        """Resta dos fracciones y devuelve el resultado simplificado"""
        denominador_comun = AritmeticaBasica.mcm(d1, d2)
        numerador_resultado = n1 * (denominador_comun // d1) - n2 * (denominador_comun // d2)
        return Fraccionarios.simplificar_fraccion(numerador_resultado, denominador_comun)
    
    @staticmethod
    def multiplicar_fracciones(n1: int, d1: int, n2: int, d2: int) -> Tuple[int, int]:
        """Multiplica dos fracciones y devuelve el resultado simplificado"""
        numerador_resultado = n1 * n2
        denominador_resultado = d1 * d2
        return Fraccionarios.simplificar_fraccion(numerador_resultado, denominador_resultado)
    
    @staticmethod
    def dividir_fracciones(n1: int, d1: int, n2: int, d2: int) -> Tuple[int, int]:
        """Divide dos fracciones y devuelve el resultado simplificado"""
        if n2 == 0:
            raise ValueError("No se puede dividir por cero")
        return Fraccionarios.multiplicar_fracciones(n1, d1, d2, n2)
    
    @staticmethod
    def comparar_fracciones(n1: int, d1: int, n2: int, d2: int) -> int:
        """Compara dos fracciones. Devuelve -1, 0, o 1"""
        # Convertir a denominador común
        denominador_comun = AritmeticaBasica.mcm(d1, d2)
        num1_convertido = n1 * (denominador_comun // d1)
        num2_convertido = n2 * (denominador_comun // d2)
        
        if num1_convertido < num2_convertido:
            return -1
        elif num1_convertido > num2_convertido:
            return 1
        else:
            return 0
    
    @staticmethod
    def fraccion_a_decimal(numerador: int, denominador: int, precision: int = 10) -> str:
        """Convierte una fracción a su representación decimal"""
        if denominador == 0:
            raise ValueError("El denominador no puede ser cero")
        
        resultado = numerador / denominador
        return f"{resultado:.{precision}f}".rstrip('0').rstrip('.')
    
    @staticmethod
    def decimal_a_fraccion(decimal: float, precision: int = 1000000) -> Tuple[int, int]:
        """Convierte un decimal a fracción usando el algoritmo de fracciones continuas"""
        frac = Fraction(decimal).limit_denominator(precision)
        return frac.numerator, frac.denominator

class Potenciacion:
    """Clase para manejar operaciones de potenciación y radicación"""
    
    @staticmethod
    def potencia(base: float, exponente: int) -> float:
        """Calcula la potencia de un número"""
        return base ** exponente
    
    @staticmethod
    def potencia_modular(base: int, exponente: int, modulo: int) -> int:
        """Calcula (base^exponente) mod modulo de forma eficiente"""
        if modulo == 1:
            return 0
        
        resultado = 1
        base = base % modulo
        
        while exponente > 0:
            if exponente % 2 == 1:
                resultado = (resultado * base) % modulo
            exponente = exponente >> 1
            base = (base * base) % modulo
        
        return resultado
    
    @staticmethod
    def raiz_cuadrada(n: float) -> float:
        """Calcula la raíz cuadrada de un número"""
        if n < 0:
            raise ValueError("No se puede calcular la raíz cuadrada de un número negativo")
        return math.sqrt(n)
    
    @staticmethod
    def raiz_n(numero: float, indice: int) -> float:
        """Calcula la raíz n-ésima de un número"""
        if indice == 0:
            raise ValueError("El índice de la raíz no puede ser cero")
        if numero < 0 and indice % 2 == 0:
            raise ValueError("No se puede calcular raíz par de número negativo")
        
        if numero < 0:
            return -(abs(numero) ** (1/indice))
        return numero ** (1/indice)
    
    @staticmethod
    def es_cuadrado_perfecto(n: int) -> bool:
        """Verifica si un número es un cuadrado perfecto"""
        if n < 0:
            return False
        
        raiz = int(math.sqrt(n))
        return raiz * raiz == n
    
    @staticmethod
    def es_cubo_perfecto(n: int) -> bool:
        """Verifica si un número es un cubo perfecto"""
        if n < 0:
            raiz_cubica = -round(abs(n) ** (1/3))
        else:
            raiz_cubica = round(n ** (1/3))
        
        return raiz_cubica ** 3 == n
    
    @staticmethod
    def simplificar_radical(radicando: int, indice: int = 2) -> Tuple[int, int]:
        """Simplifica un radical extrayendo factores perfectos"""
        if radicando < 0 and indice % 2 == 0:
            raise ValueError("No se puede simplificar raíz par de número negativo")
        
        factor_extraido = 1
        radicando_simplificado = abs(radicando)
        
        # Encontrar factores que se pueden extraer
        factores = AritmeticaBasica.factores_primos(radicando_simplificado)
        contador_factores = {}
        
        for factor in factores:
            contador_factores[factor] = contador_factores.get(factor, 0) + 1
        
        for factor, cantidad in contador_factores.items():
            extraibles = cantidad // indice
            factor_extraido *= factor ** extraibles
            radicando_simplificado //= factor ** (extraibles * indice)
        
        if radicando < 0:
            factor_extraido *= -1
        
        return factor_extraido, radicando_simplificado
    
    @staticmethod
    def leyes_exponentes() -> Dict[str, str]:
        """Devuelve las leyes de los exponentes"""
        return {
            'producto_misma_base': 'a^m × a^n = a^(m+n)',
            'cociente_misma_base': 'a^m ÷ a^n = a^(m-n)',
            'potencia_de_potencia': '(a^m)^n = a^(m×n)',
            'potencia_de_producto': '(a×b)^n = a^n × b^n',
            'potencia_de_cociente': '(a÷b)^n = a^n ÷ b^n',
            'exponente_cero': 'a^0 = 1 (a ≠ 0)',
            'exponente_negativo': 'a^(-n) = 1/a^n',
            'raiz_como_exponente': '∜a = a^(1/n)'
        }

# Funciones de utilidad para la interfaz web
def generar_ejercicio_conjuntos() -> Dict[str, Any]:
    """Genera un ejercicio aleatorio sobre conjuntos numéricos"""
    tipos = ['operaciones_basicas', 'clasificacion', 'propiedades']
    tipo = random.choice(tipos)
    
    if tipo == 'operaciones_basicas':
        operacion = random.choice(['suma', 'resta', 'multiplicacion', 'division'])
        
        if operacion == 'suma':
            a, b = random.randint(1, 100), random.randint(1, 100)
            return {
                'pregunta': f'¿Cuál es el resultado de {a} + {b}?',
                'respuesta': a + b,
                'explicacion': f'{a} + {b} = {a + b}. Aplicamos la propiedad conmutativa de la suma.',
                'tipo': 'suma'
            }
        elif operacion == 'resta':
            a, b = random.randint(50, 100), random.randint(1, 49)
            return {
                'pregunta': f'¿Cuál es el resultado de {a} - {b}?',
                'respuesta': a - b,
                'explicacion': f'{a} - {b} = {a - b}. Resta en los números enteros.',
                'tipo': 'resta'
            }
        elif operacion == 'multiplicacion':
            a, b = random.randint(2, 12), random.randint(2, 12)
            return {
                'pregunta': f'¿Cuál es el resultado de {a} × {b}?',
                'respuesta': a * b,
                'explicacion': f'{a} × {b} = {a * b}. Aplicamos la propiedad conmutativa del producto.',
                'tipo': 'multiplicacion'
            }
        else:  # division
            b = random.randint(2, 12)
            a = b * random.randint(2, 12)
            return {
                'pregunta': f'¿Cuál es el resultado de {a} ÷ {b}?',
                'respuesta': a // b,
                'explicacion': f'{a} ÷ {b} = {a // b}. División exacta en los números enteros.',
                'tipo': 'division'
            }
    
    elif tipo == 'clasificacion':
        numero = random.choice([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17, 25, 28])
        clasificacion = ConjuntosNumericos.clasificar_numero(numero)
        
        if clasificacion['primo']:
            return {
                'pregunta': f'¿A qué conjuntos numéricos pertenece el número {numero}? ¿Es primo?',
                'respuesta': f'Natural, Entero, Racional, Real, Primo',
                'explicacion': f'{numero} es un número primo, por lo tanto pertenece a N, Z, Q, R.',
                'tipo': 'clasificacion'
            }
        else:
            return {
                'pregunta': f'¿El número {numero} es par o impar?',
                'respuesta': 'par' if clasificacion['par'] else 'impar',
                'explicacion': f'{numero} es {"par" if clasificacion["par"] else "impar"} porque {"es" if clasificacion["par"] else "no es"} divisible por 2.',
                'tipo': 'paridad'
            }

def generar_ejercicio_primos() -> Dict[str, Any]:
    """Genera un ejercicio aleatorio sobre números primos"""
    tipos = ['identificar_primo', 'mcd', 'mcm', 'factorizacion', 'divisores']
    tipo = random.choice(tipos)
    
    if tipo == 'identificar_primo':
        numero = random.choice([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 4, 6, 8, 9, 10, 12, 15, 16, 18, 20, 21, 25, 27])
        es_primo = AritmeticaBasica.es_primo(numero)
        return {
            'pregunta': f'¿Es {numero} un número primo? (Responde 1 para sí, 0 para no)',
            'respuesta': 1 if es_primo else 0,
            'explicacion': f'{numero} {"es" if es_primo else "no es"} primo. ' + 
                          (f'Solo es divisible por 1 y {numero}.' if es_primo else 
                           f'Tiene divisores: {AritmeticaBasica.divisores(numero)}'),
            'tipo': 'primo'
        }
    
    elif tipo == 'mcd':
        a, b = random.randint(12, 48), random.randint(12, 48)
        mcd = AritmeticaBasica.mcd(a, b)
        return {
            'pregunta': f'¿Cuál es el MCD de {a} y {b}?',
            'respuesta': mcd,
            'explicacion': f'MCD({a}, {b}) = {mcd}. Usando el algoritmo de Euclides.',
            'tipo': 'mcd'
        }
    
    elif tipo == 'mcm':
        a, b = random.randint(4, 12), random.randint(4, 12)
        mcm = AritmeticaBasica.mcm(a, b)
        return {
            'pregunta': f'¿Cuál es el MCM de {a} y {b}?',
            'respuesta': mcm,
            'explicacion': f'MCM({a}, {b}) = {mcm}. MCM = (a × b) ÷ MCD(a, b)',
            'tipo': 'mcm'
        }
    
    elif tipo == 'factorizacion':
        numero = random.choice([12, 18, 24, 30, 36, 42, 48, 54, 60, 72])
        factores = AritmeticaBasica.factores_primos(numero)
        factorizacion = AritmeticaBasica.factorizacion_completa(numero)
        
        return {
            'pregunta': f'¿Cuántos factores primos distintos tiene {numero}?',
            'respuesta': len(factorizacion),
            'explicacion': f'Los factores primos de {numero} son: {list(factorizacion.keys())}. Factorización: {factorizacion}',
            'tipo': 'factorizacion'
        }
    
    else:  # divisores
        numero = random.choice([12, 16, 18, 20, 24, 28, 30])
        divisores = AritmeticaBasica.divisores(numero)
        return {
            'pregunta': f'¿Cuántos divisores tiene {numero}?',
            'respuesta': len(divisores),
            'explicacion': f'Los divisores de {numero} son: {divisores}',
            'tipo': 'divisores'
        }

def generar_ejercicio_fraccionarios() -> Dict[str, Any]:
    """Genera un ejercicio aleatorio sobre fracciones"""
    tipos = ['operaciones', 'simplificacion', 'comparacion', 'conversion']
    tipo = random.choice(tipos)
    
    if tipo == 'operaciones':
        operacion = random.choice(['suma', 'resta', 'multiplicacion', 'division'])
        
        # Generar fracciones simples
        n1, d1 = random.randint(1, 10), random.randint(2, 10)
        n2, d2 = random.randint(1, 10), random.randint(2, 10)
        
        if operacion == 'suma':
            num_res, den_res = Fraccionarios.sumar_fracciones(n1, d1, n2, d2)
            return {
                'pregunta': f'Calcula: {n1}/{d1} + {n2}/{d2} (responde como fracción: numerador/denominador)',
                'respuesta': f'{num_res}/{den_res}',
                'explicacion': f'{n1}/{d1} + {n2}/{d2} = {num_res}/{den_res}. Denominador común: {AritmeticaBasica.mcm(d1, d2)}',
                'tipo': 'suma_fracciones'
            }
        
        elif operacion == 'multiplicacion':
            num_res, den_res = Fraccionarios.multiplicar_fracciones(n1, d1, n2, d2)
            return {
                'pregunta': f'Calcula: {n1}/{d1} × {n2}/{d2} (responde como fracción: numerador/denominador)',
                'respuesta': f'{num_res}/{den_res}',
                'explicacion': f'{n1}/{d1} × {n2}/{d2} = ({n1}×{n2})/({d1}×{d2}) = {num_res}/{den_res}',
                'tipo': 'multiplicacion_fracciones'
            }
    
    elif tipo == 'simplificacion':
        # Generar fracción que se pueda simplificar
        factor = random.randint(2, 6)
        n_simple = random.randint(1, 8)
        d_simple = random.randint(2, 8)
        
        numerador = n_simple * factor
        denominador = d_simple * factor
        
        num_simp, den_simp = Fraccionarios.simplificar_fraccion(numerador, denominador)
        
        return {
            'pregunta': f'Simplifica la fracción {numerador}/{denominador} (responde como fracción: numerador/denominador)',
            'respuesta': f'{num_simp}/{den_simp}',
            'explicacion': f'{numerador}/{denominador} = {num_simp}/{den_simp}. MCD({numerador}, {denominador}) = {AritmeticaBasica.mcd(numerador, denominador)}',
            'tipo': 'simplificacion'
        }
    
    else:  # conversion
        numerador = random.randint(1, 9)
        denominador = random.choice([2, 4, 5, 8, 10, 20, 25])
        decimal = Fraccionarios.fraccion_a_decimal(numerador, denominador, 3)
        
        return {
            'pregunta': f'Convierte {numerador}/{denominador} a decimal',
            'respuesta': float(decimal),
            'explicacion': f'{numerador}/{denominador} = {decimal}',
            'tipo': 'conversion'
        }

def generar_ejercicio_potenciacion() -> Dict[str, Any]:
    """Genera un ejercicio aleatorio sobre potenciación y radicación"""
    tipos = ['potencias', 'raices', 'simplificacion_radicales', 'leyes_exponentes']
    tipo = random.choice(tipos)
    
    if tipo == 'potencias':
        base = random.randint(2, 10)
        exponente = random.randint(2, 5)
        resultado = Potenciacion.potencia(base, exponente)
        
        return {
            'pregunta': f'Calcula: {base}^{exponente}',
            'respuesta': int(resultado),
            'explicacion': f'{base}^{exponente} = {int(resultado)}',
            'tipo': 'potencia'
        }
    
    elif tipo == 'raices':
        # Usar cuadrados perfectos
        cuadrados = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225]
        numero = random.choice(cuadrados)
        raiz = int(Potenciacion.raiz_cuadrada(numero))
        
        return {
            'pregunta': f'Calcula: √{numero}',
            'respuesta': raiz,
            'explicacion': f'√{numero} = {raiz} porque {raiz}² = {numero}',
            'tipo': 'raiz_cuadrada'
        }
    
    elif tipo == 'simplificacion_radicales':
        # Números que se pueden simplificar
        numeros = [8, 12, 18, 20, 24, 27, 32, 45, 48, 50, 72, 75, 98]
        numero = random.choice(numeros)
        factor_ext, rad_simp = Potenciacion.simplificar_radical(numero)
        
        if factor_ext == 1:
            return {
                'pregunta': f'Simplifica: √{numero}',
                'respuesta': f'√{numero}',
                'explicacion': f'√{numero} ya está en su forma más simple',
                'tipo': 'radical_simple'
            }
        else:
            return {
                'pregunta': f'Simplifica: √{numero} (responde como: coeficiente√radicando)',
                'respuesta': f'{factor_ext}√{rad_simp}' if rad_simp != 1 else str(factor_ext),
                'explicacion': f'√{numero} = {factor_ext}√{rad_simp}' if rad_simp != 1 else f'√{numero} = {factor_ext}',
                'tipo': 'simplificacion_radical'
            }
    
    else:  # leyes_exponentes
        base = random.randint(2, 5)
        exp1 = random.randint(2, 4)
        exp2 = random.randint(2, 4)
        
        return {
            'pregunta': f'Aplica las leyes de exponentes: {base}^{exp1} × {base}^{exp2}',
            'respuesta': f'{base}^{exp1 + exp2}',
            'explicacion': f'{base}^{exp1} × {base}^{exp2} = {base}^({exp1}+{exp2}) = {base}^{exp1 + exp2}',
            'tipo': 'leyes_exponentes'
        }

# Funciones de testing y validación
def test_modulo_aritmetica():
    """Función para probar las funcionalidades del módulo"""
    print("=== Test del Módulo de Aritmética ===")
    
    # Test números primos
    print(f"¿Es 17 primo? {AritmeticaBasica.es_primo(17)}")
    print(f"Primos hasta 30: {AritmeticaBasica.generar_primos(30)}")
    
    # Test MCD y MCM
    print(f"MCD(48, 18) = {AritmeticaBasica.mcd(48, 18)}")
    print(f"MCM(12, 8) = {AritmeticaBasica.mcm(12, 8)}")
    
    # Test fracciones
    print(f"3/4 + 1/6 = {Fraccionarios.sumar_fracciones(3, 4, 1, 6)}")
    print(f"Simplificar 12/18 = {Fraccionarios.simplificar_fraccion(12, 18)}")
    
    # Test potencias
    print(f"2^5 = {Potenciacion.potencia(2, 5)}")
    print(f"√144 = {Potenciacion.raiz_cuadrada(144)}")
    print(f"Simplificar √72 = {Potenciacion.simplificar_radical(72)}")
    
    print("=== Fin del Test ===")

if __name__ == "__main__":
    test_modulo_aritmetica()
