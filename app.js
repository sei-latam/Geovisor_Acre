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

var urlServidorWms = "https://geoserver.coast-wind.org/geoserver/wms";
var espacioTrabajoReal = "coast_wind_data";
var estiloAsignado = "estilo_manchas_inundacion";

var capaPrevisualizacionTemporal = null; 
var consultaActualTemporal = null;       
var historialConsultas = [];  

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

var dbExcelPlanes = {
  p01: { min: 177.0735, max: 186.5382, length: 95 },
  p02: { min: 177.9383, max: 186.7893, length: 325 },
  p03: { min: 177.1497, max: 188.7584, length: 95 },
  p04: { min: 178.0590, max: 190.3933, length: 95 },
  p05: { min: 178.0618, max: 191.0609, length: 95 }
};

function generarCurvaExcel(planID) {
  var meta = dbExcelPlanes[planID]; var puntos = [];
  for (var i = 1; i <= meta.length; i++) {
    var t = i / meta.length;
    var variacion = (meta.max - meta.min) * Math.pow(Math.sin(t * Math.PI * 0.95), 2.2);
    var wselCalculado = meta.min + variacion + (Math.sin(i * 0.5) * 0.08);
    var totalMinutos = (i - 1) * 15; var hora = Math.floor(totalMinutos / 60); var min = totalMinutos % 60;
    puntos.push({ step: i, wsel: parseFloat(Math.min(meta.max, Math.max(meta.min, wselCalculado)).toFixed(4)), date: `19APR ${String(hora).padStart(2, '0')}:${String(min).padStart(2, '0')}:00` });
  }
  return puntos;
}

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

function validarIngresoWSEL() {
  var wselVal = document.getElementById('wselInput').value.trim();
  var selectorPlanes = document.getElementById('planSelect');
  if (wselVal !== "" && !isNaN(parseFloat(wselVal))) {
    selectorPlanes.disabled = false; selectorPlanes.options[0].text = "-- Seleccione el Plan --";
  } else {
    selectorPlanes.disabled = true; selectorPlanes.value = ""; selectorPlanes.options[0].text = "-- Ingrese WSEL primero --";
    if(capaPrevisualizacionTemporal) { map.removeLayer(capaPrevisualizacionTemporal); capaPrevisualizacionTemporal = null; }
    document.getElementById('btnGuardarConsulta').disabled = true;
  }
}

function procesarConsultaAutomatica() {
  var wselValor = parseFloat(document.getElementById('wselInput').value);
  var planSeleccionado = document.getElementById('planSelect').value;
  var meta = dbExcelPlanes[planSeleccionado];

  if (wselValor < meta.min || wselValor > meta.max) {
    alert(`Limites Excedidos: ${wselValor}m fuera de [${meta.min.toFixed(2)}m - ${meta.max.toFixed(2)}m].`);
    document.getElementById('planSelect').value = ""; return;
  }

  document.getElementById('badgeEstado').className = "text-[9px] font-bold bg-green-500 text-white px-2 py-1 rounded uppercase tracking-wider animate-pulse";
  document.getElementById('badgeEstado').innerText = "Procesado";

  var datosPlanActual = generarCurvaExcel(planSeleccionado);
  var puntoMasCercano = datosPlanActual.reduce((prev, curr) => Math.abs(curr.wsel - wselValor) < Math.abs(prev.wsel - wselValor) ? curr : prev);

  document.getElementById('fechaDetectadaInput').value = puntoMasCercano.date;
  miChart.data.labels = datosPlanActual.map(p => `Paso ${p.step}`);
  miChart.data.datasets[0].data = datosPlanActual.map(p => p.wsel);
  miChart.data.datasets[0].pointRadius = datosPlanActual.map(p => p.step === puntoMasCercano.step ? 6 : 0);
  miChart.data.datasets[0].pointBackgroundColor = datosPlanActual.map(p => p.step === puntoMasCercano.step ? '#ef4444' : '#2563eb');
  miChart.update();

  var numeroPasoFormateado = String(puntoMasCercano.step).padStart(2, '0');
  var partesFecha = puntoMasCercano.date.split(" "); 
  var cadenaFechaFinal = `${partesFecha[0]}2026_${partesFecha[1].replace(/:/g, "_")}`;
  var nombreCapaGeoTIFF = `WSE_${numeroPasoFormateado}_${cadenaFechaFinal}_${planSeleccionado}`;

  if (capaPrevisualizacionTemporal) { map.removeLayer(capaPrevisualizacionTemporal); }

  capaPrevisualizacionTemporal = L.tileLayer.wms(urlServidorWms, {
    layers: `${espacioTrabajoReal}:${nombreCapaGeoTIFF}`,
    format: 'image/png', transparent: true, version: '1.1.1', styles: `${espacioTrabajoReal}:${estiloAsignado}`
  }).addTo(map);

  document.getElementById('logConsole').innerHTML = `<span class="text-green-400">> Previsualizando:</span> <span class="text-white">${nombreCapaGeoTIFF}</span>`;

  consultaActualTemporal = {
    plan: planSeleccionado.toUpperCase(),
    wsel: wselValor.toFixed(2),
    labelCapa: `${planSeleccionado.toUpperCase()} (WSEL: ${wselValor.toFixed(4)}m)`,
    servicio: `${espacioTrabajoReal}:${nombreCapaGeoTIFF}`,
    instanciaCapa: capaPrevisualizacionTemporal,
    fechaDetectada: puntoMasCercano.date
  };
  
  document.getElementById('btnGuardarConsulta').disabled = false;
  actualizarLeyendaDinamica();
}

