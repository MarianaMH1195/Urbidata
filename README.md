# Urbidata

Plataforma avanzada de **Data Analytics y Visualización** diseñada para el análisis de la movilidad urbana en las provincias de Sevilla y Málaga. Utiliza datos abiertos del **MITMA** (Ministerio de Transportes, Movilidad y Agenda Urbana) para identificar patrones de desplazamiento, flujos migratorios diarios y la caracterización de pueblos dormitorio.

![Python](https://img.shields.io/badge/Python-3.11-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)
![Pandas](https://img.shields.io/badge/Pandas-2.0+-150458.svg)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9+-绿色.svg)
![Render](https://img.shields.io/badge/Deployment-Render-430098.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## Tabla de Contenidos
- [Descripción General](#descripción-general)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Repositorio](#estructura-del-repositorio)
- [Dataset y Variables](#dataset-y-variables)
- [Pipeline de Datos (ETL)](#pipeline-de-datos-etl)
  - [Extracción y Descarga](#extracción-y-descarga)
  - [Limpieza y Procesamiento](#limpieza-y-procesamiento)
  - [Motor de Análisis](#motor-de-análisis)
- [Dashboard Interactivo](#dashboard-interactivo)
- [Despliegue](#despliegue)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [Resultados e Insights](#resultados-e-insights)
- [Mejoras Futuras](#mejoras-futuras)

---

## Descripción General
**Urbidata** es una solución Fullstack orientada a **Smart Cities** que permite a planificadores urbanos y analistas comprender la dinámica de transporte en Andalucía. Mediante el procesamiento de millones de registros de Big Data, el sistema clasifica los desplazamientos por tipo de día (laborable vs. festivo) y calcula la dependencia económica de los municipios periféricos respecto a las capitales (Sevilla y Málaga).

---

## Tecnologías Utilizadas
- **Backend**: Python 3.11 con FastAPI.
- **Procesamiento de Datos**: Pandas, NumPy, Pyarrow (Parquet engine).
- **Frontend**: Vanilla HTML5, CSS3 (Modern UI) y JavaScript (ES6+).
- **Cartografía Interactiva**: Leaflet.js con capas personalizadas (CartoDB, Esri).
- **Visualización de Datos**: Chart.js para gráficas dinámicas.
- **Servidor Web**: Uvicorn.
- **Despliegue**: Render.com (PaaS).

---

## 📂 Estructura del Repositorio
```text
Urbidata/
├── backend/            # Lógica central y API
│   ├── data/           # Almacenamiento local de datos (Raw, Processed, Output)
│   ├── notebook/       # Notebooks de análisis y guías (EDA interactivo)
│   ├── analysis.py     # Motor de métricas y cálculos de movilidad
│   ├── cleaning.py     # Script ETL para limpieza y filtrado de Big Data
│   ├── config.py       # Configuración centralizada de rutas e IDs
│   ├── main.py         # Punto de entrada de la API FastAPI
│   └── eda.py          # Análisis exploratorio y generación de insights
├── frontend/           # Interfaz de usuario
│   ├── css/            # Estilos modernos y responsive
│   ├── js/             # Lógica de cliente (mapas, gráficas, API)
│   └── index.html      # Dashboard principal
├── requirements.txt    # Dependencias del proyecto
├── render.yaml         # Configuración de despliegue en la nube
├── .gitignore          # Archivos excluidos de Git
└── README.md           # Documentación del proyecto
```

---

## Dataset y Variables
El proyecto explota los datasets de movilidad del **MITMA** basados en tecnología Big Data móvil:
- **Temporales**: Fecha, tipo de día (Laborables vs. Festivos).
- **Geográficas**: ID de Municipio Origen, ID de Municipio Destino (Provincias 41 y 29).
- **Métricas de Movilidad**: 
  - `viajes`: Número total de desplazamientos detectados.
  - `distancia`: Segmentación por tramos de KM (v2).
  - `duración`: Tiempo estimado de trayecto.

---

## ⚙️ Pipeline de Datos (ETL)

### Extracción y Descarga
Gestionado por `download.py`, el sistema automatiza la descarga de archivos `.csv.gz` desde los buckets públicos del MITMA, gestionando la resiliencia ante cortes de red.

### Limpieza y Procesamiento
Ubicado en `cleaning.py`, este módulo realiza:
- Procesamiento por **chunks** (bloques de 100k filas) para optimizar memoria RAM.
- Filtrado geográfico estricto por provincias (Sevilla y Málaga).
- Conversión a formato **Parquet** para lecturas 10x más rápidas que CSV.

### Motor de Análisis
Localizado en `analysis.py`, el cerebro del proyecto calcula:
- **Ranking de Movilidad**: Municipios con mayor flujo hacia las capitales.
- **Ratio de Dependencia**: Identificación de "Pueblos Dormitorio" mediante umbrales configurables.
- **Comparativa Temporal**: Variaciones de flujo entre días laborables y fines de semana.

---

## 🚀 Dashboard Interactivo
La aplicación web permite una visualización 360º:
- **Mapa de Calidad**: Visualización de flujos mediante líneas Bezier con intensidad codificada por colores.
- **KPIs en tiempo real**: Contadores animados de viajes totales y municipios analizados.
- **Gráficas Comparativas**: Barras dinámicas para entender el comportamiento laborable/festivo.
- **Panel de Ranking**: Tabla interactiva con los municipios más activos.

---

## Despliegue
El proyecto está optimizado para funcionar en entornos **Cloud**:
- **Render.com**: Configurado mediante `render.yaml` para despliegues automáticos desde GitHub.
- **Configuración Dinámica**: El frontend adapta su `API_BASE_URL` automáticamente según el entorno detectado (local vs. producción).

---

## 🛠️ Instalación y Ejecución

### Requisitos Previos
- Python 3.10+
- Navegador moderno (Chrome/Firefox)

### Guía de Instalación
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/MarianaMH1195/Urbidata.git
   ```
2. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```
3. Ejecutar el servidor backend:
   ```bash
   python backend/main.py
   ```
4. Abrir `frontend/index.html` en tu navegador (o usar Live Server).

---

## 📈 Resultados e Insights
Tras el análisis exploratorio realizado en `eda.py`:

| Métrica | Observación |
| :--- | :--- |
| **Concentración** | El 85% de los flujos se dirigen a las áreas metropolitanas de Sevilla y Málaga. |
| **Pueblos Dormitorio** | Se identificaron +20 municipios con una dependencia superior al 25% hacia la capital. |
| **Asimetría** | La movilidad en días laborables supera en un 40% a la de los festivos en rutas interurbanas. |
| **Calidad de Datos** | 0% de valores nulos tras el filtrado del pipeline. |

---

## Mejoras Futuras
- **Predicción de Flujos**: Implementación de modelos SARIMA para predecir picos de tráfico.
- **Integración GIS**: Incorporación de capas de transporte público (GTFS) para comparar con movilidad privada.
- **Módulo de Reportes**: Exportación automática de PDF con insights semanales.

---

## 👥 Equipo

| Integrante | Rol | Contacto |
| :--- | :--- | :--- |
| **Rocio Lozano Caro** | Data Analyst | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rociolozanocaro/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/rociolozanocaro) |
| **Thamirys Kearney** | Product Owner | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/thamirys-kearney-0a7a7331/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/ThamirysKearney) |
| **Mariana Moreno** | Scrum Master | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mariana-moreno-henao/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/MarianaMH1195) |

---
<p align="center">
  <b>Factoría F5</b><br>
  <i>Proyecto diseñado para el <b>Bootcamp Data Analyst</b>.</i>
</p>
