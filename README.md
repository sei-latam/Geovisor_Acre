# Geovisor Acre - Sistema de Visualización y Análisis Geoespacial del Río Acre

---

## Descripción General

**Geovisor Acre** es un sistema integral de visualización y análisis geoespacial desarrollado colaborativamente por múltiples instituciones para monitorear y analizar eventos de inundación en la cuenca del Río Acre.

### Propósito
- Visualizar datos hidrometeorológicos e hidrológicos en tiempo real
- Analizar escenarios de inundación mediante modelos HEC-RAS
- Monitorear eventos de inundación con datos satelitales
- Proporcionar herramientas de análisis estadístico e hidrológico
- Facilitar la toma de decisiones en gestión de riesgo de desastres

### Instituciones Participantes
- **SENAMHI**: Servicio Nacional de Meteorología e Hidrología
- **MDPRyA**: Ministerio de Desarrollo Productivo, Rural y Agricultura
- **SEI**: Stockholm Environment Institute
- **BID**: Banco Interamericano de Desarrollo

---

## Arquitectura del Sistema

### Diseño General

```
┌─────────────────────────────────────────────────────────────────┐
│                      CAPA DE PRESENTACIÓN (Frontend)             │
│  ┌──────────┬──────────┬──────────┬──────────────┬────────────┐ │
│  │  Index   │  Área    │ Eventos  │ Monitoreo    │ Áreas de   │ │
│  │  (Home)  │ Estudio  │ Inunda.  │ Satelital    │ Inundación │ │
│  └──────────┴──────────┴──────────┴──────────────┴────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE LÓGICA DE NEGOCIO                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  app.js - Controlador Principal de Interacciones        │   │
│  │  - Gestión de capas geoespaciales (WMS)                 │   │
│  │  - Procesamiento de consultas (Depth)                   │   │
│  │  - Análisis temporal e histórico                        │   │
│  │  - Herramientas de dibujo y medición                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE DATOS Y SERVICIOS                    │
│  ┌──────────────────┬──────────────────┬─────────────────────┐ │
│  │ GeoServer WMS    │ OpenStreetMap    │ Datos Estáticos     │ │
│  │ (coast-wind.org) │ Nominatim        │ (Excel, TIFF, HDF5) │ │
│  └──────────────────┴──────────────────┴─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo de Datos

#### 1. **Consulta de Inundación Típica**
```
Usuario Ingresa Depth (m)
    ↓
Validación en JavaScript
    ↓
Cálculo de Escenario (HEC-RAS)
    ↓
Generación del nombre de capa GeoTIFF
    ↓
Solicitud WMS a GeoServer
    ↓
Renderizado en Leaflet Map
    ↓
Visualización con Leyenda Dinámica
```

#### 2. **Flujo de Análisis de Eventos**
```
Carga de Excel (XLSX)
    ↓
Procesamiento con XLSX.js
    ↓
Separación en dos datasets:
    ├─ Curvas IDF (Precipitación)
    └─ Hidrogramas (Caudal)
    ↓
Renderizado con Chart.js
    ↓
Exportación de selecciones en CSV
```

---

## Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **HTML5** | - | Estructura de documentos |
| **CSS3 + Tailwind CSS** | v3.x | Estilos responsivos |
| **JavaScript Vanilla** | ES6+ | Lógica de negocio |
| **Leaflet.js** | v1.9.4 | Mapas interactivos |
| **Chart.js** | v3+ | Gráficas de datos |
| **XLSX.js** | v0.18.5 | Procesamiento de Excel |
| **Nominatim API** | - | Búsqueda geocodificación |
| **Font Awesome** | v6.0.0 | Iconografía |

### Servicios Geoespaciales
| Servicio | URL | Función |
|---------|-----|---------|
| **GeoServer WMS** | `https://geoserver.coast-wind.org/geoserver/wms` | Capas georreferenciadas |
| **ESRI Tile Services** | `server.arcgisonline.com` | Mapas base satelitales |
| **Google Maps Tiles** | `mt1.google.com/vt/` | Mapas complementarios |
| **OpenStreetMap** | `openstreetmap.org` | Mapas OSM, geocodificación |

### Infraestructura de Datos
| Formato | Contenido |
|---------|----------|
| **GeoTIFF** | Rasters de modelos HEC-RAS |
| **HDF5** | Datos hidrológicos complejos |
| **XLSX** | Curvas IDF e hidrogramas |
| **SQL** | Definiciones de geodatabase |
| **QGIS Project** | Visualización de datos espaciales |

---

## Análisis de Componentes

### 1. **Página Principal (index.html / index.css)**
```
Propósito: Landing page institucional
Componentes:
├─ Header con navegación
├─ Área de imagen (Río Acre)
├─ Sección de instituciones participantes
├─ Footer con créditos

Características:
- Responsive design
- Grid layout para instituciones
- Enlaces a secciones temáticas
```