function guardarConsultaEnHistorial() {
  if (!consultaActualTemporal) return;
  
  consultaActualTemporal.fechaDetectada = document.getElementById('fechaDetectadaInput').value || consultaActualTemporal.fechaDetectada;
  
  historialConsultas.push(consultaActualTemporal);
  
  capaPrevisualizacionTemporal = null;
  consultaActualTemporal = null;
  document.getElementById('btnGuardarConsulta').disabled = true;
  
  actualizarRenderTablaHistorial();
  actualizarLeyendaDinamica();
}

function actualizarRenderTablaHistorial() {
  var tbody = document.getElementById('historialContenido');
  tbody.innerHTML = "";

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
      <td class="p-2 font-mono text-blue-600 font-semibold">${item.wsel} m</td>
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
  if(item) {
    map.removeLayer(item.instanciaCapa);
  }
  historialConsultas.splice(index, 1);
  actualizarRenderTablaHistorial();
  actualizarLeyendaDinamica();
}

function actualizarLeyendaDinamica() {
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

  contenedorLeyenda.innerHTML = "";
  geeOverlayContainer.innerHTML = "";
  
  if (historialConsultas.length === 0 && !consultaActualTemporal) {
    contenedorLeyenda.innerHTML = `<span class="text-slate-400 italic">Ningún modelo cargado</span>`;
    geeOverlayContainer.innerHTML = `<span class="text-slate-400 italic text-[11px]">No hay capas en el historial.</span>`;
    return;
  }
  
  if(consultaActualTemporal) {
    contenedorLeyenda.innerHTML += `
      <div class="flex items-center gap-2 mb-1">
        <span class="w-3 h-3 rounded bg-amber-500 shrink-0 animate-pulse"></span>
        <span class="text-[11px] font-medium text-amber-700">[Previsualizando] ${consultaActualTemporal.plan}</span>
      </div>
    `;
    
    geeOverlayContainer.innerHTML += `
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-center justify-between text-xs animate-pulse">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-wand-magic-sparkles text-amber-500"></i>
          <span class="font-bold text-amber-800">${consultaActualTemporal.plan} (${consultaActualTemporal.wsel}m)</span>
        </div>
        <span class="text-[9px] uppercase font-black text-amber-600 tracking-wider">Previa</span>
      </div>
    `;
  }
  
  historialConsultas.forEach((item, index) => {
    var estaActivaEnMapa = map.hasLayer(item.instanciaCapa);
    
    contenedorLeyenda.innerHTML += `
      <div class="flex items-center gap-2 opacity-${estaActivaEnMapa ? '100' : '40'} transition-opacity">
        <span class="w-3 h-3 rounded bg-blue-600 shrink-0"></span>
        <span>${item.plan} (${item.wsel} m)</span>
      </div>
    `;
    
    var itemCapaGEE = document.createElement('div');
    itemCapaGEE.className = "bg-white border border-slate-200 rounded-lg p-2 flex items-center justify-between shadow-sm hover:border-slate-300 transition-all";
    itemCapaGEE.innerHTML = `
      <div class="flex items-center gap-2.5 flex-1 min-w-0">
        <input type="checkbox" id="chk-gee-${index}" ${estaActivaEnMapa ? 'checked' : ''} 
               onchange="alternarVisibilidadCapaHistorial(${index})" 
               class="w-4 h-4 text-blue-600 bg-gray-100 border-slate-300 rounded focus:ring-blue-500 cursor-pointer">
        <div class="flex flex-col min-w-0">
          <span class="font-bold text-slate-800 text-xs truncate">${item.plan} - WSEL ${item.wsel}m</span>
          <span class="text-[9px] font-mono text-slate-400 truncate">${item.servicio.split(':')[1]}</span>
        </div>
      </div>
      <button onclick="removerConsultaHistorial(${index})" class="text-slate-400 hover:text-red-500 p-1 transition-colors ml-1" title="Eliminar de la sesión">
        <i class="fa-solid fa-trash-can text-[11px]"></i>
      </button>
    `;
    geeOverlayContainer.appendChild(itemCapaGEE);
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
  document.getElementById(`btn-draw-${tipo}`).classList.add('arcgis-btn-active');
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
function volverAlHome() { map.setView([-11.018, -68.752], 13); }

// Inicialización del panel de capas al arranque
actualizarLeyendaDinamica();