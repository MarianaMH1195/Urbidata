"""
Urbidata - Módulo de Análisis (Analysis)
Este es el cerebro de la operación. Una vez que cleaning.py ha dejado los datos bonitos y ordenados,
analysis.py entra en acción para responder a las preguntas de Mariana.

Si download.py trajo las "cajas cerradas" y cleaning.py las vació y tiró la basura, analysis.py 
es el estadístico que se sienta con los datos limpios y nos dice:

"Oye, mira, la gente de Utrera viaja más a Sevilla que la de ningún otro sitio" (Ranking).
"Los martes hay mucho más tráfico que los domingos" (Comparativa).
"Este pueblo es un pueblo dormitorio" (Dependencia).

En resumen: Es el puente entre los datos crudos y las visualizaciones bonitas del Front-end.
"""

import pandas as pd
import os
import config

# Fragmento 1: CARGA HÍBRIDA DE DATOS (Parquet vs CSV)
# Buscamos en varias rutas por si el script se lanza desde carpetas distintas
# (resiliencia: si no está en la primera, busca en la segunda...)

# Usamos el formato .parquet porque es binario y mucho más rápido de leer que el CSV.
# Este sistema de "búsqueda resiliente" asegura que el código no rompa si falta un formato.

# Usamos el directorio procesado definido en config.py
BASE_PATH = config.PROCESSED_DIR
MASTER_FILE = "datos_limpios_provincias.csv"

# Caché global para evitar lecturas constantes de disco
_cached_df = None

def load_data(filename: str = None):
    """
    Carga datos de forma inteligente. Si no se especifica archivo, usa el maestro.
    Usa caché para mejorar el rendimiento de la API.
    """
    global _cached_df
    
    # Si pedimos el archivo maestro y ya lo tenemos en caché, lo devolvemos
    if not filename and _cached_df is not None:
        return _cached_df

    target = filename if filename else MASTER_FILE
    name_parquet = target.replace(".csv", ".parquet")
    name_csv = target if target.endswith(".csv") else f"{target}.csv"

    paths_to_try = [
        str(config.OUTPUT_DIR / name_parquet),
        str(config.OUTPUT_DIR / name_csv),
        os.path.join("data/output", name_parquet),
        os.path.join("data/output", name_csv),
        BASE_PATH / name_parquet,
        BASE_PATH / name_csv,
    ]

    for path in paths_to_try:
        if os.path.exists(path):
            if str(path).endswith(".parquet"):
                df = pd.read_parquet(path)
            else:
                df = pd.read_csv(path)
            
            # Guardamos en caché si es el archivo maestro
            if not filename:
                _cached_df = df
            return df
    
    return None

#Generación de outputs:
#Lee el parquet y genera CSV para frontend.
#Solo se ejecuta una vez.

