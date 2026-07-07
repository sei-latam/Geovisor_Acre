// Rampa de colores idéntica al ColorMap del estilo SLD "estilo_inundacion" en GeoServer
var rampaColoresInundacion = [
  { limite: 0,  color: "#ffffff", etiqueta: "0 metros" },
  { limite: 2,  color: "#a6bddb", etiqueta: "2 metros" },
  { limite: 6,  color: "#3690c0", etiqueta: "6 metros" },
  { limite: 12, color: "#023858", etiqueta: "12 metros" },
  { limite: 17, color: "#4a1486", etiqueta: "17 metros" }
];

// Devuelve el color de la rampa correspondiente a una profundidad (depth) dada
function obtenerColorPorProfundidad(valorDepth) {
  var valor = parseFloat(valorDepth);
  if (isNaN(valor)) return rampaColoresInundacion[0].color;

  var colorSeleccionado = rampaColoresInundacion[0].color;
  for (var i = 0; i < rampaColoresInundacion.length; i++) {
    if (valor >= rampaColoresInundacion[i].limite) {
      colorSeleccionado = rampaColoresInundacion[i].color;
    }
  }
  return colorSeleccionado;
}

// Pinta el bloque fijo de la rampa de colores (Seco -> Extrema) dentro del panel de leyenda
function renderizarRampaLeyenda() {
  var contenedorRampa = document.getElementById('leyendaRampaContenedor');
  if (!contenedorRampa) return;

  contenedorRampa.innerHTML = rampaColoresInundacion.map(function(tramo) {
    return `
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded shrink-0 border border-slate-200" style="background-color: ${tramo.color};"></span>
        <span>${tramo.etiqueta} (≥ ${tramo.limite} m)</span>
      </div>
    `;
  }).join('');
}

var mapaBaseDefiniciones = {
  "Satélite Híbrido": {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    urlEsriLabels: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    thumb: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/4636/4414"
  },
  "Satélite Esri": {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    thumb: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/4636/4414"
  },
  "Esri World Street Map": {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    thumb: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/13/4636/4414"
  },
  "Esri World Topo Map": {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    thumb: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/13/4636/4414"
  },
  "Esri World Gray Canvas": {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    thumb: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/13/4636/4414"
  },
  "Google Maps": {
    url: "https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}",
    thumb: "https://a.tile.openstreetmap.org/13/4414/4636.png"
  },
  "Google Satélite": {
    url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    thumb: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/4636/4414"
  }
};

var map = L.map('map', { zoomControl: false }).setView([-11.018, -68.752], 13);
L.control.zoom({ position: 'bottomright' }).addTo(map);

var esriHibridoLayer = L.tileLayer(mapaBaseDefiniciones["Satélite Híbrido"].url);
var esriLabelsLayer = L.tileLayer(mapaBaseDefiniciones["Satélite Híbrido"].urlEsriLabels);
var capaBaseInstanciada = L.layerGroup([esriHibridoLayer, esriLabelsLayer]).addTo(map);
var mapaBaseActualNombre = "Satélite Híbrido";

var urlServidorWms = "https://geoserver.coast-wind.org/geoserver/rio_acre_manchas/wms";
var espacioTrabajoReal = "rio_acre_manchas";
var estiloAsignado = "estilo_inundacion";

var capaPrevisualizacionTemporal = null; 
var consultaActualTemporal = null;       
var historialConsultas = [];

const urlBaseGitHub = "https://raw.githubusercontent.com/sei-latam/Geovisor_Acre/refs/heads/main/charts/";

var dbExcelPlanes = {
  tr2:    { min: 0.0000, max: 12.2199, archivo: "depth_TR2.csv", capa: "rio_acre_manchas:depth_tr2", capaSuffix: "TR02" },
  tr10:   { min: 0.0000, max: 14.5453, archivo: "depth_TR10.csv", capa: "rio_acre_manchas:depth_tr10", capaSuffix: "TR10" },
  tr50:   { min: 0.0000, max: 16.1415, archivo: "depth_TR50.csv", capa: "rio_acre_manchas:depth_tr50", capaSuffix: "TR50" },
  tr100:  { min: 0.0000, max: 16.7478, archivo: "depth_TR100.csv", capa: "rio_acre_manchas:depth_tr100", capaSuffix: "TR100" },
  tr2023: { min: 0.0000, max: 12.3294, archivo: "depth_TR2023.csv", capa: "rio_acre_manchas:depth_tr2023", capaSuffix: "TR2023" }
};

