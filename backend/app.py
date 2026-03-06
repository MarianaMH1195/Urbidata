"""
Urbidata - Orquestador del Pipeline (APP)
Este archivo es el punto de entrada. Ejecuta todo el proceso en orden.
"""

from config import PROVINCIAS_IDS
import download
import cleaning
# import analysis # Se activará el lunes
# import maps     # Se activará el lunes

def run_pipeline():
    """
    Ejecuta el pipeline completo.
    """
    print("="*50)
    print("🏗️ URBIDATA - INICIANDO PIPELINE DE DATOS")
    print("="*50)

    # 1. Descarga
    # download.run_download()

    # 2. Limpieza (Filtro por provincia y Chunks)
    cleaning.process_files()

    # 3. Análisis (Cálculo de métricas)
    print("\n📊 Análisis de datos (Próximamente el lunes...)")
    # analysis.run_analysis()

    # 4. Mapas (Visualización)
    print("\n🗺️ Generación de mapas (Próximamente el lunes...)")
    # maps.generate_maps()

    print("\n" + "="*50)
    print("✨ PIPELINE FINALIZADO CON ÉXITO")
    print("="*50)

if __name__ == "__main__":
    run_pipeline()
