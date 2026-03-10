"""
Urbidata - Módulo de Descarga (Download)
Encargado de descargar los datos de movilidad del MITMA.
Usa la librería pySpainMobility para automatizar el proceso.

Este archivo es el "extractor" del pipeline. Si config.py era el cerebro, este es el "brazo robótico" que 
sale a Internet, va al servidor del MITMA y se trae los archivos pesados a tu ordenador.
"""

import os
import sys
import config

# Intentar importar pySpainMobility
# este try-except es una red de seguridad. Si la librería pySpainMobility no estuviera instalada, 
# el programa no "rompería" con un error feo, sino que te daría un mensaje amigable y se cerraría 
# ordenadamente con sys.exit(1).
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
    print(f"\n Iniciando descarga de datos MITMA...")
    print(f" Rango: {config.DATE_START} hasta {config.DATE_END}")
    print(f" Destino: {config.RAW_DIR}")

    try:
        # Configuramos el objeto de movilidad
        # La versión actual del MITMA (2022-actualidad) es la versión 2.
        # Las subzonas ahora se llaman "municipalities" (municipios en la API nueva)
        mob = Mobility(
            version=config.VERSIONS,
            zones="municipalities",
            start_date=config.DATE_START,
            end_date=config.DATE_END,
            output_directory=str(config.RAW_DIR)
        )

        # Ejecutamos la descarga (método actualizado para datos de origen-destino)
        mob.get_od_data(return_df=False)
        
        print("\n✅ Descarga completada con éxito.")
        print(f"Verifica los archivos en: {config.RAW_DIR}")

    except Exception as e:
        print(f"\nError durante la descarga: {e}")
        print("Sugerencia: Revisa tu conexión a internet o si el servidor del MITMA está caído.")

if __name__ == "__main__":
    run_download()

#¿Cómo actúa este archivo en el flujo general?
''' 
Imagina que es el lunes por la mañana y el MITMA publica nuevos datos:

Tú (o un proceso automático) ejecutas el pipeline.
download.py se despierta.
Mira en config.py qué fechas le faltan.
Descarga los Gigabytes de datos nuevos y los deja "sucios" en la carpeta raw.

'''