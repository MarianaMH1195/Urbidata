"""
Urbidata - Módulo de Descarga (Download)
Encargado de descargar los datos de movilidad del MITMA.
Usa la librería pySpainMobility para automatizar el proceso.

Este archivo es el "extractor" del pipeline. Si config.py era el cerebro, este es el "brazo robótico" que 
sale a Internet, va al servidor del MITMA y se trae los archivos pesados a tu ordenador.
"""

import os
import sys
from config import RAW_DIR, DATE_START, DATE_END, VERSIONS  #aqui le pedimos las variables que definimos 
#en config.py, el objeto path, los strings de fechas, y las listas de versiones.

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
    print(f" Rango: {DATE_START} hasta {DATE_END}")
    print(f" Destino: {RAW_DIR}")

    try:
        # Configuramos el objeto de movilidad (Le decimos que queremos datos por "municipios" y para las 
        # fechas que configuramos en el cerebro.)
        # Usamos version 1 y 2 (configurada en config.py)
        mob = Mobility(
            version=VERSIONS,
            zones="municipios",
            start_date=DATE_START,
            end_date=DATE_END,
            output_directory=str(RAW_DIR) #aunque RAW_DIR es un objeto Path (muy moderno), algunas librerías
            #antiguas prefieres los archivos como strings de toda la vida. Aqui lo convertimos a string para 
            #asegurar compatibilidad.
            #Nota: Esto solo descarga los archivos, no los lee aún.
        )

        # Ejecutamos la descarga, la acción real
        # Nota: Esto solo descarga los archivos. Se conecta al servidor, busca los archivos .csv.gz 
        # (comprimidos) y los descarga uno a uno en la carpeta backend/data/raw/

        #Aquí todavía no "vemos" los datos por dentro. Solo estamos moviendo cajas cerradas desde el 
        # almacén del gobierno a nuestro almacén local.
        mob.download_data()
        
        print("\n✅ Descarga completada con éxito.")
        print(f"Verifica los archivos en: {RAW_DIR}")

    except Exception as e:
        print(f"\n⚠️ Error durante la descarga: {e}")
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