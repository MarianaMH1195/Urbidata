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
import config

# Fragmento 2: El listado de archivos

def process_files():
    """
    Lee todos los archivos .csv.gz de la carpeta raw, los filtra y guarda un único archivo consolidado 
    en processed.

    Es una forma elegante de decir: "Mira en la carpeta raw, coge todos los nombres de archivo, pero SOLO 
    si terminan en .csv.gz".
    """
    archivos = sorted([f for f in os.listdir(config.RAW_DIR) if f.endswith(".csv.gz")])
    
    if not archivos:
        print(  f"No se encontraron archivos para procesar en {config.RAW_DIR}")
        return

    total_archivos = len(archivos)
    print(f"Iniciando limpieza de {total_archivos} archivos...")
    
    lista_final = []

    for idx, nombre_archivo in enumerate(archivos, 1):
        ruta_completa = os.path.join(config.RAW_DIR, nombre_archivo)
        print(f"\n[{idx}/{total_archivos}] Procesando: {nombre_archivo}...")

        chunks = pd.read_csv(
            ruta_completa, 
            sep="|",
            compression="gzip", 
            chunksize=config.CHUNK_SIZE,
            dtype=str
        )

        for i, chunk in enumerate(chunks):
            # Identificar columnas
            col_origen = [c for c in chunk.columns if 'origen' in c.lower()][0]
            col_destino = [c for c in chunk.columns if 'destino' in c.lower()][0]

            # Filtrar por provincia
            mask = (
                chunk[col_origen].str[:2].isin(config.PROVINCIAS_IDS) | 
                chunk[col_destino].str[:2].isin(config.PROVINCIAS_IDS)
            )
            
            filtrado = chunk[mask].copy()

            if not filtrado.empty:
                # Procesamiento de fechas y tipo de día (Crítico para el Dashboard)
                if 'fecha' in filtrado.columns:
                    filtrado['fecha_dt'] = pd.to_datetime(filtrado['fecha'], format='%Y%m%d', errors='coerce')
                    filtrado['tipo_dia'] = filtrado['fecha_dt'].dt.dayofweek.apply(
                        lambda x: 'laborable' if x < 5 else 'festivo'
                    )
                
                filtrado['viajes'] = pd.to_numeric(filtrado['viajes'], errors='coerce')
                lista_final.append(filtrado)
            
            # Monitor de progreso más frecuente
            if i % 5 == 0 and i > 0:
                print(f"   -> {i * config.CHUNK_SIZE} filas analizadas en este archivo...")

    if lista_final:
        print("\nConcatenando y guardando resultados...")
        df_final = pd.concat(lista_final, ignore_index=True)
        
        ruta_csv = config.PROCESSED_DIR / "datos_limpios_provincias.csv"
        df_final.to_csv(ruta_csv, index=False)
        
        ruta_parquet = ruta_csv.with_suffix(".parquet")
        df_final.to_parquet(ruta_parquet, index=False)
        
        print("\n✅ ¡PROCESO COMPLETADO!")
        print(f" Filas finales: {len(df_final)}")
        print(f" Archivos guardados en: {config.PROCESSED_DIR}")
    else:
        print(" No se encontraron datos que coincidan con las provincias seleccionadas.")

if __name__ == "__main__":
    process_files()
