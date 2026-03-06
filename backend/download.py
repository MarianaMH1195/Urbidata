"""
Urbidata - Módulo de Descarga (Download)
Encargado de descargar los datos de movilidad del MITMA.
Usa la librería pySpainMobility para automatizar el proceso.
"""

import os
import sys
from config import RAW_DIR, DATE_START, DATE_END, VERSIONS,

# Intentar importar pySpainMobility
try:
    from pyspainmobility.mobility.mobility import Mobility
    print("✅ pySpainMobility detectado.")
except ImportError:
    print("❌ Error: pySpainMobility no está instalado.")
    print("Prueba ejecutando: pip install pySpainMobility")
    sys.exit(1)

def run_download():
    """
    Función principal para descargar los datos.
    Descarga archivos comprimidos (.csv.gz) en la carpeta raw.
    """
    print(f"\n🚀 Iniciando descarga de datos MITMA...")
    print(f"📅 Rango: {DATE_START} hasta {DATE_END}")
    print(f"📂 Destino: {RAW_DIR}")

    try:
        # Configuramos el objeto de movilidad
        # Usamos version 1 y 2 (configurada en config.py)
        mob = Mobility(
            version=VERSIONS,
            zones="municipios",
            start_date=DATE_START,
            end_date=DATE_END,
            output_directory=str(RAW_DIR)
        )

        # Ejecutamos la descarga
        # Nota: Esto solo descarga los archivos, no los lee aún.
        mob.download_data()
        
        print("\n✅ Descarga completada con éxito.")
        print(f"Verifica los archivos en: {RAW_DIR}")

    except Exception as e:
        print(f"\n⚠️ Error durante la descarga: {e}")
        print("Sugerencia: Revisa tu conexión a internet o si el servidor del MITMA está caído.")

if __name__ == "__main__":
    run_download()
