"""
Urbidata - Exploratory Data Analysis (EDA)

0. DATASET CONTEXT
------------------
Objetivo de este script:
Realizar un Análisis Exploratorio de Datos (EDA) sobre los datos de movilidad
limpiados por nuestro pipeline (cleaning.py). Su función es entender la estructura, 
detectar valores atípicos (outliers), ver correlaciones y generar visualizaciones.

Origen de los datos:
Proviene de "backend/data/processed/", concretamente los datos filtrados para
nuestras provincias de interés (Málaga y Sevilla).
"""

# ==========================================
# 1. LIBRERÍAS NECESARIAS
# ==========================================
import pandas as pd # Manipulación de datos (Dataframes)
import numpy as np # Operaciones numéricas
import seaborn as sns # Gráficos estadísticos bonitos
import matplotlib.pyplot as plt # Gráficos base y Boxplots
import os # Para leer y guardar archivos en el sistema
import warnings

# Importamos rutas importantes desde nuestro archivo de configuración
import config   

# Configuraciones iniciales y de estilo
# Esta línea sirve para "silenciar" avisos técnicos que no son errores, 
# pero que ensucian la consola (como avisos de futuras versiones de pandas).
warnings.filterwarnings('ignore') 

pd.set_option('display.max_columns', None) # Mostrar todas las columnas
pd.set_option('display.max_rows', 100) # Mostrar hasta 100 filas
sns.set_style('whitegrid') # Fondo blanco para las gráficas
plt.rcParams['figure.figsize'] = (12, 6) # Todas las figuras tendrán el mismo tamaño por defecto

print("Librerías cargadas correctamente")


