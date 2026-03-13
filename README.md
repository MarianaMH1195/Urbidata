# 🏙️ Urbidata: Análisis de Movilidad Urbana

Urbidata es una plataforma completa para el análisis y visualización de flujos de movilidad urbana entre las principales metrópolis de Andalucía (Sevilla y Málaga). El proyecto utiliza datos abiertos del **MITMA** (Ministerio de Transportes y Movilidad Sostenible) para identificar patrones de transporte, flujos pendulares y municipios con alta dependencia laboral.

## 🚀 Características Principales

- **Pipeline Automatizado**: Descarga y procesamiento automático de datos masivos del MITMA.
- **Arquitectura Modular**: Backend dividido en módulos especializados (descarga, limpieza, análisis).
- **API REST**: Servidor de alta velocidad construido con FastAPI para servir métricas en tiempo real.
- **Premium Dashboard**: Interfaz web interactiva con mapas dinámicos (Leaflet/Folium), KPIs animados y gráficas detalladas (Chart.js).
- **Análisis Avanzado**: Identificación de pueblos dormitorio y comparativas entre días laborables y festivos.

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, Vanilla CSS (Modern Design), JavaScript (ES6+), Leaflet.js, Chart.js.
- **Backend**: Python 3.10+, FastAPI, Pandas, GeoPandas, Uvicorn.
- **Datos**: MITMA OpenData (Mobility).

## 📂 Estructura del Proyecto

```text
Urbidata/
├── backend/                # Lógica del servidor y procesamiento
│   ├── notebook/           # Notebooks de experimentos (.ipynb)
│   ├── analysis.py         # Motor de cálculo y agregación
│   ├── cleaning.py         # Filtro y limpieza de datos
│   ├── config.py           # Configuración centralizada
│   ├── download.py         # Descarga automática del MITMA
│   ├── main.py             # Servidor API y Frontend
│   ├── maps.py             # Generador de mapas dinámicos
│   └── eda.py              # Análisis Exploratorio de Datos
├── frontend/               # Interfaz de usuario (página web)
│   ├── css/                # Estilos y animaciones
│   ├── js/                 # Lógica API y UI (api.js, ui.js, main.js)
│   └── index.html          # Dashboard principal
├── mapa.html               # Mapa auto-generado (estático)
├── mapa_lineas.html        # Mapa de flujos (estático)
├── requirements.txt        # Dependencias unificadas
├── LICENSE                 # Licencia del proyecto
└── README.md               # Documentación
```

## ⚙️ Instalación y Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone [url-del-repo]
   cd Urbidata
   ```

2. **Instalar dependencias**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Preparar los datos** (Ejecutar en orden):
   ```bash
   # Opcional: Descargar datos (requiere conexión al MITMA)
   python backend/download.py

   # Limpiar y generar datos maestros:
   python backend/cleaning.py
   ```

4. **Lanzar la aplicación**:
   ```bash
   python backend/main.py
   ```
   Abre [http://localhost:8000](http://localhost:8000) en tu navegador.

## 👥 Colaboradoras

- **Mariana Moreno Henao** (@MarianaMH1195): Liderazgo de Frontend, API y Diseño de UI.
- **Rocío**: Ingeniería de Datos 
- **Thamirys Kearney**: Desarrollo de Pipeline, Procesamiento y Lógica de Análisis.

---
Proyecto desarrollado como parte de la formación en Factoría F5.
