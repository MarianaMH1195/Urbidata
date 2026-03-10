"""
Urbidata - Módulo de Mapas (Maps)
Genera mapas interactivos usando Folium.
"""
import os
import folium
from config import OUTPUT_DIR

def generate_maps():
    """
    Genera mapas interactivos (HTML) para visualizar flujos e indicadores.
    """
    print("="*50)
    print("INICIANDO GENERACIÓN DE MAPAS")
    print("="*50)

    # Creamos carpeta para los mapas
    mapas_dir = OUTPUT_DIR / "mapas"
    os.makedirs(mapas_dir, exist_ok=True)

    # Coordenadas centrales de Andalucía (aproximadas para el mapa base)
    centro_andalucia = [37.3891, -5.9845] # Centro en Sevilla por defecto
    
    # 1. Crear el mapa base
    m = folium.Map(location=centro_andalucia, zoom_start=8, tiles='CartoDB positron')
    
    # Aquí podríamos iterar sobre los resultados de analysis.py
    # Como ejemplo, añadimos marcadores simulados de los pueblos dormitorio:
    marcadores = [
        {"nombre": "Dos Hermanas", "coords": [37.2829, -5.9209], "tipo": "Dormitorio"},
        {"nombre": "Mairena del Aljarafe", "coords": [37.3431, -6.0461], "tipo": "Dormitorio"}
    ]

    for marcador in marcadores:
        folium.CircleMarker(
            location=marcador["coords"],
            radius=8,
            popup=f"<b>{marcador['nombre']}</b><br>Tipo: {marcador['tipo']}",
            color='crimson',
            fill=True,
            fill_color='crimson'
        ).add_to(m)

    # Guardar el mapa interactivo
    mapa_path = mapas_dir / "mapa_andalucia_clusters.html"
    m.save(mapa_path)
    
    print(f"Mapa interactivo generado y guardado en:\n -> {mapa_path}")

if __name__ == "__main__":
    generate_maps()
