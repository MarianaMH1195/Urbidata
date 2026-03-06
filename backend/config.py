"""
Urbidata - Configuración Centralizada
Este archivo contiene todos los parámetros, rutas y constantes del proyecto.
Facilita el mantenimiento y evita errores de escritura en el código.
"""

import os
from pathlib import Path

# =================================================================
# 📂 RUTAS DE CARPETAS (PATHS)
# =================================================================

# Ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent

# Carpetas de datos
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"           # Datos recién descargados (sucios/masivos)
PROCESSED_DIR = DATA_DIR / "processed" # Datos filtrados y limpios
OUTPUT_DIR = DATA_DIR / "output"     # Resultados finales para el Dashboard

# Asegurar que las carpetas existan
for folder in [RAW_DIR, PROCESSED_DIR, OUTPUT_DIR]:
    os.makedirs(folder, exist_ok=True)


# =================================================================
# 🛰️ PARÁMETROS MITMA (Movilidad)
# =================================================================

# Versiones de datos MITMA
# v1: 2020-2021 | v2: 2022-actualidad
VERSIONS = [1, 2]

# Rango de fechas para el análisis (Ejemplo: Una semana de enero 2024)
DATE_START = "2024-01-08"
DATE_END = "2024-01-14"


# =================================================================
# 📍 GEOGRAFÍA Y FILTROS
# =================================================================

# Provincias a analizar (Códigos INE de 2 dígitos)
# 41: Sevilla | 29: Málaga
PROVINCIAS_IDS = ['41', '29']

# Capitales de provincia (IDs completos de municipio)
# 41091: Sevilla capital | 29067: Málaga capital
CAPITALES_IDS = ['41091', '29067']


# =================================================================
# ⚙️ PARÁMETROS TÉCNICOS
# =================================================================

# Tamaño de bloque para lectura de archivos masivos (Filas)
CHUNK_SIZE = 100_000

# Umbral para clasificar pueblos dormitorio (% de viajes a capital)
DORMITORIO_THRESHOLD = 15.0

print(f"✅ Configuración cargada correctamente.")
print(f"📍 Analizando provincias: {PROVINCIAS_IDS}")
