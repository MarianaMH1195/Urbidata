import sys
import os

# Asegurar que el directorio de este archivo está en el path para las importaciones locales
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import analysis

app = FastAPI(title="Urbidata API", description="API para el análisis de movilidad urbana en Sevilla y Málaga")

# Configuración de CORS - Vital para conectar con el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permitir todos los orígenes en desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.get("/health")
async def health():
    return {"status": "ok", "message": "API de Urbidata operativa"}

@app.get("/ranking")
async def get_ranking(
    provincia: str = Query(None, description="Filtrar por provincia (Sevilla/Málaga)"),
    top_n: int = Query(8, description="Número de municipios en el ranking")
):
    """Devuelve el ranking de municipios por volumen de viajes de salida."""
    return analysis.get_ranking(provincia, top_n)

@app.get("/pueblos_dormitorio")
async def get_pueblos_dormitorio(
    provincia: str = Query(None, description="Filtrar por provincia (Sevilla/Málaga)"),
    umbral: float = Query(2.0, description="Ratio de salidas/entradas para considerar pueblo dormitorio")
):
    """Devuelve municipios con alta dependencia laboral (muchas salidas, pocas entradas)."""
    return analysis.get_pueblos_dormitorio(provincia, umbral)

@app.get("/comparativa")
async def get_comparativa(
    provincia: str = Query(None, description="Filtrar por provincia (Sevilla/Málaga)")
):
    """Compara viajes en días laborables vs festivos."""
    return analysis.get_comparativa(provincia)

@app.get("/flujos")
async def get_flujos(
    provincia: str = Query(None, description="Filtrar por provincia (Sevilla/Málaga)")
):
    """Devuelve los principales flujos origen-destino."""
    return analysis.get_flujos(provincia)

# Mantenemos el endpoint original /data para compatibilidad temporal si es necesario
@app.get("/data")
async def get_legacy_data():
    return {
        "ranking": analysis.get_ranking(),
        "flujos": analysis.get_flujos(),
        "dormitorio": analysis.get_pueblos_dormitorio()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
