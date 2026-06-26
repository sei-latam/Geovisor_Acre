// =========================================================================
// 1. INICIALIZAR MAPA (Tus propiedades y variables exactas)
// =========================================================================
var map = L.map('map', { zoomControl: false }).setView([-11.018, -68.752], 13);
L.control.zoom({ position: 'bottomright' }).addTo(map);
var esriSatellital = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(map);
var baseLayers = { "Satélite Esri": esriSatellital, "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png') };
var layersControl = L.control.layers(baseLayers, {}, { collapsed: false, position: 'topright' }).addTo(map);

// Rutas de conexión originales fijas de GeoServer
var urlServidorWms = "https://geoserver.coast-wind.org/geoserver/wms";
var espacioTrabajoReal = "coast_wind_data";
var estiloAsignado = "estilo_manchas_inundacion";
var capasActivas = {};

// Controladores del historial
var contadorHistorial = 0;
var consultaActivaActual = null;

// Poner la fecha y hora de la máquina por defecto (sin restricción alguna)
document.getElementById('fechaDetectadaInput').value = new Date().toISOString().substring(0, 16);

// =========================================================================
// 2. METADATA REAL DE LOS EXCEL
// =========================================================================
var dbExcelPlanes = {
  p01: { min: 177.0735, max: 186.5382, length: 95 },
  p02: { min: 177.9383, max: 186.7893, length: 325 },
  p03: { min: 177.1497, max: 188.7584, length: 95 },
  p04: { min: 178.0590, max: 190.3933, length: 95 },
  p05: { min: 178.0618, max: 191.0609, length: 95 }
};

// Generador matemático original
function generarCurvaExcel(planID) {
  var meta = dbExcelPlanes[planID];
  var puntos = [];
  for (var i = 1; i <= meta.length; i++) {
    var t = i / meta.length;
    var variacion = (meta.max - meta.min) * Math.pow(Math.sin(t * Math.PI * 0.95), 2.2);
    var ruidoFisico = Math.sin(i * 0.5) * 0.08;
    var wselCalculado = meta.min + variacion + ruidoFisico;
    
    if (wselCalculado > meta.max) wselCalculado = meta.max;
    if (wselCalculado < meta.min) wselCalculado = meta.min;

    var totalMinutos = (i - 1) * 15;
    var hora = Math.floor(totalMinutos / 60);
    var min = totalMinutos % 60;
    
    var horaStr = String(hora).padStart(2, '0');
    var minStr = String(min).padStart(2, '0');
    var stringFecha = `19APR ${horaStr}:${minStr}:00`;

    puntos.push({ step: i, wsel: parseFloat(wselCalculado.toFixed(4)), date: stringFecha });
  }
  return puntos;
}

// =========================================================================
// 3. INICIALIZAR GRÁFICO (CHART.JS)
// =========================================================================
var miChart;
function inicializarChartVacio() {
  var ctx = document.getElementById('chartJsCanvas').getContext('2d');
  miChart = new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Serie Temporal WSEL', data: [], borderColor: '#2563eb', borderWidth: 2, fill: true, backgroundColor: 'rgba(219, 234, 254, 0.4)', pointRadius: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, scales: { x: { display: false }, y: { grid: { color: '#f1f5f9' } } } }
  });
}
inicializarChartVacio();

// =========================================================================
// 4. CONTROLADORES DEL FLUJO INTERACTIVO 
// =========================================================================

function validarIngresoWSEL() {
  var wselVal = document.getElementById('wselInput').value.trim();
  var selectorPlanes = document.getElementById('planSelect');

  if (wselVal !== "" && !isNaN(parseFloat(wselVal))) {
    selectorPlanes.disabled = false;
    selectorPlanes.options[0].text = "-- Seleccione el Plan --";
  } else {
    selectorPlanes.disabled = true;
    selectorPlanes.value = "";
    selectorPlanes.options[0].text = "-- Ingrese WSEL primero --";
    resetearEstadoSimulacion();
  }
}

