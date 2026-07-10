# 👤 Manual de Uso - Geovisor Acre

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Acceso a la Plataforma](#acceso-a-la-plataforma)
3. [Navegación General](#navegación-general)
4. [Página Principal - Manchas de Inundación](#página-principal---manchas-de-inundación)
5. [Área de Estudio](#área-de-estudio)
6. [Eventos de Inundación](#eventos-de-inundación)
7. [Monitoreo Satelital](#monitoreo-satelital)
8. [Herramientas del Mapa](#herramientas-del-mapa)
9. [Exportación de Datos](#exportación-de-datos)
10. [Preguntas Frecuentes](#preguntas-frecuentes)
11. [Contacto y Soporte](#contacto-y-soporte)

---

## 🎯 Introducción

### ¿Qué es el Geovisor Acre?

El **Geovisor Acre** es una herramienta web interactiva que permite visualizar y analizar información sobre el riesgo de inundaciones en la cuenca del Río Acre, ubicada en la frontera entre Perú y Bolivia. La plataforma integra datos geoespaciales, modelos hidrológicos y análisis de impacto.

### ¿Para quién es esta guía?

Esta guía está dirigida a:
- ✅ Autoridades locales y tomadores de decisiones
- ✅ Planificadores de emergencias
- ✅ Investigadores y académicos
- ✅ Público en general interesado en cambio climático e inundaciones
- ✅ Operadores de GeoServer

### Requisitos Técnicos Mínimos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a Internet (mínimo 2 Mbps)
- Resolución de pantalla mínima: 1024x768 píxeles
- JavaScript habilitado

---

## 🌐 Acceso a la Plataforma

### URL de Acceso

```
https://sei-latam.github.io/Geovisor_Acre/
```

### Primeros Pasos

1. **Abrir navegador** → Ingresa URL arriba
2. **Esperar carga** → La página se carga en 3-5 segundos
3. **Visualizar mapa** → Se muestra región del Río Acre

### Compatibilidad de Navegadores

| Navegador | Versión Mínima | Estado |
|-----------|-----------------|--------|
| Google Chrome | v90+ | ✅ Óptimo |
| Firefox | v88+ | ✅ Óptimo |
| Safari | v14+ | ✅ Bueno |
| Edge | v90+ | ✅ Bueno |
| Internet Explorer | - | ❌ No soportado |

---

## 🗺️ Navegación General

### Barra de Navegación Superior

```
┌─────────────────────────────────────────────────────────────┐
│  🏠 Inicio  📍 Área de Estudio  📊 Eventos  🛰️ Monitoreo  │
│                                                               │
│  Logo Geovisor                          [Versión 1.0]        │
└─────────────────────────────────────────────────────────────┘
```

### Páginas Disponibles

#### 🏠 **Inicio (Areas de Inundación)**
- Mapa interactivo con manchas de inundación
- Selector de niveles WSEL
- Panel de información de impactos

#### 📍 **Área de Estudio**
- Información general de la cuenca
- Características geográficas
- Datos hidrológicos históricos

#### 📊 **Eventos de Inundación**
- Gráficas de caudal vs. tiempo
- Relaciones Intensidad-Duración-Frecuencia (IDF)
- Hidrogramas simulados

#### 🛰️ **Monitoreo Satelital**
- Metodología de modelación
- Validación de pronósticos
- Información técnica

---

## 🌊 Página Principal - Manchas de Inundación

### Interfaz Principal

```
┌─────────────────────────────────────────────────────────┐
│                       MAPA INTERACTIVO                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │                                                  │   │
│  │         Mapa del Río Acre                        │   │
│  │         (Centro: -11.018, -68.752)               │   │
│  │         Zoom: 13x                                │   │
│  │                                                  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  PANEL DE CONTROL IZQUIERDO                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📊 SELECTOR DE NIVEL WSEL                       │   │
│  │                                                  │   │
│  │ Plan: [Dropdown: P01, P02, P03, P04, P05]      │   │
│  │ WSEL: [Slider 177.07 - 186.54] msnm             │   │
│  │                                                  │   │
│  │ Estadísticas:                                   │   │
│  │ • Área inundada: XXXX km²                       │   │
│  │ • Población expuesta: XXXX personas             │   │
│  │ • Área agrícola afectada: XXXX hectáreas        │   │
│  │                                                  │   │
│  │ [Botón] Exportar como Shapefile                 │   │
│  │ [Botón] Exportar como GeoJSON                   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  LEYENDA DE SEVERIDAD (Parte inferior del mapa)         │
│                                                          │
│  🔵 BAJO (177.07 - 179.0 msnm)                          │
│  🟢 MEDIO (179.0 - 181.0 msnm)                          │
│  🟡 MODERADO (181.0 - 183.5 msnm)                       │
│  🟠 FUERTE (183.5 - 185.5 msnm)                         │
│  🔴 EXTREMO (185.5 - 186.54 msnm)                       │
└─────────────────────────────────────────────────────────┘
```

### Usando el Selector de WSEL

#### Paso 1: Seleccionar Plan

```
Click en dropdown "Plan"
Opciones:
  • P01: Corto plazo (1-3 días)
  • P02: Mediano plazo (3-7 días)
  • P03: Largo plazo (7-15 días)
  • P04: Temporal seco
  • P05: Condición extrema

Selecciona el plan de interés
```

#### Paso 2: Ajustar Nivel WSEL

```
Método 1: Slider
  • Arrastrar barra hacia izquierda (nivel bajo)
  • Arrastrar barra hacia derecha (nivel alto)
  • El mapa actualiza en tiempo real

Método 2: Entrada Manual
  • Click en campo de texto
  • Ingresa valor entre 177.07 y 186.54 msnm
  • Presiona Enter

Ejemplo: Ingresa 183.5 para ver inundación moderada
```

#### Paso 3: Interpretar el Mapa

```
Colores observados:
🔵 Azul oscuro    = Zona sin inundación (más segura)
🟢 Verde          = Zona con inundación leve
🟡 Amarillo       = Zona con inundación moderada
🟠 Naranja        = Zona con inundación fuerte
🔴 Rojo           = Zona con inundación extrema

Densidad:
- Colores más intensos = mayor profundidad de agua
- Áreas sin color = no afectadas por inundación
```

### Interpretación de Estadísticas

```
📊 ÁREA INUNDADA: XXX.XX km²
   → Superficie de terreno bajo agua a ese nivel WSEL
   → Aumenta cuando subes el nivel

👥 POBLACIÓN EXPUESTA: XXXX personas
   → Habitantes en zonas de riesgo
   → Basado en datos de densidad poblacional

🌾 ÁREA AGRÍCOLA AFECTADA: XXXX hectáreas
   → Tierras de cultivo bajo riesgo
   → Información crítica para sectores productivos
```

---

## 📍 Área de Estudio

### Información de la Cuenca

```
RÍO ACRE - CUENCA BINACIONAL PERÚ-BOLIVIA

Ubicación:
  • Latitud: 10°00' - 12°00' S
  • Longitud: 68°00' - 70°00' O
  • Altitud: 177 - 2,800 msnm

Características Generales:
  • Área de cuenca: XXXX km²
  • Longitud principal: XXX km
  • Número de afluentes: XX

Población Ubicada:
  • Cobija (Bolivia): ~15,000 habitantes
  • Assis Brasil (Brasil): ~6,000 habitantes
  • Altres: ~5,000 habitantes
```

### Datos Climáticos Históricos

```
Precipitación Promedio Anual: 3,000 - 4,500 mm
Caudal Promedio: 1,200 m³/s
Caudal Máximo Histórico: 5,800 m³/s
Caudal Mínimo Histórico: 120 m³/s

Período de Máxima Inundación:
  • Inicio: Junio
  • Pico: Agosto-Septiembre
  • Descenso: Octubre-Noviembre
```

---

## 📊 Eventos de Inundación

### Gráfica de Caudal vs. Tiempo

```
Eje Y: Caudal (m³/s)
Eje X: Tiempo (Mes, Día, Año)

Línea Azul: Caudal medio diario observado
Línea Roja: Pronóstico a 5 días
Línea Punteada: Umbral de inundación (2,500 m³/s)

Interpretación:
  • Línea sobre puntea = Riesgo de inundación
  • Pendiente positiva = Aumentando caudal (alerta)
  • Pendiente negativa = Disminuyendo (mejorando)
```

### Relaciones Intensidad-Duración-Frecuencia (IDF)

```
Muestra relación entre:
  • INTENSIDAD: lluvia por unidad de tiempo (mm/h)
  • DURACIÓN: cuánto tiempo llueve (minutos/horas)
  • FRECUENCIA: cada cuánto ocurre (años)

Uso:
  → Planificadores pueden determinar períodos de retorno
  → Ejemplo: "Lluvia de 500 años de recurrencia"
  → Útil para diseño de infraestructura
```

### Hidrogramas Simulados

```
Gráfica que muestra:
  • Escorrentía simulada por modelo HEC-RAS
  • Comparación con mediciones observadas
  • Validación del modelo (concordancia)

Línea Verde: Hidrograma observado (medido)
Línea Naranja: Hidrograma simulado (modelo)

Si lineas están cerca = modelo es confiable
Si lineas se alejan = revisar parámetros del modelo
```

---

## 🛰️ Monitoreo Satelital

### Información Técnica

```
MODELO HIDROLÓGICO: HEC-RAS (1D)
  • Simulación hidráulica unidimensional
  • Base de datos: 100 secciones transversales
  • Precisión: ±0.5 metros

FUENTE DE DATOS:
  • Precipitación: CHIRPS, ERA5
  • Topografía: SRTM 30m, GEBCO
  • Uso de suelo: Copernicus Land Cover

VALIDACIÓN:
  • Comparación con estaciones de aforo
  • Calibración 1991-2020
  • Coeficiente Nash-Sutcliffe: 0.85+
```

### Metodología

```
FASE 1: PROCESAMIENTO DE DATOS
  ↓
  HDF5 → GeoTIFF → PostgreSQL/PostGIS
  
FASE 2: MODELO HIDROLÓGICO
  ↓
  HEC-RAS simula inundaciones a diferentes WSEL
  
FASE 3: GEORREFERENCIACIÓN
  ↓
  Manchas almacenadas como raster en BD
  
FASE 4: PUBLICACIÓN
  ↓
  GeoServer expone como servicio WMS
  
FASE 5: VISUALIZACIÓN
  ↓
  Navegador web renderiza mapas interactivos
```

---

## 🗺️ Herramientas del Mapa

### Controles del Mapa

```
┌─────────────────────────┐
│  Zoom In        [+]     │  ← Acercar vista
│  Zoom Out       [-]     │  ← Alejar vista
│  Ubicar Centro  [⊙]     │  ← Ir a área central
│  Cambiar Mapa   [⊞]     │  ← Seleccionar mapa base
│  Medición       [📏]    │  ← Medir distancias
│  Leyenda        [☰]     │  ← Ver leyenda
└─────────────────────────┘
```

### Mapas Base Disponibles

| Mapa | Descripción |
|------|------------|
| **OpenStreetMap** | Mapa topográfico de fuente abierta |
| **Satélite (ESRI)** | Imagen satélite actualizada |
| **Terreno** | Modelo de elevación digital |
| **Blanco y Negro** | Minimalista, para impresión |

### Búsqueda de Ubicaciones

```
1. Click en barra de búsqueda (superior)
2. Ingresa nombre de lugar:
   • "Cobija"
   • "Acre River"
   • "Puerto Asís"
3. Click en resultado
4. El mapa centra automáticamente

Nota: Usa Nominatim (OpenStreetMap)
```

---

## 💾 Exportación de Datos

### Exportar Mapa como Imagen

```
1. En panel izquierdo, busca botón [Exportar]
2. Click en "Exportar como PNG"
3. Espera a que se genere imagen
4. Se descarga automáticamente como:
   → geovisor_mapa_YYYYMMDD_HHMMSS.png

Resolución: 1200x900 píxeles
Formato: PNG (sin pérdida)
Tamaño típico: 2-5 MB
```

### Exportar Datos como Shapefile

```
1. Click en "Exportar como Shapefile"
2. Selecciona Plan (P01-P05)
3. Ingresa nivel WSEL
4. Click en "Generar"
5. Se descarga archivo ZIP con:
   → manchas.shp (geometría)
   → manchas.shx (índice)
   → manchas.dbf (atributos)
   → manchas.prj (proyección)
   → manchas.cpg (codificación)

Proyección: EPSG:3857 (Web Mercator)
Software compatible: ArcGIS, QGIS, Mapbox
```

### Exportar Datos como GeoJSON

```
1. Click en "Exportar como GeoJSON"
2. Selecciona criterios
3. Click en "Descargar"
4. Se descarga archivo:
   → geovisor_manchas.geojson

Formato: JSON con geometría
Uso: Integración en apps web
Tamaño: 10-100 MB (según WSEL)

Ejemplo de estructura:
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Polygon", ... },
      "properties": {
        "wsel": 183.5,
        "plan": "P01",
        "area_km2": 45.3
      }
    }
  ]
}
```

---

## ❓ Preguntas Frecuentes

### General

**P: ¿Con qué frecuencia se actualizan los datos?**
R: Los datos se actualizan diariamente con nuevas simulaciones del modelo HEC-RAS cuando hay nuevas predicciones meteorológicas.

**P: ¿Qué significa WSEL?**
R: Water Surface Elevation (Elevación de la Superficie del Agua). Es la altura en metros sobre el nivel del mar que alcanza el agua.

**P: ¿Puedo usar esta información para decisiones de emergencia?**
R: Sí, pero recomendamos validar con autoridades locales. Este es un sistema de apoyo, no reemplaza alertas oficiales.

### Técnico

**P: ¿Qué navegador debo usar?**
R: Recomendamos Chrome o Firefox versión reciente. Evita Internet Explorer.

**P: La página carga lentamente, ¿qué hago?**
R: Intenta:
  1. Refrescar página (Ctrl+R)
  2. Limpiar caché del navegador
  3. Probar en navegador diferente
  4. Reducir zoom del mapa

**P: ¿Funciona en celular?**
R: Sí, es responsive. Mejor con pantalla de 6" o mayor.

### Datos

**P: ¿De dónde vienen los datos de lluvia?**
R: De satélites meteorológicos (CHIRPS, ERA5) y estaciones de monitoreo de SENAMHI y IDEAM.

**P: ¿Qué tan precisos son los pronósticos?**
R: Coeficiente Nash-Sutcliffe de 0.85+, lo que indica buena concordancia. Pero siempre hay incertidumbre.

**P: ¿Puedo acceder a datos históricos?**
R: Sí, contacta al equipo técnico para solicitar datos de años anteriores.

---

## 📞 Contacto y Soporte

### Correo Electrónico

```
Soporte Técnico:      support@sei-latam.org
Información General:  info@sei-latam.org
Reportar Bugs:        bugs@sei-latam.org
```

### Redes Sociales

```
Facebook:   @SEI-LATAM
Twitter:    @SEI_LATAM
LinkedIn:   SEI-LATAM
```

### Formulario de Contacto

Disponible en: https://sei-latam.github.io/Geovisor_Acre/contacto

### Teléfono

```
Perú (SENAMHI):       +51-1-XXXXXXX
Bolivia (SMN):        +591-2-XXXXXXX
Brasil (INMET):       +55-61-XXXXXXX
```

### Reporte de Problemas

Para reportar un problema:

1. **Captura de pantalla** del error (Impr Pant)
2. **Describe qué hiciste** antes del error
3. **Especifica**: navegador, SO, hora del problema
4. **Envía email** a: bugs@sei-latam.org

Ejemplo:
```
Asunto: Error al exportar shapefile Plan P03

Descripción:
  - Seleccioné Plan P03
  - Ingresé WSEL 184.5
  - Clickeé "Exportar Shapefile"
  - Se mostró error: "Connection timeout"

Navegador: Chrome 95.0
SO: Windows 10
Hora: 2026-07-10 14:30 UTC
```

---

## 📚 Recursos Adicionales

### Documentación Técnica

- [Manual de Desarrollo](MANUAL_DESARROLLO.md)
- [Manual de Administración](MANUAL_ADMIN.md)
- [README Principal](README.md)

### Capacitación

- Webinars: Primer jueves de cada mes (14:00 UTC)
- Talleres presenciales: Trimestral en Cobija
- Cursos online: Acceso en Moodle (contactar equipo)

### Datos Abiertos

Descarga datos completos:
- Portal SENAMHI: https://www.senamhi.gob.pe
- Portal IDEAM: https://www.ideam.gov.co
- Repositorio GitHub: https://github.com/sei-latam/Geovisor_Acre

---

## 📋 Checklist para Primeros Pasos

- [ ] Accedí a https://sei-latam.github.io/Geovisor_Acre/
- [ ] Visualicé el mapa correctamente
- [ ] Cambié nivel WSEL con el slider
- [ ] Visualicé diferentes planes (P01-P05)
- [ ] Interpreté colores de severidad
- [ ] Exporté datos en formato deseado
- [ ] Probé búsqueda de ubicaciones
- [ ] Leí esta guía completa

✅ Si completaste todos: **¡Eres usuario experto!**

---

**Documento generado**: 2026-07-10  
**Versión**: 1.0  
**Idioma**: Español (Latinoamericano)  
**Última actualización**: 2026-07-10  

Para reportar errores o sugerencias de mejora, contacta a: support@sei-latam.org
