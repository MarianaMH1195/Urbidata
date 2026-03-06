"""
Urbidata - Módulo de Limpieza (Cleaning)
Este es el 'embudo' del proyecto. 
Lee archivos gigantes por trozos (chunks), filtra por provincias 
y guarda el resultado limpio y manejable.
"""

import pandas as pd
import os
from config import RAW_DIR, PROCESSED_DIR, PROVINCIAS_IDS, CHUNK_SIZE

def process_files():
    """
    Lee todos los archivos .csv.gz de la carpeta raw, 
    los filtra y guarda un único archivo consolidado en processed.
    """
    archivos = [f for f in os.listdir(RAW_DIR) if f.endswith(".csv.gz")]
    
    if not archivos:
        print(f"❌ No se encontraron archivos para procesar en {RAW_DIR}")
        return

    print(f"🧹 Iniciando limpieza de {len(archivos)} archivos...")
    
    lista_final = []

    for nombre_archivo in sorted(archivos):
        ruta_completa = os.path.join(RAW_DIR, nombre_archivo)
        print(f"📖 Procesando: {nombre_archivo} (usando chunks de {CHUNK_SIZE} filas)")

        # Leemos el archivo por trozos para no colapsar la memoria RAM
        chunks = pd.read_csv(
            ruta_completa, 
            sep="|",             # El MITMA usa '|' como separador
            compression="gzip", 
            chunksize=CHUNK_SIZE,
            dtype=str            # Leemos todo como texto inicialmente por seguridad
        )

        for i, chunk in enumerate(chunks):
            # 1. Identificar columnas (pueden variar según la versión del MITMA)
            # Buscamos columnas que contengan 'origen' y 'destino'
            col_origen = [c for c in chunk.columns if 'origen' in c.lower()][0]
            col_destino = [c for c in chunk.columns if 'destino' in c.lower()][0]

            # 2. Filtrar por provincia
            # Los dos primeros dígitos del código de municipio indican la provincia
            mask = (
                chunk[col_origen].str[:2].isin(PROVINCIAS_IDS) |
                chunk[col_destino].str[:2].isin(PROVINCIAS_IDS)
            )
            
            filtrado = chunk[mask].copy()

            if not filtrado.empty:
                # 3. Limpieza básica
                # Convertir viajes a número
                filtrado['viajes'] = pd.to_numeric(filtrado['viajes'], errors='coerce')
                lista_final.append(filtrado)
            
            if i % 10 == 0 and i > 0:
                print(f"   ... procesados {i * CHUNK_SIZE} filas del archivo actual")

    if lista_final:
        # Unimos todos los trozos filtrados
        df_final = pd.concat(lista_final, ignore_index=True)
        
        # Guardamos el resultado
        ruta_salida = PROCESSED_DIR / "datos_limpios_provincias.csv"
        df_final.to_csv(ruta_salida, index=False)
        
        print(f"\n✅ ¡Limpieza completada!")
        print(f"📊 Filas finales: {len(df_final)}")
        print(f"💾 Guardado en: {ruta_salida}")
    else:
        print("⚠️ No se encontraron datos que coincidan con las provincias seleccionadas.")

if __name__ == "__main__":
    process_files()
