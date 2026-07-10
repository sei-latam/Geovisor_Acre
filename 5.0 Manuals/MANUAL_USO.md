# Manual de Uso - Geovisor Acre

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

## Introducción

### ¿Qué es el Geovisor Acre?

El **Geovisor Acre** es una herramienta web interactiva que permite visualizar y analizar información sobre el riesgo de inundaciones en la cuenca del Río Acre, ubicada en la frontera entre Perú y Bolivia. La plataforma integra datos geoespaciales, modelos hidrológicos y análisis de impacto.

### ¿Para quién es esta guía?

Esta guía está dirigida a:
- Autoridades locales y tomadores de decisiones
- Planificadores de emergencias
- Investigadores y académicos
- Público en general interesado en cambio climático e inundaciones
- Operadores de GeoServer

### Requisitos Técnicos Mínimos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a Internet (mínimo 2 Mbps)
- Resolución de pantalla mínima: 1024x768 píxeles
- JavaScript habilitado

---

## Acceso a la Plataforma

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
| Google Chrome | v90+ | Óptimo |
| Firefox | v88+ | Óptimo |
| Safari | v14+ | Bueno |
| Edge | v90+ | Bueno |
| Internet Explorer | - | No soportado |

---

## Navegación General

### Barra de Navegación Superior

```
┌─────────────────────────────────────────────────────────────┐
│  Inicio  Área de Estudio  Eventos  Monitoreo                │
│                                                             │
│  Logo Geovisor                          [Versión 1.0]       │
└─────────────────────────────────────────────────────────────┘
```


## Página Principal - Manchas de Inundación

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

```

## Área de Estudio

### Información de la Cuenca

```
RÍO ACRE - CUENCA BINACIONAL PERÚ-BOLIVIA

```

## Eventos de Inundación

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

## Monitoreo Satelital

### Información Técnica

```
FUENTE DE DATOS: Sentine 1 y imagenes SAR
```

### Metodología

```
Imagen descriptiva de la metodología en el panel derecho
```

---

## Herramientas del Mapa

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

## Preguntas Frecuentes

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

---


### Reporte de Problemas

Para reportar un problema:

1. **Captura de pantalla** del error (Impr Pant)
2. **Describe qué hiciste** antes del error
3. **Especifica**: navegador, SO, hora del problema

Ejemplo:
```
Asunto: Error al exportar shapefile Plan P03

Descripción:
  - Seleccioné Plan TR
  - Ingresé Depth 184.5
  - Se mostró error: "Connection timeout"

Navegador: Chrome 95.0
SO: Windows 10
Hora: 2026-07-10 14:30 UTC
```

---

## Recursos Adicionales

### Documentación Técnica

- [Manual de Desarrollo](MANUAL_DESARROLLO.md)
- [Manual de Administración](MANUAL_ADMIN.md)
- [README Principal](README.md)

### Datos Abiertos

Descarga datos completos:
- Repositorio GitHub: https://github.com/sei-latam/Geovisor_Acre


**Documento generado**: 2026-07-10  
**Versión**: 1.0  
**Idioma**: Español (Latinoamericano)  
**Última actualización**: 2026-07-10  