// Función que se ejecuta de forma independiente cuando el usuario cambia la fecha manual (no altera el flujo WMS)
function actualizarFechaManual() {
  if (consultaActivaActual) {
    // Si ya hay una consulta activa, actualizamos la fecha del registro en memoria para el guardado
    var nuevaFecha = document.getElementById('fechaDetectadaInput').value;
    consultaActivaActual.fechaUsuario = nuevaFecha.replace("T", " ");
  }
}

function procesarConsultaAutomatica() {
  var wselValor = parseFloat(document.getElementById('wselInput').value);
  var planSeleccionado = document.getElementById('planSelect').value;
  var meta = dbExcelPlanes[planSeleccionado];

  if (wselValor < meta.min || wselValor > meta.max) {
    alert(`Error de límites: El valor ${wselValor}m excede los registros históricos del plan seleccionado [${meta.min.toFixed(2)}m - ${meta.max.toFixed(2)}m].`);
    document.getElementById('planSelect').value = "";
    resetearEstadoSimulacion();
    return;
  }

  var badge = document.getElementById('badgeEstado');
  badge.className = "text-[9px] font-bold bg-green-500 text-white px-2 py-1 rounded uppercase tracking-wider animate-pulse";
  badge.innerText = "Procesado";

  var datosPlanActual = generarCurvaExcel(planSeleccionado);
  
  // Buscar el paso más cercano
  var puntoMasCercano = datosPlanActual.reduce((prev, curr) => 
    Math.abs(curr.wsel - wselValor) < Math.abs(prev.wsel - wselValor) ? curr : prev
  );

  renderizarGraficoYMapa(datosPlanActual, puntoMasCercano, planSeleccionado);
}

// PROCESADOR DE RÁSTERS WMS (Aislado de la fecha del componente HTML)
function renderizarGraficoYMapa(datosPlanActual, puntoMasCercano, planSeleccionado) {
  miChart.data.labels = datosPlanActual.map(p => `Paso ${p.step}`);
  miChart.data.datasets[0].data = datosPlanActual.map(p => p.wsel);
  miChart.data.datasets[0].pointRadius = datosPlanActual.map(p => p.step === puntoMasCercano.step ? 6 : 0);
  miChart.data.datasets[0].pointBackgroundColor = datosPlanActual.map(p => p.step === puntoMasCercano.step ? '#ef4444' : '#2563eb');
  miChart.update();

  // --- TU ALGORITMO ORIGINAL DE TRADUCCIÓN FIJA A GEOSERVER ---
  var numeroPasoFormateado = String(puntoMasCercano.step).padStart(2, '0');
  
  var partesFecha = puntoMasCercano.date.split(" "); 
  var diaMes = partesFecha[0];      // Siempre "19APR"
  var horaMinSeg = partesFecha[1];  // Siempre "HH:MM:00" del paso correspondiente
  
  var horaLimpia = horaMinSeg.replace(/:/g, "_");
  var cadenaFechaFinal = `${diaMes}2026_${horaLimpia}`; // Reconstrucción fija para el ráster del servidor
  
  var nombreCapaGeoTIFF = `WSE_${numeroPasoFormateado}_${cadenaFechaFinal}_${planSeleccionado}`;
  var labelCapaFinal = `${planSeleccionado.toUpperCase()} (WSEL aproximado: ${puntoMasCercano.wsel}m)`;

  // Capturar la fecha actual que el usuario tiene ingresada en su widget (cualquiera que sea)
  var fechaDelPicker = document.getElementById('fechaDetectadaInput').value || "Sin fecha";

  // Almacenar el estado de la consulta actual para el historial
  consultaActivaActual = {
    plan: planSeleccionado,
    wsel: puntoMasCercano.wsel,
    fechaUsuario: fechaDelPicker.replace("T", " "),
    layerFullWMS: `${espacioTrabajoReal}:${nombreCapaGeoTIFF}`
  };
  document.getElementById('btnGuardar').disabled = false;

  // Actualizar Leaflet
  if (capasActivas[planSeleccionado]) {
    map.removeLayer(capasActivas[planSeleccionado]);
    layersControl.removeLayer(capasActivas[planSeleccionado]);
  }

  var nuevaCapaWMS = L.tileLayer.wms(urlServidorWms, {
    layers: `${espacioTrabajoReal}:${nombreCapaGeoTIFF}`,
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    styles: `${espacioTrabajoReal}:${estiloAsignado}`
  }).addTo(map);

  capasActivas[planSeleccionado] = nuevaCapaWMS;
  layersControl.addOverlay(nuevaCapaWMS, labelCapaFinal);
}

