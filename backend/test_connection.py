import requests
import sys

def test_connection():
    url = "http://localhost:8000/health"
    print(f"Probando conexión con {url}...")
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            print("✅ Conexión exitosa con el backend!")
            print(f"Respuesta: {response.json()}")
            
            # Probar un endpoint de datos
            data_url = "http://localhost:8000/ranking?top_n=1"
            print(f"\nProbando endpoint de datos: {data_url}")
            data_res = requests.get(data_url)
            print(f"Datos recibidos: {data_res.json()}")
            return True
        else:
            print(f"❌ El servidor respondió con error: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ No se pudo conectar. ¿Está el servidor corriendo con 'uvicorn backend.main:app --reload'?")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
    return False

if __name__ == "__main__":
    test_connection()
