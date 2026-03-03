from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

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
async def root():
    return {"message": "Bienvenido a la API de Urbidata", "status": "running"}

@app.get("/data")
async def get_mobility_data():
    """
    Endpoint que devuelve los datos de movilidad. 
    Por ahora devolvemos una estructura base para que el frontend pueda conectar.
    """
    # Esta estructura debe reflejar lo que js/api.js espera
    return {
        "summary": {
            "total_trips": random.randint(500000, 1000000),
            "active_pairs": 145,
            "dormitory_towns": 8
        },
        "metadata": {
            "period": "Octubre 2023",
            "source": "MITMA OpenData"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