// =========================================================================
// 5. GESTIÓN DE LA TABLA DINÁMICA DEL HISTORIAL
// =========================================================================
function guardarConsultaEnHistorial() {
  if (!consultaActivaActual) return;

  var vacioRow = document.getElementById('historialVacio');
  if (vacioRow) vacioRow.remove();

  contadorHistorial++;
  var tbody = document.getElementById('historialContenido');
  
  var fila = document.createElement('tr');
  fila.id = `historial-row-${contadorHistorial}`;
  fila.className = "hover:bg-slate-800/40 border-b border-slate-800/30 transition-colors";
  
  var pPlan = consultaActivaActual.plan;
  var pWsel = consultaActivaActual.wsel;
  var pFecha = consultaActivaActual.fechaUsuario;
  var pWMS = consultaActivaActual.layerFullWMS;

  fila.innerHTML = `
    <td class="py-2 text-slate-500 font-sans">${contadorHistorial}</td>
    <td class="py-2 font-bold text-blue-400">${pPlan.toUpperCase()}</td>
    <td class="py-2 text-emerald-400 font-bold">${pWsel.toFixed(4)} m</td>
    <td class="py-2 text-slate-400 text-[10px]">${pFecha}</td>
    <td class="py-2 text-yellow-400 font-bold font-mono text-[9px] select-all" title="Click para seleccionar todo">${pWMS}</td>
    <td class="py-2 text-center font-sans">
      <button onclick="recargarConsultaHistorial('${pPlan}', ${pWsel}, '${pFecha}')" class="bg-blue-600 hover:bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded mr-1 transition-colors">👁️ Ver</button>
      <button onclick="eliminarFilaHistorial('${fila.id}')" class="bg-red-950 hover:bg-red-800 text-red-300 text-[9px] px-1.5 py-0.5 rounded transition-colors">🗑️</button>
    </td>
  `;
  tbody.appendChild(fila);
}

function eliminarFilaHistorial(idFila) {
  document.getElementById(idFila).remove();
  var tbody = document.getElementById('historialContenido');
  if (tbody.children.length === 0) {
    tbody.innerHTML = `
      <tr id="historialVacio">
        <td colspan="6" class="text-center text-slate-600 py-4 font-sans italic text-xs">Ninguna consulta guardada en esta sesión.</td>
      </tr>
    `;
    contadorHistorial = 0;
  }
}

function recargarConsultaHistorial(plan, wsel, fechaStr) {
  document.getElementById('fechaDetectadaInput').value = fechaStr.replace(" ", "T");
  document.getElementById('wselInput').value = wsel;
  document.getElementById('planSelect').value = plan;
  validarIngresoWSEL();
  procesarConsultaAutomatica();
}

function resetearEstadoSimulacion() {
  var badge = document.getElementById('badgeEstado');
  badge.className = "text-[9px] font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded uppercase tracking-wider";
  badge.innerText = "Inactivo";
  
  miChart.data.labels = [];
  miChart.data.datasets[0].data = [];
  miChart.update();
  
  for (var plan in capasActivas) {
     if (capasActivas[plan]) {
        map.removeLayer(capasActivas[plan]);
        layersControl.removeLayer(capasActivas[plan]);
     }
  }
  capasActivas = {};
  consultaActivaActual = null;
  document.getElementById('btnGuardar').disabled = true;
}