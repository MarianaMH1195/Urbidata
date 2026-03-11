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
COORDENADAS_CIUDADES = {
    "SEVILLA": [37.3891, -5.9845],
    "MÁLAGA": [36.7212, -4.4214],
    "DOS HERMANAS": [37.2829, -5.9209],
    "ALCALÁ DE GUADAÍRA": [37.3333, -5.8500],
    "UTRERA": [37.1833, -5.7833],
    "MAIRENA DEL ALJARAFE": [37.3431, -6.0461],
    "MARBELLA": [36.5167, -4.8833],
    "FUENGIROLA": [36.5417, -4.6250],
    "VÉLEZ-MÁLAGA": [36.7833, -4.1000],
    "ANTEQUERA": [37.0192, -4.5611],
    "TORREMOLINOS": [36.6231, -4.5008],
    "RINCONADA, LA": [37.4872, -5.9822],
    "ÉCIJA": [37.5411, -5.0789],
    "ESTEPONA": [36.4278, -5.1444],
    "MIJAS": [36.5956, -4.6375]
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
