'''
Este archivo genera mapas interactivos usando geopandas y Folium.
'''
import os
import folium #dibuja los mapas
import config
import analysis #sacar los flujos
#import pandas as pd #para el csv de analysis

# 1. Coordenadas de ciudades
# se puede cambiar a CSV externo (opción B)
COORDENADAS_MUNICIPIOS = {
    # ── Sevilla capital y municipios principales ──────────────
    "41091": [37.3891, -5.9845],   # Sevilla capital
    "41038": [37.2829, -5.9209],   # Dos Hermanas
    "41004": [37.3333, -5.8500],   # Alcalá de Guadaíra
    "41091": [37.3891, -5.9845],   # Sevilla capital (repetido por seguridad)
    "41060": [37.1833, -5.7833],   # Utrera
    "41051": [37.3431, -6.0461],   # Mairena del Aljarafe
    "41078": [37.4872, -5.9822],   # La Rinconada
    "41033": [37.5411, -5.0789],   # Écija
    "41028": [37.3167, -5.7000],   # Carmona
    "41013": [37.5228, -6.0019],   # Brenes
    "41048": [37.3358, -6.1439],   # Mairena del Alcor (aprox)
    "41071": [37.6058, -5.9128],   # Lora del Río
    "41055": [37.2731, -5.6086],   # Morón de la Frontera
    "41095": [37.3939, -6.0436],   # Tomares
    "41044": [37.3778, -6.0514],   # Gelves
    # ── Málaga capital y municipios principales ───────────────
    "29067": [36.7212, -4.4214],   # Málaga capital
    "29069": [36.5167, -4.8833],   # Marbella
    "29051": [36.5417, -4.6250],   # Fuengirola
    "29904": [36.7833, -4.1000],   # Vélez-Málaga
    "29014": [37.0192, -4.5611],   # Antequera
    "29091": [36.6231, -4.5008],   # Torremolinos
    "29099": [36.4278, -5.1444],   # Estepona
    "29070": [36.5956, -4.6375],   # Mijas
    "29054": [36.7167, -4.5500],   # Málaga (Churriana, aprox)
    "29042": [36.6417, -4.5103],   # Benalmádena
    "29026": [36.5072, -4.7581],   # Benahavís
    "29080": [36.7800, -4.6500],   # Cártama
    "29050": [36.6000, -4.6333],   # Fuengirola (alt)
}
# Capitales con sus coordenadas para los marcadores hub
CAPITALES = {
    "41091": {"nombre": "Sevilla", "coords": [37.3891, -5.9845], "color": "crimson"},
    "29067": {"nombre": "Málaga", "coords": [36.7212, -4.4214],  "color": "royalblue"},
}

''' OPCIÓN B: CARGAR COORDENADAS DESDE UN CSV (Sustituye al diccionario de arriba)

df_coords = pd.read_csv("ruta/a/tu/archivo_coordenadas.csv")
COORDENADAS_CIUDADES = {
     row['municipio'].upper(): [row['lat'], row['lon']] 
     for index, row in df_coords.iterrows()
 }'''

def generate_maps(provincia_filtro=None):
    print("_"*50)
    if provincia_filtro:
        nombre_a_mostrar = provincia_filtro
    else:
        nombre_a_mostrar = "TODOS"
    
    print(f"GENERANDO MAPA DE FLUJOS PARA: {nombre_a_mostrar}")
    print("_"*50)

    # 2. Crear el mapa base (centrado en Sevilla)
    centro_andalucia = [37.3891, -5.9845]
    m = folium.Map(location=centro_andalucia, zoom_start=8, tiles='CartoDB positron')

    # 3. Obtener los flujos desde el motor de análisis
    # analysis.get_flujos devuelve los top viajes (origen, destino, viajes)
    flujos = analysis.get_flujos(provincia_filtro)
    
    if not flujos:
        print("Atención: No se encontraron datos de flujos en analysis.py.")
        # Añadimos un marcador de aviso por si los archivos están vacíos
        folium.Marker(
            location=centro_andalucia,
            popup="No hay datos de flujos todavía",
            icon=folium.Icon(color='red')
        ).add_to(m)
        return m

    print(f"Dibujando {len(flujos)} flujos en el mapa...")

    # 4. Dibujar las líneas de flujo (PolyLines)
    for flujo in flujos:
        origen = flujo.get('origen', '').upper()
        destino = flujo.get('destino', '').upper()
        num_viajes = flujo.get('viajes', 0)

        # se usan las coordenadas del diccionario, opción A.
        coord_ori = COORDENADAS_CIUDADES.get(origen)
        coord_des = COORDENADAS_CIUDADES.get(destino)

        if coord_ori and coord_des:
            # El grosor de la línea depende de los viajes
            grosor = max(1, num_viajes / 500)
            
            # Sevilla: rojo, Málaga: azul
            color_linea = 'crimson' if '41' in str(flujo.get('id_origen', '')) else 'royalblue'

            # Dibujamos la línea
            folium.PolyLine(
                locations=[coord_ori, coord_des],
                weight=grosor,
                color=color_linea,
                opacity=0.6,
                popup=f"Flujo: {origen} -> {destino}<br><b>{num_viajes} viajes</b>"
            ).add_to(m)
            
            #Ponemos un circulito en el origen
            folium.CircleMarker(
                location=coord_ori,
                radius=3,
                color='black',
                fill=True,
                fill_color='white'
            ).add_to(m)

    # 5. Guardar el mapa 
    mapas_dir = config.OUTPUT_DIR / "mapas"
    os.makedirs(mapas_dir, exist_ok=True)
    nombre_archivo = f"mapa_flujos_{provincia_filtro if provincia_filtro else 'total'}.html"
    m.save(mapas_dir / nombre_archivo)

    return m

if __name__ == "__main__":
    # Probamos generando el mapa total
    generate_maps()