var capasDibujo = L.featureGroup().addTo(map);
var herramientaActiva = null;
var dibujandoObjeto = null;
var puntosMedicion = [];
var tooltipMedicion = null;

function construirGaleriaMapasBase() {
  var grid = document.getElementById('basemapGridContainer');
  grid.innerHTML = "";
  
  Object.keys(mapaBaseDefiniciones).forEach(nombre => {
    var esActivo = nombre === mapaBaseActualNombre;
    var card = document.createElement('div');
    card.className = `basemap-card ${esActivo ? 'active' : ''}`;
    card.id = `bm-${nombre.replace(/ /g, "-")}`;
    card.onclick = function() { cambiarMapaBase(nombre); };
    
    card.innerHTML = `
      <div class="h-14 w-full rounded bg-slate-200 overflow-hidden relative border border-slate-200">
        <img src="${mapaBaseDefiniciones[nombre].thumb}" class="w-full h-full object-cover" alt="${nombre}" onerror="this.src='https://placehold.co/150x100?text=SIG'">
      </div>
      <span class="text-[10px] font-bold text-center text-slate-700 truncate block w-full" title="${nombre}">${nombre}</span>
    `;
    grid.appendChild(card);
  });
}
construirGaleriaMapasBase();

function cambiarMapaBase(nombre) {
  if (capaBaseInstanciada) { 
    map.removeLayer(capaBaseInstanciada); 
  }
  
  if (nombre === "Satélite Híbrido") {
    var l1 = L.tileLayer(mapaBaseDefiniciones[nombre].url);
    var l2 = L.tileLayer(mapaBaseDefiniciones[nombre].urlEsriLabels);
    capaBaseInstanciada = L.layerGroup([l1, l2]).addTo(map);
  } else {
    capaBaseInstanciada = L.tileLayer(mapaBaseDefiniciones[nombre].url).addTo(map);
  }
  
  mapaBaseActualNombre = nombre;
  
  Object.keys(mapaBaseDefiniciones).forEach(n => {
    var el = document.getElementById(`bm-${n.replace(/ /g, "-")}`);
    if(el) el.className = n === nombre ? "basemap-card active" : "basemap-card";
  });

  actualizarLeyendaDinamica();
}

function toggleWidget(idPanel) {
  var paneles = ['panelBasemaps', 'panelDibujo', 'panelCapasGEE'];
  paneles.forEach(p => { if(p !== idPanel) document.getElementById(p).classList.add('hidden'); });
  document.getElementById(idPanel).classList.toggle('hidden');
}

// Almacenamiento temporal para no volver a descargar datos ya consultados
var cacheDatosCSV = {};
var miChart;

function inicializarChartVacio() {
  var ctx = document.getElementById('chartJsCanvas').getContext('2d');
  miChart = new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Valores de Profundidad', data: [], borderColor: '#2563eb', borderWidth: 2, fill: true, backgroundColor: 'rgba(219, 234, 254, 0.4)', pointRadius: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, scales: { x: { display: false }, y: { grid: { color: '#f1f5f9' } } } }
  });
}
inicializarChartVacio();

function validarIngresoDepth() {
  var depthVal = document.getElementById('depthInput').value.trim();
  var selectorPlanes = document.getElementById('planSelect');
  if (depthVal !== "" && !isNaN(parseFloat(depthVal))) {
    selectorPlanes.disabled = false; selectorPlanes.options[0].text = "-- Seleccione el Escenario/TR --";
  } else {
    selectorPlanes.disabled = true; selectorPlanes.value = ""; selectorPlanes.options[0].text = "-- Ingrese Depth primero --";
    if(capaPrevisualizacionTemporal) { map.removeLayer(capaPrevisualizacionTemporal); capaPrevisualizacionTemporal = null; }
    document.getElementById('btnGuardarConsulta').disabled = true;
  }
}

