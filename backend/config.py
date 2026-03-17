"""
Urbidata - Configuración Centralizada
Este archivo contiene todos los parámetros, rutas y constantes del proyecto.
Facilita el mantenimiento y evita errores de escritura en el código.

Digamos que este es el primer archivo que "activa" el pipeline. No hace cálculos pesados, 
pero sin él, el resto del equipo no sabría dónde guardar los archivos ni qué provincias buscar.
"""

# Importamos las librerias os y pathlib para manejar rutas de carpetas.
import os
from pathlib import Path  #usamos path porque es detecta si estamos usando Windows o Linux y ajusta las barras \ o la / automaticamente.

# =================================================================
# DEFINIMOS LAS RUTAS DE CARPETAS (PATHS)
# =================================================================

# Ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent

# Carpetas de datos
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"           # Datos recién descargados (sucios/masivos)
PROCESSED_DIR = DATA_DIR / "processed" # Datos filtrados y limpios
OUTPUT_DIR = DATA_DIR / "output"     # Resultados finales para el Dashboard

# Aqui usamos pathlib.Path en lugar de strings simples. porque al usar path, el código funciona igual 
# en Windows (tu PC) que en Linux (dentro de un contenedor Docker). No tenemos que preocuparnos de si 
# las barras son / o \.

#Flujo: Define la estructura de carpetas raw (sucio), processed (limpio) y output (resultados). 
# Si cambiamos luego la BASE_DIR, todo el proyecto se mueve con él.

# Creamos las. Este bucle for se asegura de que si alguien descarga el proyecto de cero, las carpetas se creen solas.
for folder in [RAW_DIR, PROCESSED_DIR, OUTPUT_DIR]:
    os.makedirs(folder, exist_ok=True)


# =================================================================
# PARÁMETROS MITMA (Movilidad)
# =================================================================

# Versión de datos MITMA (v1: 2020-2021 | v2: 2022-actualidad)
VERSION = 2


# Rango de fechas para el análisis (Ejemplo: Una semana de enero 2024)
DATE_START = "2024-01-08"
DATE_END = "2024-01-14"

#El MITMA cambió el formato de sus archivos en 2022. Al tener VERSIONS = [1, 2], preparamos al sistema 
# para que sepa que existen dos "estilos" de datos.

# =================================================================
# GEOGRAFÍA Y FILTROS: Las variables de negocio
# =================================================================

# Guardamos los IDs de las provincias a analizar (Códigos INE de 2 dígitos)
# 41: Sevilla | 29: Málaga
PROVINCIAS_IDS = ['41', '29'] #es una lista de strings porque los códigos postales de IDs de municipios
#a veces empiezan por cero, y si fueran números, el 0 desaparecería.
#OBS: mañana si queremos añadir más provincias, solo hay que añadir el ID aquí, no en 10 sitios distintos. 

# Capitales de provincia (IDs completos de municipio)
# 41091: Sevilla capital | 29067: Málaga capital
CAPITALES_IDS = ['41091', '29067']

# Lista de municipios con coordenadas definidas en el Frontend (para asegurar visualización)
MUNICIPALES_DASHBOARD = [
    "41091", "41004", "41013", "41038", "41078", "41079", "41063", "41058", "41039",
    "41056", "41003", "41028", "41099", "41017", "41049",
    "29067", "29069", "29065", "29014", "29030", "29095", "29084", "29043", "29051",
    "29013", "29010", "29078", "29064", "29036", "29060"
]


# =================================================================
# PARÁMETROS TÉCNICOS
# =================================================================

#Definimos el CHUNK_SIZE para leer archivos masivos de MITMA
CHUNK_SIZE = 100_000  #Es el número de filas que leeremos de golpe. Lo ponemos aquí para que, si el 
# servidor Docker tiene poca memoria, solo tengamos que bajar este número a 50_000 en un solo sitio.

# Umbral para clasificar pueblos dormitorio (% de viajes a capital)
DORMITORIO_THRESHOLD = 15.0

print("[OK] Configuracion cargada correctamente.")
print(f"Analizando provincias: {PROVINCIAS_IDS}")


# Pongo aqui como actúa este archivo en el flujo general
#Cuando alguien entra en el Front-end y pulsa "Filtrar por Sevilla":
# 1. El servidor (en Docker) mira config.py.
# 2. Confirma que el ID 41 está permitido.
# 3. Utiliza las rutas definidas aquí para saber de qué carpeta 'processed' debe leer los datos.

#Siguiente archivo download.py, que es el "extractor" (el brazo) del pipeline.

WFS_URL   = "https://www.juntadeandalucia.es/institutodeestadisticaycartografia/geoserver-ieca/wfs"
WFS_LAYER = "v_municipios_and"