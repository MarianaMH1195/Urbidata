"""
Urbidata - Módulo de Limpieza (Cleaning)
Este es el 'embudo' del proyecto; el filtro inteligente que decide qué datos merecen pasar a la base de datos.
Lee archivos gigantes por trozos (chunks), filtra por provincias 
y guarda el resultado limpio y manejable.

Si download.py traía las "cajas cerradas", cleaning.py las abre, tira lo que no sirve (el 95% de los datos 
de España) y se queda solo con lo que nos interesa (Sevilla y Málaga).
"""
#Fragmento 1: Los preparativos (Importaciones)
#importamos las librerias necesarias, pandas, la libreria reina para manejar los datos, 
#os, el modulo de python para interactuar con windows. Lo usaremos para listar archivos y crear rutas. 
# from config import... es lo más importante; Aqui importamos las variables que definimos en config.py
# y que usaremos para filtrar los datos.

import pandas as pd
import os
from config import RAW_DIR, PROCESSED_DIR, PROVINCIAS_IDS, CHUNK_SIZE

# Fragmento 2: El listado de archivos

def process_files():
    """
    Lee todos los archivos .csv.gz de la carpeta raw, los filtra y guarda un único archivo consolidado 
    en processed.

    Es una forma elegante de decir: "Mira en la carpeta raw, coge todos los nombres de archivo, pero SOLO 
    si terminan en .csv.gz".
    """
    archivos = [f for f in os.listdir(RAW_DIR) if f.endswith(".csv.gz")]
    
# Esta es la Red de Seguridad: Si la lista está vacía (if not archivos), el programa se detiene con 
# un mensaje de error en lugar de fallar silenciosamente.

    if not archivos:
        print(f"❌ No se encontraron archivos para procesar en {RAW_DIR}")
        return

    print(f"Iniciando limpieza de {len(archivos)} archivos...")
    
#Fragmento 3: El procesado por trozos (Chunking), este es el Bucle de los Archivos

    lista_final = [] # creamos una "bandeja" vacía donde iremos dejando los datos limpios que saquemos 
    #de cada archivo.

    for nombre_archivo in sorted(archivos): # ordenamos los archivos (normalmente por fecha en el nombre) para procesarlos en orden.
        ruta_completa = os.path.join(RAW_DIR, nombre_archivo) # path es la forma segura de unir la carpeta con el nombre del archivo. el os.path.join es un "traductor inteligente" que mira el ordenador (Windows o Mac/Linux) y pone la barra correcta automaticamente, es decir, si es un Windows, pone la barra \, y si es un Mac o Linux, la barra /. Esto hace que el código sea universal.
        print(f"Procesando: {nombre_archivo} (usando chunks de {CHUNK_SIZE} filas)")

        # fragmento 4: Leemos el archivo por trozos para no colapsar la memoria RAM
        chunks = pd.read_csv(
            ruta_completa, 
            sep="|",             # El MITMA usa '|' como separador
            compression="gzip", 
            chunksize=CHUNK_SIZE,
            dtype=str            # Leemos todo como texto inicialmente por seguridad
        )
#Fragmento 5: Detectamos las etiquetas (Identify Columns)
        for i, chunk in enumerate(chunks):
            # Identificar columnas (pueden variar según la versión del MITMA)
            # Buscamos columnas que contengan 'origen' y 'destino'
            col_origen = [c for c in chunk.columns if 'origen' in c.lower()][0] #"comprensión de lista". Busca en todos los nombres de columna y, si encuentra la palabra "origen", la mete en la lista. El [0] final coge el primer resultado.
            col_destino = [c for c in chunk.columns if 'destino' in c.lower()][0] #resultado final: Aseguramos que col_origen siempre tenga el nombre exacto que el MITMA haya decidido usar ese día.

            # Fragmento 6: Filtrar por provincia (Masking)
            # Los dos primeros dígitos del código de municipio indican la provincia
            mask = (
                chunk[col_origen].str[:2].isin(PROVINCIAS_IDS) | #.str[:2] es "Slicing". Cortamos los dos primeros dígitos del ID. El símbolo | es el operador "OR".
                chunk[col_destino].str[:2].isin(PROVINCIAS_IDS)
            )
            
            filtrado = chunk[mask].copy() #el "copy()" Crea un nuevo espacio en memoria para filtrado. Si no lo pones, Pandas te daría una advertencia de "SettingWithCopyWarning" más adelante.

#Fragmento 7: Limpieza de tipos (Numeric Conversion)
            if not filtrado.empty:
                # Limpieza básica
                # Convertimos la columna viajes a número
                filtrado['viajes'] = pd.to_numeric(filtrado['viajes'], errors='coerce')  #"errors='coerce'" es vital. Si por algún error del MITMA viene un texto tipo "N/A" en los viajes, lo convierte en NaN (nulo) en lugar de dar error.
                lista_final.append(filtrado) #accion: Solo si el trozo tiene datos (if not filtrado.empty), lo guardamos en nuestra "bandeja" lista_final.
            
            # Fragmento 8: El monitor de Progreso
            if i % 10 == 0 and i > 0:
                print(f"   ... procesados {i * CHUNK_SIZE} filas del archivo actual")

    if lista_final:
        # Unimos todos los trozos filtrados
        #Fragmento 9: La Unión y el Guardado Final
        df_final = pd.concat(lista_final, ignore_index=True) #pd.contact() pega todos los trozos filtrados uno debajo de otro. "ignore_index=True." Resetea los números de fila para que vayan de 0 hasta el final, sin saltos.
        
        # Guardamos el resultado
        ruta_salida = PROCESSED_DIR / "datos_limpios_provincias.csv"
        df_final.to_csv(ruta_salida, index=False) # Acción: to_csv con index=False. Guarda el archivo pero SIN la columna de números de fila (que suele estorbar en el dashboard).
        
        print(f"\n✅ ¡Limpieza completada!")
        print(f" Filas finales: {len(df_final)}")
        print(f" Guardado en: {ruta_salida}")
    else:
        print(" No se encontraron datos que coincidan con las provincias seleccionadas.")

if __name__ == "__main__":
    process_files()