def build_outputs():
    """
    Lee datos_limpios_provincias.parquet y genera los 4 CSVs de output:
    - ranking_municipios.csv
    - flujos_top.csv
    - pueblos_dormitorio.csv
    - comparativa_lab_fest.csv
    """
    print("\n Generando archivos de output...")
 
    # Cargamos el parquet limpio generado por cleaning.py
    ruta_parquet = config.PROCESSED_DIR / "datos_limpios_provincias.parquet"
    ruta_csv = config.PROCESSED_DIR / "datos_limpios_provincias.csv"
 
    df = None
    if os.path.exists(ruta_parquet):
        print(f"   Cargando desde Parquet: {ruta_parquet}")
        df = pd.read_parquet(ruta_parquet)
    elif os.path.exists(ruta_csv):
        print(f"   Cargando desde CSV: {ruta_csv}")
        df = pd.read_csv(ruta_csv)
    else:
        print("❌ No se encontraron datos limpios. Ejecuta cleaning.py primero.")
        return
 
    # Identificamos las columnas de origen y destino (son dinámicas según versión MITMA)
    col_origen = [c for c in df.columns if 'origen' in c.lower()][0]
    col_destino = [c for c in df.columns if 'destino' in c.lower()][0]
 
    # Nos aseguramos de que viajes es numérico
    df['viajes'] = pd.to_numeric(df['viajes'], errors='coerce')
 
    # Añadimos tipo_dia si no existe ya (laborable vs festivo)
    if 'tipo_dia' not in df.columns:
        df['fecha'] = pd.to_datetime(df['fecha'], format='%Y%m%d', errors='coerce')
        df['tipo_dia'] = df['fecha'].dt.dayofweek.apply(
            lambda x: 'laborable' if x < 5 else 'festivo'
        )
    # ── 1. Flujos top origen-destino ──────────────────────────
    flujos = (
        df.groupby([col_origen, col_destino, 'tipo_dia'])['viajes']
        .sum().reset_index()
        .rename(columns={col_origen: 'origen', col_destino: 'destino'})
        .sort_values('viajes', ascending=False)
    )
    flujos.to_csv(config.OUTPUT_DIR / "flujos_top.csv", index=False)
    print(f"   ✅ flujos_top.csv → {flujos.shape[0]} filas")
 
    # ── 2. Ranking municipios hacia la capital ─────────────────
    ranking = (
        df[df[col_destino].isin(config.CAPITALES_IDS)]
        .groupby([col_origen, col_destino, 'tipo_dia'])['viajes']
        .sum().reset_index()
        .rename(columns={col_origen: 'origen', col_destino: 'destino'})
        .sort_values('viajes', ascending=False)
    )
    ranking.to_csv(config.OUTPUT_DIR / "ranking_municipios.csv", index=False)
    print(f"   ✅ ranking_municipios.csv → {ranking.shape[0]} filas")
 
    # ── 3. Pueblos dormitorio ──────────────────────────────────
    total_por_municipio = df.groupby(col_origen)['viajes'].sum()
    viajes_a_capital = (
        df[df[col_destino].isin(config.CAPITALES_IDS)]
        .groupby(col_origen)['viajes'].sum()
    )
    dormitorio = (viajes_a_capital / total_por_municipio * 100).dropna().reset_index()
    dormitorio.columns = ['municipio', 'pct_dependencia']
    dormitorio = dormitorio.sort_values('pct_dependencia', ascending=False)
    dormitorio.to_csv(config.OUTPUT_DIR / "pueblos_dormitorio.csv", index=False)
    print(f"   ✅ pueblos_dormitorio.csv → {dormitorio.shape[0]} filas")
 
    # ── 4. Comparativa laborable vs festivo ───────────────────
    # Usamos pivot_table para crear columnas 'laborable' y 'festivo'
    comparativa = (
        df.groupby([col_origen, 'tipo_dia'])['viajes']
        .sum()
        .unstack('tipo_dia')
        .reset_index()
        .rename(columns={col_origen: 'origen'})
    )
    comparativa.columns.name = None
    # Nos aseguramos de que existen ambas columnas aunque no haya datos de un tipo
    for col in ['laborable', 'festivo']:
        if col not in comparativa.columns:
            comparativa[col] = 0
    comparativa.to_csv(config.OUTPUT_DIR / "comparativa_lab_fest.csv", index=False)
    print(f"   ✅ comparativa_lab_fest.csv → {comparativa.shape[0]} filas")
 
    print("\n✅ Todos los archivos de output generados correctamente.")


#Fragmento 2: El "Traductor de nombres". Permite que el usuario pida "Sevilla" y el código entienda que debe filtrar por el ID '41'.

def filter_by_provincia(df, col_name, provincia):
    if df is None or not provincia:
        return df
    
    MAPPING = {'sevilla': '41', 'málaga': '29', 'malaga': '29'}
    codigo = MAPPING.get(provincia.lower())
    
    if codigo:
        # Aseguramos que el código de origen/destino sea string para el filtro .str.startswith
        return df[df[col_name].astype(str).str.startswith(codigo)]
    return df

