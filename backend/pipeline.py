# ============================================================
# pipeline.py - Pipeline de datos de movilidad MITMA
# Genera CSVs agregados de Málaga y Sevilla
# ============================================================

# ── IMPORTACIÓN DE LIBRERÍAS ─────────────────────────────────
import sys
print('● Importando librerías ●')
try:
    import pandas as pd
    import os
    print('✅ Librerías importadas correctamente')
except ImportError as e:
    print(f'❌ Error importando librerías: {e}')
    sys.exit(1)

# ── CONFIGURACIÓN ─────────────────────────────────────────────
PROVINCIAS   = ['29', '41']          # Málaga y Sevilla
RAW_DIR      = "data/raw"
OUTPUT_DIR   = "data/output"
FECHA_INICIO = "2024-01-08"
FECHA_FIN    = "2024-01-14"
CAPITALES    = ['29067', '41091']    # Málaga capital y Sevilla capital

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── DESCARGA AUTOMÁTICA (si el servidor MITMA está disponible) ─
print('\n● Intentando descarga automática del servidor MITMA ●')
try:
    from pyspainmobility.mobility.mobility import Mobility
    mob = Mobility(
        version=2,
        zones="municipios",
        start_date=FECHA_INICIO,
        end_date=FECHA_FIN,
        output_directory=RAW_DIR
    )
    # Solo descarga los archivos, NO los procesa
    mob.download_data()
    print('✅ Descarga automática completada')
    descarga_ok = True

except (RuntimeError, AttributeError) as e:
    print(f'⚠️  Servidor MITMA no disponible o error en descarga: {e}')
    descarga_ok = False

# ── VERIFICAR QUE HAY ARCHIVOS EN data/raw/ ───────────────────
archivos = [f for f in os.listdir(RAW_DIR) if f.endswith(".csv.gz")]
if not archivos:
    raise FileNotFoundError(f'❌ No hay archivos .csv.gz en {RAW_DIR}/. Ponlos manualmente y vuelve a ejecutar.')
print(f'\n✅ Encontrados {len(archivos)} archivos en {RAW_DIR}/, continuando...')

# ── LEER Y FILTRAR ARCHIVOS CSV.GZ ────────────────────────────
print('\n● Leyendo y filtrando archivos por provincia ●')
todos = []

for f in sorted(archivos):
    path = os.path.join(RAW_DIR, f)
    print(f'  Leyendo: {f}')
    chunks = pd.read_csv(
        path, sep="|", dtype=str,
        compression="gzip", chunksize=100_000
    )
    for chunk in chunks:
        col_orig = [c for c in chunk.columns if 'origen' in c.lower() or 'origin' in c.lower()][0]
        col_dest = [c for c in chunk.columns if 'destino' in c.lower() or 'dest' in c.lower()][0]
        mask = (
            chunk[col_orig].str[:2].isin(PROVINCIAS) |
            chunk[col_dest].str[:2].isin(PROVINCIAS)
        )
        filtrado = chunk[mask]
        if not filtrado.empty:
            todos.append(filtrado)

# ── UNIR Y LIMPIAR ────────────────────────────────────────────
print('\n● Uniendo y limpiando datos ●')
df = pd.concat(todos, ignore_index=True)
print(f'  Total filas filtradas: {df.shape[0]}')

df['fecha']   = pd.to_datetime(df['fecha'], format='%Y%m%d')
df['tipo_dia'] = df['fecha'].dt.dayofweek.apply(
    lambda x: 'laborable' if x < 5 else 'festivo'
)
df['viajes']  = pd.to_numeric(df['viajes'], errors='coerce')
print('✅ Datos para preprocesar listos')

# ── GENERAR CSVs AGREGADOS ────────────────────────────────────
print('\n● Generando CSVs de output ●')

# 1. Flujos top origen-destino
flujos = (df.groupby(['origen', 'destino', 'tipo_dia'])['viajes']
          .sum().reset_index()
          .sort_values('viajes', ascending=False))
flujos.to_csv(f"{OUTPUT_DIR}/flujos_top.csv", index=False)
print(f'  ✅ flujos_top.csv → {flujos.shape[0]} filas')

# 2. Ranking municipios hacia la capital
ranking = (df[df['destino'].isin(CAPITALES)]
           .groupby(['origen', 'destino', 'tipo_dia'])['viajes']
           .sum().reset_index()
           .sort_values('viajes', ascending=False))
ranking.to_csv(f"{OUTPUT_DIR}/ranking_municipios.csv", index=False)
print(f'  ✅ ranking_municipios.csv → {ranking.shape[0]} filas')

# 3. Pueblos dormitorio
total_por_municipio = df.groupby('origen')['viajes'].sum()
viajes_a_capital    = (df[df['destino'].isin(CAPITALES)]
                       .groupby('origen')['viajes'].sum())
dormitorio = (viajes_a_capital / total_por_municipio * 100).dropna().reset_index()
dormitorio.columns = ['municipio', 'pct_dependencia']
dormitorio = dormitorio.sort_values('pct_dependencia', ascending=False)
dormitorio.to_csv(f"{OUTPUT_DIR}/pueblos_dormitorio.csv", index=False)
print(f'  ✅ pueblos_dormitorio.csv → {dormitorio.shape[0]} filas')

# 4. Comparativa laborable vs festivo
comparativa = (df.groupby(['origen', 'destino', 'tipo_dia'])['viajes']
               .sum().unstack('tipo_dia').reset_index())
comparativa.columns.name = None
comparativa.to_csv(f"{OUTPUT_DIR}/comparativa_lab_fest.csv", index=False)
print(f'  ✅ comparativa_lab_fest.csv → {comparativa.shape[0]} filas')

print('\n🎉 Pipeline completado. CSVs disponibles en data/output/')

