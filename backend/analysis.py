import pandas as pd
import os

# --- CONFIGURACIÓN DE RUTAS ---
# Usamos rutas relativas al directorio raíz del proyecto para mayor seguridad
BASE_PATH = "backend/data/output"

def load_csv(filename: str):
    """Carga un CSV específico del output de Rocio."""
    # Intentamos varias rutas por si acaso el CWD varía
    paths_to_try = [
        os.path.join(BASE_PATH, filename),
        os.path.join("data/output", filename),
        filename
    ]
    for path in paths_to_try:
        if os.path.exists(path):
            return pd.read_csv(path)
    return None

def filter_by_provincia(df, col_name, provincia):
    """Filtrado genérico por provincia (29 para Málaga o 41 para Sevilla)."""
    if df is None: return None
    if provincia:
        # Buscamos el código de provincia (primeros 2 dígitos)
        codigo = '41' if provincia.lower() == 'sevilla' else '29' if provincia.lower() == 'málaga' else None
        if codigo:
            return df[df[col_name].astype(str).str.startswith(codigo)]
    return df

def get_ranking(provincia: str = None, top_n: int = 8):
    """Devuelve el volumen de viajes desde cada municipio hacia la capital."""
    df = load_csv("ranking_municipios.csv")
    if df is not None:
        df = filter_by_provincia(df, 'origen', provincia)
        # Agrupamos por origen y sumamos viajes (podría haber varios destinos "capital" si hay errores pero sumamos)
        ranking = df.groupby('origen')['viajes'].sum().reset_index()
        ranking = ranking.sort_values(by='viajes', ascending=False).head(top_n)
        return ranking.to_dict(orient='records')
    return []

def get_pueblos_dormitorio(provincia: str = None, umbral: float = 15.0):
    """
    Rocio calcula pct_dependencia (viajes a capital / total viajes * 100).
    Convertimos esto en nuestra lógica de 'dormitorio'.
    """
    df = load_csv("pueblos_dormitorio.csv")
    if df is not None:
        df = filter_by_provincia(df, 'municipio', provincia)
        # Filtramos por el porcentaje de dependencia hacia la capital
        dormitorio = df[df['pct_dependencia'] > umbral].sort_values(by='pct_dependencia', ascending=False)
        return dormitorio.to_dict(orient='records')
    return []

def get_comparativa(provincia: str = None):
    """Compara viajes laborables vs festivos por origen."""
    df = load_csv("comparativa_lab_fest.csv")
    if df is not None:
        df = filter_by_provincia(df, 'origen', provincia)
        # Sumamos por origen para simplificar la vista
        comp = df.groupby('origen')[['laborable', 'festivo']].sum().reset_index()
        return comp.to_dict(orient='records')
    return []

def get_flujos(provincia: str = None):
    """Principales flujos origen-destino."""
    df = load_csv("flujos_top.csv")
    if df is not None:
        df = filter_by_provincia(df, 'origen', provincia)
        # Devolvemos los top flujos
        flujos = df.sort_values(by='viajes', ascending=False).head(40)
        return flujos.to_dict(orient='records')
    return []