# Fragmento 3: El Ranking de viajes por municipio (Salidas)
def get_ranking(provincia: str = None, top_n: int = 8):
    df = load_data()
    if df is not None:
        df = filter_by_provincia(df, 'origen', provincia)
        # Agrupamos por origen y sumamos viajes totales
        ranking = df.groupby('origen')['viajes'].sum().reset_index()
        ranking = ranking.sort_values(by='viajes', ascending=False).head(top_n)
        return ranking.to_dict(orient='records')
    return []

# Fragmento 4: Localización de los Pueblos Dormitorio
def get_pueblos_dormitorio(provincia: str = None, umbral: float = config.DORMITORIO_THRESHOLD):
    df = load_data()
    if df is not None:
        # Calculamos totales por municipio
        salidas = df.groupby('origen')['viajes'].sum().rename('total_salidas')
        entradas = df.groupby('destino')['viajes'].sum().rename('total_entradas')
        
        # Unimos para calcular el ratio
        dorm = pd.concat([salidas, entradas], axis=1).fillna(0).reset_index().rename(columns={'index': 'municipio'})
        dorm = filter_by_provincia(dorm, 'municipio', provincia)
        
        # Filtramos capitales
        dorm = dorm[~dorm['municipio'].astype(str).isin(config.CAPITALES_IDS)]
        
        # Cálculo de porcentaje de dependencia (simplificado)
        dorm['pct_dependencia'] = (dorm['total_salidas'] / (dorm['total_salidas'] + dorm['total_entradas'] + 1) * 100).round(1)
        
        dormitorio = dorm[dorm['pct_dependencia'] > umbral].copy()

        def clasificar_nivel(pct):
            if pct > 40: return "Dependencia Muy Alta"
            if pct > 25: return "Dependencia Alta"
            return "Dependencia Moderada"

        dormitorio['nivel_descripcion'] = dormitorio['pct_dependencia'].apply(clasificar_nivel)
        return dormitorio.sort_values(by='pct_dependencia', ascending=False).to_dict(orient='records')
    return []


#Fragmento 5: Comparativa Laborables vs Festivos
def get_comparativa(provincia: str = None):
    df = load_data()
    if df is not None and 'tipo_dia' in df.columns:
        df = filter_by_provincia(df, 'origen', provincia)
         # Lógica de la compañera: Nos aseguramos de que las columnas existen antes de agrupar
        cols_disponibles = [c for c in ['laborable', 'festivo'] if c in df.columns]
        if cols_disponibles:
            # Si las columnas ya existen (e.g., porque se cargó un csv pre-procesado)
            comp = df.groupby('origen')[cols_disponibles].sum().reset_index()
        else:
            # Si no existen, es el archivo maestro y tenemos que pivotar 'tipo_dia'
            comp = df.groupby(['origen', 'tipo_dia'])['viajes'].sum().unstack('tipo_dia').fillna(0).reset_index()
        # Aseguramos que existan las columnas para que el frontend no rompa
        for col in ['laborable', 'festivo']:
            if col not in comp.columns: comp[col] = 0
        return comp.to_dict(orient='records')
    return []