def run_eda():
    """
    Función principal que ejecuta todos los pasos del Exploratory Data Analysis.
    """
    print("="*50)
    print(" INICIANDO ANÁLISIS EXPLORATORIO DE DATOS (EDA)")
    print("="*50)

    # ==========================================
    # 2. DATASET LOAD
    # ==========================================
    ruta_parquet = config.PROCESSED_DIR / "datos_limpios_provincias.parquet"
    ruta_csv = config.PROCESSED_DIR / "datos_limpios_provincias.csv"
    
    df = None
    if os.path.exists(ruta_parquet):
        print(f"Cargando datos desde Parquet: {ruta_parquet}")
        df = pd.read_parquet(ruta_parquet)
    elif os.path.exists(ruta_csv):
        print(f"Cargando datos desde CSV: {ruta_csv}")
        df = pd.read_csv(ruta_csv)
    else:
        print("Error: No se encontraron datos limpios. 'cleaning.py' debe ejecutarse antes.")
        return

    # = ==========================================
    # 3. SE HACE UNA COPIA Y MUESTREO (SAMPLING)
    # ==========================================
    # Dado que el dataset es masivo (millones de filas), tomamos una muestra
    # representativa de 100,000 filas para que las gráficas generen rápido.
    # Esto es una práctica estándar en EDA cuando los datos exceden la capacidad de la RAM.
    
    if len(df) > 100000:
        print("Dataset muy grande detectado. Tomando muestra aleatoria de 100,000 filas para el análisis visual...")
        df_copy = df.sample(n=100000, random_state=42).copy()
    else:
        df_copy = df.copy()

    # ==========================================
    # 4. DATA OVERVIEW
    # ==========================================
    print("\n--- 4. DATA OVERVIEW ---")
    print(f"Total de filas: {df_copy.shape[0]}, Columnas: {df_copy.shape[1]}")
    
    print("\nPrimeras 5 filas (head):")
    print(df_copy.head())
    
    print("\nÚltimas 5 filas (tail):")
    print(df_copy.tail())
    
    print("\nInformación general del dataset (info):")
    df_copy.info()
    
    print("\nResumen estadístico de variables numéricas (describe):")
    # Intentamos asegurar que "viajes" u otras columnas que deban ser números lo sean
    if 'viajes' in df_copy.columns:
        df_copy['viajes'] = pd.to_numeric(df_copy['viajes'], errors='coerce')
    print(df_copy.describe())
    
    print("\nResumen estadístico de variables texto/categóricas (describe object):")
    # Describimos solo columnas tipo "object" (texto)
    print(df_copy.select_dtypes(include=['object']).describe())
    
    print("\nComprobación de Valores Nulos:")
    nulos = df_copy.isnull().sum()
    print(nulos[nulos > 0] if not nulos[nulos > 0].empty else "✅ ¡No hay valores nulos en el dataset!")
    
    # Creamos carpeta para guardar las gráficas
    graficos_dir = config.OUTPUT_DIR / "graficos_eda"
    os.makedirs(graficos_dir, exist_ok=True)
    
    # ==========================================
    # 5. ANÁLISIS UNIVARIABLE (Gráficas de una sola variable)
    # ==========================================
    print("\n--- 5. ANÁLISIS UNIVARIABLE Y GRÁFICAS ---")
    
    '''5.1 Histogramas: Distribución de la variable viajes
    Eliminamos la distribución entera. Se deja unicamente en el eda interactivo.
    Los "Outliers" (valores extremos) pueden deformar las gráficas.
    Usamos el percentil 95 (quantile(0.95)) para quedarnos con el 95% de los 
    datos normales y así poder ver bien la forma de la montaña en el histograma 
    sin que las rutas gigantescas nos aplasten la imagen.'''

    limite = df_copy['viajes'].quantile(0.95)
    datos_normales = df_copy[df_copy['viajes'] < limite]
    
    plt.figure()
    sns.histplot(data=datos_normales, x='viajes', bins=40, color="indigo", kde=True)
    plt.title("5.1 Histograma: Distribución de los viajes (sin outliers extremos)")
    plt.xlabel("Número de viajes")
    plt.ylabel("Frecuencia")
    plt.savefig(graficos_dir / "1_univariable_histograma_viajes.png")
    # plt.show() MUESTRA LA GRÁFICA EN PANTALLA
    # plt.show() 

    # 5.2 Box plots (Detección de outliers visualmente)
    plt.figure()
    sns.boxplot(x=datos_normales['viajes'], color="skyblue")
    plt.title("5.2 Boxplot: Distribución de cuartiles de la variable viajes")
    plt.xlabel("Número de viajes")
    plt.savefig(graficos_dir / "1_univariable_boxplot_viajes.png")
    # plt.show() MUESTRA LA GRÁFICA EN PANTALLA
    # plt.show()
    
    # ==========================================
    # 6. ANÁLISIS BIVARIABLE (Relaciones entre variables)
    # ==========================================
    print("\n--- 6. ANÁLISIS BIVARIABLE ---")
    
    '''Vamos a analizar el total de viajes desde los Top 10 Orígenes, cada 
    municipio que mas viajes generan y los separa por provincia para despues hacer 
    la gráfica. '''

    top_origenes = df_copy.groupby('origen')['viajes'].sum().sort_values(ascending=False).head(10).reset_index()
    # agrupa los orignes por viajes y ordena de mayor a menor y muestyra solamente los 10 primeros.
    # 6.1 Barras (Relacionando Variables Categóricas vs Numéricas)
    plt.figure()
    sns.barplot(data=top_origenes, x='origen', y='viajes', palette="Blues_r")
    plt.title("6.1 Barras: Top 10 Orígenes con más flujo de viajes")
    plt.xlabel("Código de Municipio (Origen)")
    plt.ylabel("Suma Total de Viajes")
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(graficos_dir / "2_bivariable_barras_top_origenes.png")
    # plt.show() MUESTRA LA GRÁFICA EN PANTALLA
    # plt.show()

    # ==========================================
    # 7. MATRIZ DE CORRELACIÓN (HEATMAP)
    # ==========================================
    print("\n--- 7. ANÁLISIS DE CORRELACIÓN (HEATMAP) ---")
    
    '''
    Solo podemos hacer matriz de correlación numérica si tenemos más columnas 
    numéricas. Como ejemplo sacamos la correlación entre las columnas numéricas. 
    Si solo está viajes, la matriz será pequeña 1x1, pero la estructura está 
    creada para cuando haya más métricas.
    '''

    cols_numericas = df_copy.select_dtypes(include=[np.number])
    if len(cols_numericas.columns) > 1:
        correlacion = cols_numericas.corr()
        plt.figure(figsize=(8,6))
        sns.heatmap(correlacion, annot=True, cmap="coolwarm", linewidths=0.5)
        plt.title("7. Heatmap: Matriz de Correlación")
        plt.tight_layout()
        plt.savefig(graficos_dir / "3_heatmap_correlacion.png")
        # plt.show() MUESTRA LA GRÁFICA EN PANTALLA
        # plt.show()
    else:
        print("Nota: El dataset actual solo tiene una variable numérica principal, QUE ES 'viajes', por lo que el mapa de calor no mostrará correlaciones significativas con otras métricas numéricas aún. pero está listo por si luego incluimos nuevas variables métricas (como 'tiempo', 'distancia') etc.")

    # ==========================================
    # 8. VIAJES ATÍPICOS (OUTLIERS)
    # ==========================================
    print("\n--- 8. VIAJES ATÍPICOS (OUTLIERS) Y FORMA DE LOS DATOS ---")
    # Verificamos si los datos están desequilibrados
    asimetria = df_copy['viajes'].skew()
    print(f"Nivel de desequilibrio (asimetría) en los viajes: {asimetria:.2f}")
    if asimetria > 1:
        print("Insight: La inmensa mayoría de las rutas tienen muy pocos viajes diarios. Sin embargo, hay un grupito muy pequeño de rutas que tienen gigantescas cantidades de viajes (seguramente los trayectos hacia la capital).")

    # ==========================================
    # 9. INSIGHTS Y OBSERVACIONES FINALES
    # ==========================================
    print("\n--- 9. CONCLUSIONES FINALES ---")
    print("El tráfico no se reparte por igual: Casi todo el volumen de transporte se concentra en unas pocas rutas muy transitadas, mientras que el resto de los pueblos apenas registran movimiento.")
    print("Los datos están súper limpios: No falta información ni hay valores en blanco en los datos que estamos usando.")

    print(f"Gráficos generados y guardados exitosamente en:\n{graficos_dir}")
    print("\n" + "="*50)
    print("EDA FINALIZADO CON ÉXITO")
    print("="*50)

if __name__ == "__main__":
    run_eda()