// =========================================================================
// LECTOR ASÍNCRONO AUTOMÁTICO DE ARCHIVOS CSV DE GITHUB
// =========================================================================
async function descargarYProcesarCSV(planSeleccionado) {
  if (cacheDatosCSV[planSeleccionado]) {
    return cacheDatosCSV[planSeleccionado];
  }

  var urlCompleta = urlBaseGitHub + dbExcelPlanes[planSeleccionado].archivo;

  try {
    var respuesta = await fetch(urlCompleta);
    if (!respuesta.ok) throw new Error("Error en conexión de red");
    
    var textoPlano = await respuesta.text();
    var lineas = textoPlano.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    
    // Detectamos encabezados
    var encabezados = lineas[0].split(",");
    let idxStep = encabezados.findIndex(h => h.toLowerCase().includes('step') || h.toLowerCase().includes('tiempo') || h.toLowerCase().includes('_0'));
    let idxDate = encabezados.findIndex(h => h.toLowerCase().includes('date') || h.toLowerCase().includes('fecha'));
    let idxDepth = encabezados.findIndex(h => h.toLowerCase().includes('wsel') || h.toLowerCase().includes('depth') || h.toLowerCase().includes('valor'));

    // Si no encuentra los indices por nombre, asignamos por posición por defecto (0, 1, 2)
    if (idxStep === -1) idxStep = 0;
    if (idxDate === -1) idxDate = 1;
    if (idxDepth === -1) idxDepth = 2;

    var arregloObjetos = [];
    for (var i = 1; i < lineas.length; i++) {
      var columnas = lineas[i].split(",");
      if (columnas.length >= 3) {
        arregloObjetos.push({
          step: parseInt(columnas[idxStep]) || i,
          date: columnas[idxDate] ? columnas[idxDate].replace(/"/g, '') : "01FEB2026 00:00:00",
          depth: parseFloat(columnas[idxDepth]) || 0
        });
      }
    }

    cacheDatosCSV[planSeleccionado] = arregloObjetos;
    return arregloObjetos;

  } catch (error) {
    console.error("Fallo al conectar con los servidores de datos en GitHub:", error);
    alert(`No se pudo descargar el archivo de datos: ${dbExcelPlanes[planSeleccionado].archivo}`);
    return null;
  }
}

// =========================================================================
// PROCESAMIENTO PRINCIPAL MODIFICADO (AHORA ASÍNCRONO REAL)
// =========================================================================
async function procesarConsultaAutomatica() {
  var depthValor = parseFloat(document.getElementById('depthInput').value);
  var planSeleccionado = document.getElementById('planSelect').value;
  if (!planSeleccionado || isNaN(depthValor)) return;

  var meta = dbExcelPlanes[planSeleccionado];

  if (depthValor < meta.min || depthValor > meta.max) {
    alert(`Limites Excedidos: ${depthValor}m fuera de [${meta.min.toFixed(2)}m - ${meta.max.toFixed(2)}m].`);
    document.getElementById('planSelect').value = ""; return;
  }

  document.getElementById('badgeEstado').className = "text-[9px] font-bold bg-amber-500 text-white px-2 py-1 rounded uppercase tracking-wider animate-pulse";
  document.getElementById('badgeEstado').innerText = "Descargando...";

  var datosPlanActual = await descargarYProcesarCSV(planSeleccionado);
  
  if (!datosPlanActual || datosPlanActual.length === 0) {
    document.getElementById('badgeEstado').className = "text-[9px] font-bold bg-red-500 text-white px-2 py-1 rounded uppercase tracking-wider";
    document.getElementById('badgeEstado').innerText = "Error Datos";
    return;
  }

  document.getElementById('badgeEstado').className = "text-[9px] font-bold bg-green-500 text-white px-2 py-1 rounded uppercase tracking-wider";
  document.getElementById('badgeEstado').innerText = "Procesado";

  // Buscar el paso más cercano al valor digitado
  var puntoMasCercano = datosPlanActual.reduce((prev, curr) => Math.abs(curr.depth - depthValor) < Math.abs(prev.depth - depthValor) ? curr : prev);

  document.getElementById('fechaDetectadaInput').value = puntoMasCercano.date;
  
  // Graficar la serie temporal completa obtenida del CSV genuino
  miChart.data.labels = datosPlanActual.map(p => `Paso ${p.step}`);
  miChart.data.datasets[0].data = datosPlanActual.map(p => p.depth);
  miChart.data.datasets[0].pointRadius = datosPlanActual.map(p => p.step === puntoMasCercano.step ? 6 : 0);
  miChart.data.datasets[0].pointBackgroundColor = datosPlanActual.map(p => p.step === puntoMasCercano.step ? '#ef4444' : '#2563eb');

  miChart.update();

  document.getElementById('btnDescargarCSV').disabled = false;

  // CONSTRUCCIÓN FORMAL DEL STRING DE CAPA REAL: Depth_XX_DDMMMYYYY_HH_MM_SS_TRXX
  var numeroPasoFormateado = String(puntoMasCercano.step).padStart(2, '0');
  
  // Formato real que entrega el CSV: "19APR2026 13:30:00" (DDMMMAAAA HH:MM:SS, sin guiones)
  var partesFecha = puntoMasCercano.date.trim().split(" "); // ["19APR2026", "13:30:00"]
  var fechaBruta = partesFecha[0] || "";                    // "19APR2026"
  var horaBruta = partesFecha[1] || "00:00:00";              // "13:30:00"

  var dia = fechaBruta.substring(0, 2).padStart(2, '0');     // "19"
  var mes = fechaBruta.substring(2, 5).toUpperCase();        // "APR"
  var anio = fechaBruta.substring(5, 9) || "2026";           // "2026"

  var horaMinutoSegundo = horaBruta.split(":");              // ["13", "30", "00"]
  var hora = (horaMinutoSegundo[0] || "00").padStart(2, '0');
  var minuto = (horaMinutoSegundo[1] || "00").padStart(2, '0');
  var segundo = (horaMinutoSegundo[2] || "00").padStart(2, '0');

  // Ensamblamos la cadena de tiempo idéntica al almacén de GeoServer
  var cadenaFechaFinal = `${dia}${mes}${anio}_${hora}_${minuto}_${segundo}`;
  var sufijoTR = dbExcelPlanes[planSeleccionado].capaSuffix; // Obtiene TR02, TR10, etc.
  
  var nombreCapaGeoTIFF = `Depth_${numeroPasoFormateado}_${cadenaFechaFinal}_${sufijoTR}`;

  if (capaPrevisualizacionTemporal) { map.removeLayer(capaPrevisualizacionTemporal); }

  // INYECCIÓN CON VERSIONAMIENTO CORRECTO AL GEOSERVER DE PRODUCCIÓN
  capaPrevisualizacionTemporal = L.tileLayer.wms(urlServidorWms, {
    layers: `${espacioTrabajoReal}:${nombreCapaGeoTIFF}`,
    format: 'image/png', 
    transparent: true, 
    version: '1.1.0', // Ajustado a la versión nativa de tu enlace de prueba
    styles: estiloAsignado
  }).addTo(map);

  document.getElementById('logConsole').innerHTML = `<span class="text-green-400">> Previsualizando:</span> <span class="text-white">${espacioTrabajoReal}:${nombreCapaGeoTIFF}</span>`;

  // Guardamos en el objeto temporal usando el nuevo nombre estándar
  consultaActualTemporal = {
    plan: planSeleccionado.toUpperCase(),
    depth: depthValor.toFixed(2),
    labelCapa: `${planSeleccionado.toUpperCase()} (Depth: ${depthValor.toFixed(4)}m)`,
    servicio: `${espacioTrabajoReal}:${nombreCapaGeoTIFF}`,
    instanciaCapa: capaPrevisualizacionTemporal,
    fechaDetectada: puntoMasCercano.date
  };
  
  document.getElementById('btnGuardarConsulta').disabled = false;
  actualizarLeyendaDinamica();
}


// =========================================================================
// FUNCIÓN PARA DESCARGAR LOS DATOS ACTIVOS DIRECTAMENTE AL PC
// =========================================================================
// Agrega un botón en tu HTML que llame a esta función: onclick="descargarDatosCSVActual()"
function descargarDatosCSVActual() {
  var planSeleccionado = document.getElementById('planSelect').value;
  if (!planSeleccionado || !cacheDatosCSV[planSeleccionado]) {
    alert("No hay datos cargados para descargar. Digite un valor y seleccione un TR.");
    return;
  }

  var datos = cacheDatosCSV[planSeleccionado];
  var contenidoCSV = "Step,Date/Time,Depth\n";
  
  datos.forEach(f => {
    contenidoCSV += `${f.step},"${f.date}",${f.depth}\n`;
  });

  var blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
  var link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `Datos_Inundacion_${planSeleccionado.toUpperCase()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// =========================================================================
// FUNCIÓN MODIFICADA: ALMACENA LA URL COMPLETA EN LA COLUMNA DE SERVICIOS
// =========================================================================
function guardarConsultaEnHistorial() {
  if (!consultaActualTemporal) return;

  // 1. Capturar o actualizar la fecha seleccionada por el usuario
  consultaActualTemporal.fechaDetectada = document.getElementById('fechaDetectadaInput').value || consultaActualTemporal.fechaDetectada;

  // 2. CONSTRUCCIÓN DE LA URL COMPLETA Y VERDADERA DEL SERVICIO WMS solicitado
  var urlCompletaWMS = `${urlServidorWms}?service=WMS&version=1.1.0&request=GetMap&layers=${espacioTrabajoReal}:${consultaActualTemporal.servicio}&styles=${estiloAsignado}&format=image/png&transparent=true`;
  
  // Reemplazamos el valor parcial por la URL absoluta e idéntica que procesa el GeoServer
  consultaActualTemporal.servicio = urlCompletaWMS;

  // 3. Insertar el objeto en tu array de sesión tradicional
  historialConsultas.push(consultaActualTemporal);

  // =========================================================================
  // ENLACE CON AUTH0: Guardamos en caliente el historial actualizado en la nube
  // =========================================================================
  if (typeof sincronizarHistorialConAuth0 === "function") {
    sincronizarHistorialConAuth0(historialConsultas);
  }

  // 4. Limpieza de las referencias temporales y desactivación del botón
  capaPrevisualizacionTemporal = null;
  consultaActualTemporal = null;
  document.getElementById('btnGuardarConsulta').disabled = true;

  // 5. Renderizar la tabla con las columnas idénticas y actualizar la leyenda
  actualizarRenderTablaHistorial();
  actualizarLeyendaDinamica();
}


async function actualizarRenderTablaHistorial() {
  var tbody = document.getElementById('historialContenido');
  tbody.innerHTML = "";

  // =========================================================================
  // CONEXIÓN CRUCIAL DE ARRANQUE: Descarga el JSON de Auth0 e inyéctalo
  // =========================================================================
  if (typeof obtenerHistorialDeAuth0 === "function" && historialConsultas.length === 0) {
    try {
      var jsonDescargado = await obtenerHistorialDeAuth0();
      if (jsonDescargado && jsonDescargado.length > 0) {
        // Estampamos el JSON directamente sobre el array que recorre esta función
        historialConsultas = jsonDescargado;
      }
    } catch (e) {
      console.error("Error al inyectar el JSON de Auth0 en la tabla:", e);
    }
  }

  if (historialConsultas.length === 0) {
    tbody.innerHTML = `<tr id="historialVacio"><td colspan="6" class="text-center text-slate-400 py-6 italic text-xs">Ninguna consulta guardada en esta sesión.</td></tr>`;
    return;
  }

  historialConsultas.forEach((item, index) => {
    var fila = document.createElement('tr');
    fila.className = "hover:bg-slate-50 transition-colors border-b border-slate-100 text-slate-700 font-medium";
    fila.innerHTML = `
      <td class="p-2 text-center font-bold text-slate-400">${index + 1}</td>
      <td class="p-2 font-bold text-slate-800">${item.plan}</td>
      <td class="p-2 font-mono text-blue-600 font-semibold">${item.depth} m</td>
      <td class="p-2 text-slate-600 text-[11px] font-sans">${item.fechaDetectada.replace('T', ' ')}</td>
      <td class="p-2 text-yellow-600 font-mono text-[10px] truncate max-w-[180px]" title="${item.servicio}">${item.servicio}</td>
      <td class="p-2 text-center">
        <button onclick="removerConsultaHistorial(${index})" class="bg-red-50 hover:bg-red-100 text-red-600 rounded p-1.5 transition-colors">
          <i class="fa-solid fa-trash-can text-xs"></i>
        </button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

function removerConsultaHistorial(index) {
  var item = historialConsultas[index];
  if(item) { map.removeLayer(item.instanciaCapa); }
  historialConsultas.splice(index, 1);

  // =========================================================================
  // CONEXIÓN EN CALIENTE AL ELIMINAR: Actualiza Auth0 con el array recortado
  // =========================================================================
  if (typeof sincronizarHistorialConAuth0 === "function") {
    sincronizarHistorialConAuth0(historialConsultas);
  }

  actualizarRenderTablaHistorial();
  actualizarLeyendaDinamica();
}

// =========================================================================
// CONEXIÓN DE CARGA: Fuerza al mapa a descargar el JSON y meterlo a tu tabla
// =========================================================================
(async function conectorInyeccionForzada() {
  // Esperar un momento a que la sesión de Auth0 se valide físicamente
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  if (typeof obtenerHistorialDeAuth0 === "function") {
    try {
      var jsonDescargado = await obtenerHistorialDeAuth0();
      if (jsonDescargado && jsonDescargado.length > 0) {
        // Machacar el array global que lee tu renderizador nativo
        historialConsultas = jsonDescargado;
        // Forzar a tu función a pintar las filas
        actualizarRenderTablaHistorial();
        console.log("> Conexión exitosa: Datos inyectados en la tabla.");
      }
    } catch (e) {
      console.error("> Error al conectar el JSON con la tabla:", e);
    }
  }
})();



function actualizarLeyendaDinamica() {
  renderizarRampaLeyenda();
  var contenedorLeyenda = document.getElementById('leyendaContenedorDinamico');
  var geeBaseContainer = document.getElementById('geeBaseLayerContainer');
  var geeOverlayContainer = document.getElementById('geeOverlayLayersContainer');
  
  if(geeBaseContainer) {
    geeBaseContainer.innerHTML = `
      <i class="fa-solid fa-earth-americas text-blue-500 text-sm"></i>
      <span class="flex-1 font-semibold">${mapaBaseActualNombre}</span>
      <span class="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">Activo</span>
    `;
  }

  if (contenedorLeyenda) contenedorLeyenda.innerHTML = "";
  if (geeOverlayContainer) geeOverlayContainer.innerHTML = "";
  
  if (historialConsultas.length === 0 && !consultaActualTemporal) {
    if (contenedorLeyenda) contenedorLeyenda.innerHTML = `<span class="text-slate-400 italic">Ninguna capa cargada</span>`;
    if (geeOverlayContainer) geeOverlayContainer.innerHTML = `<span class="text-slate-400 italic text-[11px]">No hay capas en el historial.</span>`;
    return;
  }
  
  if(consultaActualTemporal) {
    if (contenedorLeyenda) {
      contenedorLeyenda.innerHTML += `
        <div class="flex items-center gap-2 mb-1">
          <span class="w-3 h-3 rounded bg-amber-500 shrink-0 animate-pulse"></span>
          <span class="text-[11px] font-medium text-amber-700">[Previsualizando] ${consultaActualTemporal.plan}</span>
        </div>
      `;
    }
    
    if (geeOverlayContainer) {
      geeOverlayContainer.innerHTML += `
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-center justify-between text-xs animate-pulse">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-wand-magic-sparkles text-amber-500"></i>
            <span class="font-bold text-amber-800">${consultaActualTemporal.plan} (${consultaActualTemporal.depth}m)</span>
          </div>
          <span class="text-[9px] uppercase font-black text-amber-600 tracking-wider">Previa</span>
        </div>
      `;
    }
  }
  
  historialConsultas.forEach((item, index) => {
    var estaActivaEnMapa = map.hasLayer(item.instanciaCapa);
    
    if (contenedorLeyenda) {
      contenedorLeyenda.innerHTML += `
        <div class="flex items-center gap-2 opacity-${estaActivaEnMapa ? '100' : '40'} transition-opacity">
          <span class="w-3 h-3 rounded shrink-0 border border-slate-200" style="background-color: ${obtenerColorPorProfundidad(item.depth)};"></span>
          <span>${item.plan} (${item.depth} m)</span>
        </div>
      `;
    }
    
    if (geeOverlayContainer) {
      var itemCapaGEE = document.createElement('div');
      itemCapaGEE.className = "bg-white border border-slate-200 rounded-lg p-2 flex items-center justify-between shadow-sm hover:border-slate-300 transition-all";
      itemCapaGEE.innerHTML = `
        <div class="flex items-center gap-2.5 flex-1 min-w-0">
          <input type="checkbox" id="chk-gee-${index}" ${estaActivaEnMapa ? 'checked' : ''} 
                 onchange="alternarVisibilidadCapaHistorial(${index})" 
                 class="w-4 h-4 text-blue-600 bg-gray-100 border-slate-300 rounded focus:ring-blue-500 cursor-pointer">
          <div class="flex flex-col min-w-0">
            <span class="font-bold text-slate-800 text-xs truncate">${item.plan} - Depth ${item.depth}m</span>
            <span class="text-[9px] font-mono text-slate-400 truncate">${item.servicio.split(':')[1]}</span>
          </div>
        </div>
        <button onclick="removerConsultaHistorial(${index})" class="text-slate-400 hover:text-red-500 p-1 transition-colors ml-1" title="Eliminar de la sesión">
          <i class="fa-solid fa-trash-can text-[11px]"></i>
        </button>
      `;
      geeOverlayContainer.appendChild(itemCapaGEE);
    }
  });
}

function alternarVisibilidadCapaHistorial(index) {
  var item = historialConsultas[index];
  if(!item) return;
  
  if (map.hasLayer(item.instanciaCapa)) {
    map.removeLayer(item.instanciaCapa);
  } else {
    item.instanciaCapa.addTo(map);
  }
  actualizarLeyendaDinamica();
}

map.on('layeradd layerremove', function(e) {
  if(e.layer && e.layer.options && e.layer.options.layers) {
     actualizarLeyendaDinamica();
  }
});

function desactivarModosMapa() {
  map.dragging.enable();
  map.off('mousedown click mousemove mouseup dblclick');
  if (dibujandoObjeto) { map.removeLayer(dibujandoObjeto); dibujandoObjeto = null; }
  if (tooltipMedicion) { map.removeLayer(tooltipMedicion); tooltipMedicion = null; }
  var botones = ['select', 'point', 'polyline', 'polygon', 'rectangle', 'circle', 'lasso', 'measure'];
  botones.forEach(b => { var btn = document.getElementById(`btn-draw-${b}`); if(btn) btn.classList.remove('arcgis-btn-active'); });
  document.getElementById('statusDibujo').innerText = "Ninguna herramienta activa";
  herramientaActiva = null;
}

function activarHerramientaDibujo(tipo) {
  if (herramientaActiva === tipo) { desactivarModosMapa(); return; }
  desactivarModosMapa();
  herramientaActiva = tipo;
  var btnEl = document.getElementById(`btn-draw-${tipo}`);
  if(btnEl) btnEl.classList.add('arcgis-btn-active');
  document.getElementById('statusDibujo').innerText = `Modo: ${tipo.toUpperCase()} activo`;

  if (tipo === 'point') {
    map.on('click', function(e) { L.marker(e.latlng).addTo(capasDibujo); desactivarModosMapa(); });
  } else if (tipo === 'circle') {
    map.on('mousedown', function(e) {
      map.dragging.disable(); var centro = e.latlng;
      dibujandoObjeto = L.circle(centro, {radius: 1, color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.3}).addTo(map);
      map.on('mousemove', function(ev) { dibujandoObjeto.setRadius(centro.distanceTo(ev.latlng)); });
      map.on('mouseup', function() { dibujandoObjeto.addTo(capasDibujo); dibujandoObjeto = null; desactivarModosMapa(); });
    });
  } else if (tipo === 'rectangle') {
    map.on('mousedown', function(e) {
      map.dragging.disable(); var p1 = e.latlng;
      dibujandoObjeto = L.rectangle([p1, p1], {color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.3}).addTo(map);
      map.on('mousemove', function(ev) { dibujandoObjeto.setBounds([p1, ev.latlng]); });
      map.on('mouseup', function() { dibujandoObjeto.addTo(capasDibujo); dibujandoObjeto = null; desactivarModosMapa(); });
    });
  } else if (tipo === 'measure') {
    puntosMedicion = [];
    dibujandoObjeto = L.polyline([], {color: '#ef4444', weight: 4, dashArray: '6, 6'}).addTo(map);
    tooltipMedicion = L.tooltip({permanent: true, className: 'medicion-tooltip', direction: 'top'});
    map.on('click', function(e) {
      puntosMedicion.push(e.latlng); dibujandoObjeto.setLatLngs(puntosMedicion);
      var dist = calcularDistanciaRuta(puntosMedicion);
      tooltipMedicion.setLatLng(e.latlng).setContent(`${dist > 1000 ? (dist/1000).toFixed(2)+' km' : dist.toFixed(0)+' m'}`).addTo(map);
    });
    map.on('mousemove', function(e) {
      if(puntosMedicion.length > 0) {
        var temp = [...puntosMedicion, e.latlng]; dibujandoObjeto.setLatLngs(temp);
        var dist = calcularDistanciaRuta(temp);
        tooltipMedicion.setLatLng(e.latlng).setContent(`Distancia: ${dist > 1000 ? (dist/1000).toFixed(2)+' km' : dist.toFixed(0)+' m'}`);
      }
    });
    map.on('dblclick', function() {
      var distFinal = calcularDistanciaRuta(puntosMedicion);
      L.polyline(puntosMedicion, {color: '#b91c1c', weight: 3}).bindPopup(`<b>Afectacion critica:</b> ${distFinal > 1000 ? (distFinal/1000).toFixed(2)+' km' : distFinal.toFixed(1)+' m'}`).addTo(capasDibujo);
      desactivarModosMapa();
    });
  }
}
function calcularDistanciaRuta(puntos) { var dist = 0; for (var i = 0; i < puntos.length - 1; i++) { dist += puntos[i].distanceTo(puntos[i+1]); } return dist; }
function limpiarDibujos() { capasDibujo.clearLayers(); desactivarModosMapa(); }




var debounceTimer;
function buscarSugerencias() {
  clearTimeout(debounceTimer); var query = document.getElementById('searchInput').value.trim();
  var contenedorListado = document.getElementById('searchSuggestions');
  if (query.length < 3) { contenedorListado.innerHTML = ""; contenedorListado.classList.add('hidden'); return; }
  debounceTimer = setTimeout(async () => {
    try {
      var response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`);
      var data = await response.json(); contenedorListado.innerHTML = "";
      if (data && data.length > 0) {
        contenedorListado.classList.remove('hidden');
        data.forEach(lugar => {
          var item = document.createElement('div'); item.className = "suggestion-item"; item.innerText = lugar.display_name;
          item.onclick = function() {
            document.getElementById('searchInput').value = lugar.display_name;
            map.setView([parseFloat(lugar.lat), parseFloat(lugar.lon)], 15);
            contenedorListado.innerHTML = ""; contenedorListado.classList.add('hidden');
          };
          contenedorListado.appendChild(item);
        });
      }
    } catch (e) { console.error(e); }
  }, 400);
}
async function ejecutarBusquedaDirecta() {
  var query = document.getElementById('searchInput').value.trim(); if (!query) return;
  try {
    var response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`);
    var data = await response.json();
    if (data && data.length > 0) { map.setView([parseFloat(data[0].lat), parseFloat(data[0].lon)], 15); }
  } catch (e) { console.error(e); }
}
function toggleLeyenda() { document.getElementById('panelLeyenda').classList.toggle('hidden'); }

function volverAlHome() { map.setView([-11.018, -68.752], 14); }

function obtenerUbicacionActual() {
  map.locate({setView: true, maxZoom: 15});
}


// =========================================================================
// FUNCIÓN PARA DESCARGAR EL ARCHIVO CSV COMPLETO DEL TR SELECCIONADO AL PC
// =========================================================================
function descargarDatosCSVActual() {
  var planSeleccionado = document.getElementById('planSelect').value;
  
  // Verificamos que existan datos cargados en caché para este escenario
  if (!planSeleccionado || !cacheDatosCSV[planSeleccionado]) {
    alert("No hay datos disponibles en memoria para descargar en este momento.");
    return;
  }

  var datosOriginales = cacheDatosCSV[planSeleccionado];
  
  // Construimos la cabecera estándar de tus archivos
  var contenidoCSV = "Step,Date/Time,Depth\n";
  
  // Reconstruimos fila por fila en formato de texto CSV
  datosOriginales.forEach(function(fila) {
    contenidoCSV += `${fila.step},"${fila.date}",${fila.depth}\n`;
  });

  // Generamos el objeto binario de tipo texto/csv
  var blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
  var linkDescarga = document.createElement("a");
  
  // Generamos una URL temporal para forzar la descarga en el navegador con un nombre limpio
  linkDescarga.href = URL.createObjectURL(blob);
  linkDescarga.setAttribute("download", `Datos_Originales_${planSeleccionado.toUpperCase()}.csv`);
  
  // Inyectamos el nodo de forma invisible, hacemos clic y lo eliminamos
  document.body.appendChild(linkDescarga);
  linkDescarga.click();
  document.body.removeChild(linkDescarga);
}


// =========================================================================
// FUNCIÓN IMPORTADORA: FUERZA LA INYECCIÓN DIRECTA EN EL ARRAY
// =========================================================================
async function cargarHistorialPersistente() {
  if (typeof obtenerHistorialDeAuth0 === "function") {
    console.log("> Solicitando importación de datos a Auth0...");
    var historialGuardado = await obtenerHistorialDeAuth0();
    
    if (historialGuardado && historialGuardado.length > 0) {
      // Reasignación directa del array global con los datos de la nube
      historialConsultas = historialGuardado;
      
      // Forzar el pintado en la tabla inmediatamente
      actualizarRenderTablaHistorial();
      console.log("> Tabla renderizada con los datos importados.");
    } else {
      console.log("> No se encontraron consultas previas en Auth0 para este usuario.");
    }
  } else {
    console.warn("> La función obtenerHistorialDeAuth0 no está disponible aún.");
  }
}