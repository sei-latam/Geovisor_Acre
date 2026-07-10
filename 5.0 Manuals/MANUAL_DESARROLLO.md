## ⚠️​ Importante - Actualización e inserción de nuevos datos en `Pronósticos` basado en `Areas_inundacion`⚠️​

## Scripts y codigo base:

### Modulo de areas_inundacion  
- **HTML**: [https://github.com/sei-latam/Geovisor_Acre/blob/main/pronostico.html](https://github.com/sei-latam/Geovisor_Acre/blob/main/pronostico.html)
- **JavaScript**: [https://github.com/sei-latam/Geovisor_Acre/blob/main/pronostico.js](https://github.com/sei-latam/Geovisor_Acre/blob/main/pronostico.js)

### Archivo JSON
- **JSON**: [https://github.com/sei-latam/Geovisor_Acre/blob/main/consultas.json](https://github.com/sei-latam/Geovisor_Acre/blob/main/consultas.json)

### Modulo de pronosticos
- **HTML**: [https://github.com/sei-latam/Geovisor_Acre/blob/main/areas_inundacion.html](https://github.com/sei-latam/Geovisor_Acre/blob/main/areas_inundacion.html)
- **JavaScript**: [https://github.com/sei-latam/Geovisor_Acre/blob/main/areas_inundacion.js](https://github.com/sei-latam/Geovisor_Acre/blob/main/areas_inundacion.js)

### Pasos a seguir

#### **Instrucciones para crear consultas en el módulo Areas_inundacion**
```
Pronosticador Ingresa Depth(m)
    ↓
Selección de escenario TR 
    ↓
Inserción de una fecha (dd/mm/yyy)
    ↓
Clic en el botón de "adicional consulta al historial"
    ↓
Clic en el botón de "Guardar Consultas JSON"
    ↓
Descarga del archivo JSON en el repositorio GitHub del proyecto
```

#### **Instrucciones para cargar el archivo de consultas.json**

```
Upload y commit del archivo JSON "consultas.json" dentro del repositorio GitHub
    ↓
Reivisión del archivo "consultas.json", https://github.com/sei-latam/Geovisor_Acre/blob/main/consultas.json
```

#### **Instrucciones para desplegar las consultas.json dentro del módulo pronostico**

```
Modificar y actualizar mediante un commit sencillo, el script de pronostico.js
    ↓
Verificar que el commit o comentario realizado no cambie la lógica del codigo js
    ↓
Realizar el deploy en github pages
    ↓
Ingresar a la pestaña de pronostico.html y verificar los cambios realizados en consultas.json
    ↓
Activación o apagado de las capas de consultas realizadas en el módulo de areas_inundación.
```

# Manual de Desarrollo - Geovisor Acre

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Fase Backend](#fase-backend)
5. [Fase Cloud GeoServices](#fase-cloud-geoservices)
6. [Fase Frontend](#fase-frontend)
7. [Guía de Instalación](#guía-de-instalación)
8. [Deployment](#deployment)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Introducción

### Propósito
Este manual proporciona documentación técnica detallada para desarrolladores que deseen:
- Entender la arquitectura completa del Geovisor Acre
- Replicar o adaptar el sistema a otras cuencas hidrográficas
- Mantener y evolucionar la plataforma
- Contribuir al proyecto

### Nivel de Experiencia Requerido
- **Backend**: Experiencia con Python, PostgreSQL/PostGIS, GeoServer
- **Frontend**: HTML5, CSS3, JavaScript ES6+, Leaflet.js
- **DevOps**: Familiaridad con GCP, Docker, CI/CD

### Términos Clave
- **WSEL**: Water Surface Elevation (Elevación de la Superficie del Agua)
- **HEC-RAS**: Hydraulic Engineering Center-River Analysis System
- **HDF5**: Hierarchical Data Format versión 5
- **PostGIS**: Extensión geoespacial para PostgreSQL
- **WMS**: Web Map Service (estándar OGC)
- **GeoServer**: Servidor de datos geoespaciales

---

## Arquitectura del Sistema

### Diseño End-to-End (E2E)

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO FINAL                             │
│            (Navegador Web - GitHub Pages)                        │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                              │
│  ┌──────────────┬─────────────────────┬──────────────────────┐  │
│  │ HTML5        │ CSS3 + Tailwind     │ JavaScript (app.js)  │  │
│  │ (Páginas)    │ (Estilos)           │ (Lógica)             │  │
│  └──────────────┴─────────────────────┴──────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         ↓ (HTTP/HTTPS)
┌─────────────────────────────────────────────────────────────────┐
│              GEOSERVICES LAYER (GCP - Cloud)                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ GeoServer (Java + Jetty)                                   │ │
│  │ - WMS Service (Web Map Service)                            │ │
│  │ - WFS Service (Web Feature Service)                        │ │
│  │ - Caché de tiles (ImageMosaic)                             │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────────┘
                         ↓ (JDBC/TCP)
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE LAYER (GCP - Cloud SQL)                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ PostgreSQL 15+ con PostGIS 3.x                             │ │
│  │ - Tablas: manchas_inundacion_depth                         │ │ 
│  │ - Datos raster (.TIF comprimido)                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo de Datos - Consulta Típica

```
1. Usuario ingresa depth en interfaz web
   ↓
2. Validación JavaScript (validarIngresoWSEL)
   ↓
3. Selecciona Plan/TR
   ↓
4. Frontend genera URL de solicitud WMS
   ↓
5. GeoServer procesa solicitud
   ↓
6. Leaflet renderiza imagen en mapa
```

---

## Stack Tecnológico

### Backend

| Componente | Versión | Propósito |
|-----------|---------|----------|
| **Python** | 3.10+ | Scripts de procesamiento |
| **PostgreSQL** | 15+ | Base de datos |
| **PostGIS** | 3.3+ | Extensión geoespacial |

### Cloud Infrastructure

| Servicio | Configuración |
|---------|--------------|
| **VM Compute** | e2-medium (2 vCPU, 4GB RAM) |
| **SO** | Debian 12 (Linux) |

### Frontend

| Tecnología | Propósito |
|-----------|----------|
| **HTML5** | Estructura |
| **CSS3 + Tailwind** | Estilos |
| **JavaScript ES6+** | Lógica |
| **Leaflet.js** | Mapas |
| **Chart.js** | Gráficas |

---

## Fase Backend

### Extracción de Datos HDF5

```bash
pip install h5py geopandas shapely rioxarray rasterio
```

### Base de Datos PostgreSQL/PostGIS

```bash
sudo apt-get install postgresql postgresql-contrib postgis
```

**Crear database:**

```sql
CREATE DATABASE "geovisor-db" ENCODING 'UTF8';
\c geovisor-db
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_raster;
```

**Crear tablas:**

```sql
CREATE TABLE geovisor_data.manchas_inundacion_wsel_p01 (
  id_wsel SERIAL PRIMARY KEY,
  nivel_wsel NUMERIC(10,4),
  plan CHAR(3),
  raster_wsel raster
);

CREATE INDEX idx_manchas_p01_raster 
  ON geovisor_data.manchas_inundacion_wsel_p01 
  USING GIST (st_convexhull(raster_wsel));
```

---

## Fase Cloud GeoServices

### Configuración GCP

```bash
gcloud compute instances create geovisor-server \
  --image-family=debian-12 \
  --machine-type=e2-medium \
  --zone=southamerica-east1-a \
  --boot-disk-size=10GB
```

### Instalación GeoServer

```bash
sudo apt-get install openjdk-17-jdk-headless
cd /opt
sudo wget https://sourceforge.net/projects/geoserver/files/GeoServer/2.28.x/geoserver-2.28.x-bin.zip
sudo unzip geoserver-2.28.x-bin.zip
```

---

## Fase Frontend

### Estructura Base HTML

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Geovisor - Río Acre</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

### Inicialización de Mapa

```javascript
const map = L.map('map').setView([-11.018, -68.752], 13);

const mapBases = {
  'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
  'Satélite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}')
};

mapBases['OpenStreetMap'].addTo(map);
L.control.layers(mapBases).addTo(map);
```

---

## Guía de Instalación

### Paso 1: Clonar Repositorio

```bash
git clone https://github.com/sei-latam/Geovisor_Acre.git
cd Geovisor_Acre
```

### Paso 2: Backend Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python scripts/extract_hdf5.py
python scripts/load_postgis.py
```

### Paso 3: Frontend Setup

```bash
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node.js
npx http-server
```

---

## Deployment

### GitHub Pages

```bash
git add .
git commit -m "Update"
git push origin main
# URL: https://sei-latam.github.io/Geovisor_Acre/
```

### Google Cloud Storage

```bash
gsutil -m cp -r . gs://geovisor-acre/
gsutil web set -m index.html -e 404.html gs://geovisor-acre/
```

---

## Testing

### Verificar WMS

```bash
curl "https://geoserver.coast-wind.org/geoserver/wms?
  service=WMS&version=1.1.1&request=GetCapabilities"
```

### Test Frontend

```bash
npm install --save-dev jest
npm test
```

---

## Troubleshooting

### GeoServer no responde

```bash
sudo systemctl status geoserver
tail -f /opt/geoserver-2.28.x/data_dir/logs/geoserver.log
sudo systemctl restart geoserver
```

### Error PostgreSQL

```sql
psql -U geoserver_user -h 35.XXX.XXX.XXX -d geovisor-db
```

### WMS no carga

- Verificar CORS en GeoServer
- Validar credenciales de BD
- Comprobar capas publicadas

---

## Referencias

- [GeoServer Documentation](https://geoserver.org/)
- [PostGIS Documentation](https://postgis.net/)
- [Leaflet.js](https://leafletjs.com/)
- [GCP Documentation](https://cloud.google.com/docs)

---

**Documento generado**: 2026-06-30  
**Versión**: 1.0
