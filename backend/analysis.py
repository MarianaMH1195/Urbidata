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


def load_data(filename: str):
    """
    Carga datos de forma inteligente
    Busca primero archivos .parquet (más rápidos) y si no, busca el .csv.
    """
    # Creamos las dos versiones del nombre del archivo.
    #.replace asegura que si buscamos 'archivo.csv', también intentemos 'archivo.parquet'
    name_parquet = filename.replace(".csv", ".parquet")
    name_csv = filename if filename.endswith(".csv") else f"{filename}.csv"

    # Lista de posibles rutas para buscar (resiliencia)
    paths_to_try = [
        str(config.OUTPUT_DIR / name_parquet),
        str(config.OUTPUT_DIR / name_csv),
        os.path.join("data/output", name_parquet),
        os.path.join("data/output", name_csv)
    ]

    for path in paths_to_try:
        if os.path.exists(path):
            # Si es parquet, usamos read_parquet. Si es csv, read_csv.
            if path.endswith(".parquet"):
                return pd.read_parquet(path)
            return pd.read_csv(path)
    
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
    
    # Mapa de nombres a códigos (Fácil de ampliar)
    MAPPING = {'sevilla': '41', 'málaga': '29', 'malaga': '29'}
    codigo = MAPPING.get(provincia.lower())
    
    if codigo:
        return df[df[col_name].astype(str).str.startswith(codigo)]
    return df
# maneja el error de si alguien escribe "Malaga" sin tilde.
# IMPORTANTE: Si mañana queremos añadir 5 provincias más, solo añades líneas al diccionario MAPPING.

# Fragmento 3: El Ranking de viajes por municipio
def get_ranking(provincia: str = None, top_n: int = 8):
    """Devuelve el volumen de viajes desde cada municipio hacia la capital."""

    df = load_data("ranking_municipios.csv")
    if df is not None:
        df = filter_by_provincia(df, 'origen', provincia)

        # Agrupamos todas las finlas que tengan el mismo "origen" (ej. varios barrios de una ciudad) y suma sus valores de la columna "viajes".
        # reset_index(). Al agrupar, Pandas convierte "origen" en un índice. Usar .reset_index() lo devuelve a ser una columna normal para que sea fácil trabajar con ella después.
        ranking = df.groupby('origen')['viajes'].sum().reset_index()
        ranking = ranking.sort_values(by='viajes', ascending=False).head(top_n) # ordenamos por viajes en orden descendente y cogemos los top_n primeros (por defecto 8). Como antes hemos ordenado (sort_values) de mayor a menor, nos quedamos con los más importantes.
        return ranking.to_dict(orient='records')
    return []
# Resultado final: ranking.to_dict(orient='records') convierte la tabla en una Lista de Diccionarios.
# Ejemplo: [{'origen': 'Utrera', 'viajes': 500}, ...] -> Esto es oro puro para Mariana a la hora de trabajar en el Front-end porque es el lenguaje que entiende JavaScript nativamente.

# Fragmento 4: Localización de los Pueblos Dormitorio
def get_pueblos_dormitorio(provincia: str = None, umbral: float = config.DORMITORIO_THRESHOLD):
    """
    Identifica municipios con alta dependencia de la capital.
    Añade etiquetas humanas para mejorar la visualización en el Front-end.
    """
    df = load_data("pueblos_dormitorio.csv")
    if df is not None:
        df = filter_by_provincia(df, 'municipio', provincia)

        # Usamos .copy() para crear un nuevo DataFrame independiente
        # y evitar el error "SettingWithCopyWarning" de Pandas.
        dormitorio = df[df['pct_dependencia'] > umbral].copy()

        # LÓGICA DE CATEGORIZACIÓN: Transformamos el número en una etiqueta clara
        # Esto es vital para que Mariana pueda poner colores en el Front-end
        def clasificar_nivel(pct):
            if pct > 40: return "Dependencia Muy Alta"
            if pct > 25: return "Dependencia Alta"
            return "Dependencia Moderada"

        # .apply() ejecuta la función 'clasificar_nivel' en cada fila automáticamente. Es como un bucle 'for' pero mucho más rápido.
        # toma cada valor de la columna y le pasa nuestra "regla" de categorías.
        dormitorio['nivel_descripcion'] = dormitorio['pct_dependencia'].apply(clasificar_nivel)
        
        # Ordenamos de mayor a menor porcentaje antes de enviar
        return dormitorio.sort_values(by='pct_dependencia', ascending=False).to_dict(orient='records')
    return []


#Fragmento 5: Comparativa Laborables vs Festivos
def get_comparativa(provincia: str = None):

    """
    Compara viajes laborables vs festivos por origen. Es decir, compara dos columnas a la vez
    Esto nos permite ver si un pueblo se mueve más por trabajo o por ocio.

    """

    df = load_data("comparativa_lab_fest.csv")
    if df is not None:
        df = filter_by_provincia(df, 'origen', provincia)
         # Nos aseguramos de que las columnas existen antes de agrupar
        cols_disponibles = [c for c in ['laborable', 'festivo'] if c in df.columns]
        if not cols_disponibles:
            return []
        comp = df.groupby('origen')[cols_disponibles].sum().reset_index()
        return comp.to_dict(orient='records')
    return []

#Fragmento 6: Los Flujos (Origen-Destino)
def get_flujos(provincia: str = None):

    """
    Principales flujos origen-destino.
    En lugar de 8 resultados, aquí pedimos 40.
    """

    df = load_data("flujos_top.csv")
    if df is not None:
        df = filter_by_provincia(df, 'origen', provincia)
        # Devolvemos los top flujos
        flujos = df.sort_values(by='viajes', ascending=False).head(40)
        return flujos.to_dict(orient='records')
    return []

#Por qué peidmos 40: Los flujos origen-destino son muchos. Si solo mostramos 8, 
#el mapa se vería muy vacío. Con 40, el usuario ve una red de conexiones real.

#Fragmento 7: Comparativa de Cambios: Laborables vs Festivos
def analizar_cambios_ranking(provincia: str = None, top_n: int = 8):
    """
    Usa la lógica de SETS de Python para comparar quién entra y sale 
    del ranking entre días laborables y festivos.
    """
    # 1. Obtenemos los dos rankings (esto ya usa tu lógica previa)
    # Imaginemos que pedimos los datos de la comparativa
    df = load_data("comparativa_lab_fest.csv")
    if df is None: return "No hay datos comparativos"
    
    # Filtramos por provincia
    df = filter_by_provincia(df, 'origen', provincia)
    
    # Sacamos los Top N nombres de municipios para ambos tipos de día
    top_lab = set(df.sort_values(by='laborable', ascending=False).head(top_n)['origen'])
    top_fes = set(df.sort_values(by='festivo', ascending=False).head(top_n)['origen'])
    
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
    
    # Probando algunos datos para ver que funciona:
    ranking_sevilla = get_ranking("sevilla", 5)
    print(f"Top 5 Orígenes en Sevilla: {ranking_sevilla}")
    
    pueblos_málaga = get_pueblos_dormitorio("málaga")
    print(f"Se identificaron {len(pueblos_málaga)} municipios con dependencia en Málaga.")
    
    print("Análisis métrico completado.")

if __name__ == "__main__":
    run_analysis()