### 2. **Área de Estudio (area_estudio.html)**
```
Propósito: Contextualización geográfica
Características:
- Imagen de mapas de cuenca (PNG)
- Descripción técnica de la región
- Información sobre ecosistemas y riesgos
```

### 3. **Análisis de Eventos (eventos_inundacion.html)**
```
Propósito: Análisis de curvas IDF e hidrogramas
Stack:
- Chart.js para gráficas
- XLSX para carga de datos
- Exportación CSV

Funcionalidades:
├─ Carga remota de Excel
├─ Gráficas dinámicas
├─ Selección de escenarios
└─ Exportación filtrada a CSV
```

### 4. **Monitoreo Satelital (monitoreo_satelital.html)**
```
Propósito: Visualización de metodología
Componentes:
├─ Mapa Leaflet (40%)
├─ Panel de Metodología (60%)

Funcionalidades:
- Cambio de mapas base
- Dibujo de geometrías
- Medición de distancias
- Toggle de capas
```

### 5. **Áreas de Inundación (areas_inundacion.html)**
```
Propósito: Panel principal de análisis

COMPONENTES:
1. Mapa Leaflet (70%)
   ├─ Visualización WMS
   ├─ Múltiples mapas base
   ├─ Herramientas de dibujo
   └─ Búsqueda

2. Panel de Consultas (30%)
   ├─ Entrada Depth
   ├─ Selección de Plan/TR
   ├─ Gráfica temporal
   ├─ Historial
   └─ Logs WMS
```

**Configuración Global:**
- 7 Mapas Base (ESRI, Google, OpenStreetMap)
- GeoServer: coast_wind_data workspace
- 5 Planes HEC-RAS (P01-P05) con rangos WSEL

**Funciones Principales:**
- `validarIngresoWSEL()` - Validación de entrada
- `procesarConsultaAutomatica()` - Pipeline completo
- `generarCurvaExcel()` - Interpolación de datos
- `guardarConsultaEnHistorial()` - Persistencia
- `activarHerramientaDibujo()` - Herramientas geom.

---

## Base de Datos

### Estructura PostgreSQL

```sql
-- Tabla de Escenarios
CREATE TABLE scenarios (
  id SERIAL PRIMARY KEY,
  plan_code VARCHAR(10),
  wsel_min NUMERIC(8,4),
  wsel_max NUMERIC(8,4),
  time_steps INTEGER
);

-- Resultados HEC-RAS
CREATE TABLE hecras_outputs (
  id SERIAL PRIMARY KEY,
  scenario_id INTEGER REFERENCES scenarios(id),
  step_number INTEGER,
  wsel_value NUMERIC(8,4),
  simulation_time TIMESTAMP
);

-- Geometrías espaciales
CREATE TABLE river_network (
  id SERIAL PRIMARY KEY,
  geometry GEOMETRY(LINESTRING, 4326)
);
```

### Archivos de Datos
| Archivo | Tipo | Contenido |
|---------|------|----------|
| data.xlsx | Excel | Datos tabulares |
| data.tif | GeoTIFF | Raster inundación |
| data.hdf5 | HDF5 | Series temporales |

---

## Infraestructura Cloud

### GCP Services
- **GeoServer**: geoserver.coast-wind.org
- **Workspace**: coast_wind_data
- **Estilo**: estilo_manchas_inundacion
- **WMS Version**: 1.1.1

### Servicios Externos
- Nominatim (OpenStreetMap) - Geocodificación
- ESRI ArcGIS - Mapas base
- Google Cloud Storage - Datos raster

---

## Análisis de Código

### Buenas Prácticas
- Separación de responsabilidades
- Validación de entrada
- Librerías especializadas
- Funciones bien nombradas
---

## Historial de Commits

- **Período**: Junio 5-30, 2026 (25 días)
- **Total**: ~30 commits
- **Autor**: CarlosMendez1997Col
- **Frecuencia**: ~1-2/día
- **Patrón**: Desarrollo rápido sin PRs formales

**Fases:**
- Inicial (Jun 5-10): Setup + datos
- Desarrollo (Jun 19-26): Implementación
- Pulido (Jun 29-30): Ajustes finales

---

## Contribuciones

1. **Fork** repositorio
2. **Clone** localmente
3. **Crea rama**: `git checkout -b feature/nombre`
4. **Commit**: `git commit -m "Descripción"`
5. **Push**: `git push origin feature/nombre`
6. **Pull Request**: Con descripción detallada

---

## Licencia

**GPL-3.0** - Licencia Pública General GNU v3.0

## Contacto

- **GitHub**: [sei-latam/Geovisor_Acre](https://github.com/sei-latam/Geovisor_Acre)
- **Sitio Web**: [https://sei-latam.github.io/Geovisor_Acre/](https://sei-latam.github.io/Geovisor_Acre/)
- **GeoServer**: geoserver.coast-wind.org

---

**Documento generado automáticamente** - 2026-06-30