#Fragmento 6: Los Flujos (Origen-Destino) - FORMATO ANCHO para el Mapa
def get_flujos(provincia: str = None):
    df = load_data()
    if df is not None and 'tipo_dia' in df.columns:
        df = filter_by_provincia(df, 'origen', provincia)
        
        # Filtramos flujos intra-municipales (Origen != Destino) para el mapa
        df = df[df['origen'] != df['destino']]
        
        # Filtramos para que solo devuelva municipios que el frontend puede dibujar
        # (Desactivamos temporalmente para permitir que se vean todos los flujos si el frontend tiene las coordenadas)
        # if hasattr(config, 'MUNICIPALES_DASHBOARD'):
        #     df = df[df['origen'].astype(str).isin(config.MUNICIPALES_DASHBOARD) & 
        #             df['destino'].astype(str).isin(config.MUNICIPALES_DASHBOARD)]
        
        # Agrupamos por O-D y tipo_dia
        flujos = df.groupby(['origen', 'destino', 'tipo_dia'])['viajes'].sum().unstack('tipo_dia').fillna(0).reset_index()
        
        # El frontend espera 'laborable', 'festivo' y 'viajes' (el total)
        for col in ['laborable', 'festivo']:
            if col not in flujos.columns: flujos[col] = 0
            
        flujos['viajes'] = flujos['laborable'] + flujos['festivo']
        
        # Devolvemos los top 100 flujos más importantes
        return flujos.sort_values(by='viajes', ascending=False).head(100).to_dict(orient='records')
    return []

#Por qué peidmos 40: Los flujos origen-destino son muchos. Si solo mostramos 8, 
#el mapa se vería muy vacío. Con 40, el usuario ve una red de conexiones real.

#Fragmento 7: Comparativa de Cambios: Laborables vs Festivos
def analizar_cambios_ranking(provincia: str = None, top_n: int = 8):
    """
    Usa la lógica de SETS de Python para comparar quién entra y sale 
    del ranking entre días laborables y festivos.
    """
    # 1. Obtenemos los datos del maestro
    df = load_data()
    if df is None: return "No hay datos para analizar"
    
    # Filtramos por provincia
    df = filter_by_provincia(df, 'origen', provincia)
    
    # Agrupamos por tipo de día para comparar los rankings
    df_lab = df[df['tipo_dia'] == 'laborable'].groupby('origen')['viajes'].sum().reset_index()
    df_fes = df[df['tipo_dia'] == 'festivo'].groupby('origen')['viajes'].sum().reset_index()
    
    # Sacamos los Top N nombres de municipios para ambos tipos de día
    top_lab = set(df_lab.sort_values(by='viajes', ascending=False).head(top_n)['origen'])
    top_fes = set(df_fes.sort_values(by='viajes', ascending=False).head(top_n)['origen'])
    
    # 2. LA MAGIA DE SETS (Diferencia de conjuntos)
    entran = top_fes - top_lab  # Estaban en festivo pero NO en laborable
    salen = top_lab - top_fes   # Estaban en laborable pero NO en festivo
    
    return {
        "municipios_que_entran": list(entran),
        "municipios_que_salen": list(salen)
    }
# Lógica: Esta función le dirá a Mariana: "Oye, Marbella entra en el ranking los 
# festivos pero sale los laborables". ¡Es un insight de negocio brutal!

"""
RESUMEN DEL MOTOR DE ANÁLISIS:
Este módulo transforma los datos masivos procesados por el backend en respuestas 
estratégicas. Implementa carga híbrida (Parquet/CSV), categorización humana de 
indicadores y comparativas de flujos mediante conjuntos (sets). 
Es el corazón lógico que alimenta al Front-end de Urbidata.
"""

def run_analysis():
    print("Iniciando análisis lógico de datos...")
    # Primero generamos los CSVs de output si no existen
    ranking_check = config.OUTPUT_DIR / "ranking_municipios.csv"
    if not os.path.exists(ranking_check):
        print("No se encontraron archivos de output. Generando...")
        build_outputs()
    else:
        print("✅ Archivos de output ya existen. Saltando generación.")
    # Probando algunos datos para ver que funciona:
    ranking_sevilla = get_ranking("sevilla", 5)
    print(f"Top 5 Orígenes en Sevilla: {ranking_sevilla}")
    
    pueblos_málaga = get_pueblos_dormitorio("málaga")
    print(f"Se identificaron {len(pueblos_málaga)} municipios con dependencia en Málaga.")
    
    print("Análisis métrico completado.")

if __name__ == "__main__":
    run_analysis()
