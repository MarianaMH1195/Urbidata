# 🏙️ Urbidata: Análisis de Movilidad Urbana

Urbidata es una plataforma completa para el análisis y visualización de flujos de movilidad urbana entre las principales metrópolis de Andalucía (Sevilla y Málaga). El proyecto utiliza datos abiertos del **MITMA** (Ministerio de Transportes y Movilidad Sostenible) para identificar patrones de transporte, flujos pendulares y municipios con alta dependencia laboral.

## 🚀 Características Principales

- **Gestión Integral de Datos**: Desde la descarga automatizada del MITMA hasta la limpieza y preparación de archivos para su visualización.
- **Visualización de Flujos Reales**: Mapas interactivos con Leaflet que muestran los movimientos origen-destino con intensidades variables.
- **Análisis de Pueblos Dormitorio**: Algoritmo que identifica municipios con alta dependencia laboral respecto a las capitales (Sevilla/Málaga).
- **Comparativa Temporal**: Análisis diferenciado entre el comportamiento de movilidad en días laborables frente a festivos.
- **Dashboard de Alta Performance**: Interfaz fluida con KPIs animados, tablas de ranking dinámicas y gráficos interactivos (Chart.js).
- **Arquitectura Basada en API**: Backend robusto con FastAPI que garantiza respuestas rápidas y un desacoplamiento total del frontend.

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, Vanilla CSS (Modern Design), JavaScript (ES6+), Leaflet.js, Chart.js.
- **Backend**: Python 3.10+, FastAPI, Pandas, GeoPandas, Uvicorn.
- **Datos**: MITMA OpenData (Mobility).

## 📂 Estructura del Proyecto

```text
Urbidata/
├── backend/                # Lógica del servidor y procesamiento
│   ├── data/               # Almacenamiento de datos (Ignorado en Git)
│   │   ├── raw/            # Datos brutos del MITMA (.csv.gz)
│   │   ├── processed/      # Datos limpios filtrados
│   │   └── output/         # Resultados listos para el Dashboard
│   ├── notebook/           # Cuadernos de experimentación
│   ├── analysis.py         # Motor de cálculo y métricas
│   ├── app.py              # Ejecutor del flujo de datos
│   ├── cleaning.py         # Filtro y limpieza de datos
│   ├── config.py           # Configuración de rutas
│   ├── download.py         # Descarga automática
│   ├── eda.py              # Análisis Exploratorio
│   ├── main.py             # Servidor API y Web
│   └── maps.py             # Generador de mapas
├── frontend/               # Interfaz de usuario
│   ├── css/                # Estilos y animaciones
│   ├── img/                # Imágenes y activos
│   ├── js/                 # Lógica (api.js, ui.js, main.js)
│   └── index.html          # Dashboard principal
├── .gitignore              # Archivos excluidos de Git
├── LICENSE                 # Licencia del proyecto
├── mapa.html               # Mapa estático autogenerado
├── mapa_lineas.html        # Mapa de flujos estático
├── requirements.txt        # Dependencias de Python
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

3. **Preparar los Datos**:
   Existen dos formas de preparar el sistema:
   - **Opción A (Recomendada)**: Ejecutar el flujo de datos completo:
     ```bash
     python backend/app.py
     ```
   - **Opción B (Manual)**: Ejecutar paso a paso:
     ```bash
     python backend/download.py  # Descarga
     python backend/cleaning.py  # Limpieza y filtrado
     # El análisis se genera automáticamente al iniciar el servidor o mediante script.
     ```

4. **Lanzar la Aplicación**:
   ```bash
   python backend/main.py
   ```
   Abre [http://localhost:8000](http://localhost:8000) en tu navegador.

## 👥 Colaboradoras

- **Mariana Moreno Henao** (@MarianaMH1195): Liderazgo de Frontend, API y Diseño de UI.
- **Rocío**: Ingeniería de Datos 
- **Thamirys Kearney**: Desarrollo de lógica de procesamiento y análisis de datos.

---
Proyecto desarrollado como parte de la formación en Factoría F5.
