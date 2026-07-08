var rampaColoresInundacion = [
  { limite: 0,  color: "#ffffff", etiqueta: "0 metros" },
  { limite: 2,  color: "#a6bddb", etiqueta: "2 metros" },
  { limite: 6,  color: "#3690c0", etiqueta: "6 metros" },
  { limite: 12, color: "#023858", etiqueta: "12 metros" },
  { limite: 17, color: "#4a1486", etiqueta: "17 metros" }
];

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

var urlServidorWms = "http://acre.senamhi.gob.bo/geoserver/rio_acre_manchas/wms";
var espacioTrabajoReal = "rio_acre_manchas";
var estiloAsignado = "estilo_inundacion";

var capaPrevisualizacionTemporal = null; 
var consultaActualTemporal = null;       
var historialConsultas = [];  

var capasDibujo = L.featureGroup().addTo(map);
var herramientaActiva = null;
var dibujandoObjeto = null;
var puntosMedicion = [];
var tooltipMedicion = null;
var puntosRuta = []; 
var estaDibujandoLasso = false;

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
  desactivarModosMapa(); 
  herramientaActiva = tipo;
  
  var btnActivo = document.getElementById(`btn-draw-${tipo}`);
  if(btnActivo) btnActivo.classList.add('bg-blue-100', 'text-blue-700', 'border-blue-200');

  var statusMap = {
    'point': 'Haga clic para situar un PUNTO',
    'polyline': 'Clics sucesivos para POLILÍNEA. Doble clic para terminar',
    'lasso': 'Mantenga presionado el clic y arrastre (MANO ALZADA)',
    'circle': 'Clic sostenido y arrastre para CÍRCULO',
    'rectangle': 'Clic sostenido y arrastre para RECTÁNGULO',
    'measure': 'Clics sucesivos para MEDIR. Doble clic para terminar'
  };
  document.getElementById('statusDibujo').innerText = `Modo: ${statusMap[tipo]}`;

  if (tipo === 'point') {
    map.on('click', function(e) { L.marker(e.latlng).addTo(capasDibujo); desactivarModosMapa(); });
  } 
  else if (tipo === 'polyline') {
    puntosRuta = [];
    dibujandoObjeto = L.polyline([], {color: '#2563eb', weight: 3}).addTo(map);
    
    map.on('click', function(e) {
      puntosRuta.push(e.latlng);
      dibujandoObjeto.setLatLngs(puntosRuta);
    });
    map.on('mousemove', function(e) {
      if(puntosRuta.length > 0) {
        var temp = [...puntosRuta, e.latlng];
        dibujandoObjeto.setLatLngs(temp);
      }
    });
    map.on('dblclick', function() {
      dibujandoObjeto.addTo(capasDibujo);
      dibujandoObjeto = null;
      puntosRuta = [];
      desactivarModosMapa();
    });
  }
  else if (tipo === 'lasso') {
    puntosRuta = [];
    map.on('mousedown', function(e) {
      estaDibujandoLasso = true;
      map.dragging.disable(); 
      puntosRuta = [e.latlng];
      dibujandoObjeto = L.polyline(puntosRuta, {color: '#9333ea', weight: 3, lineCap: 'round'}).addTo(map);
    });
    map.on('mousemove', function(e) {
      if(estaDibujandoLasso && dibujandoObjeto) {
        puntosRuta.push(e.latlng);
        dibujandoObjeto.setLatLngs(puntosRuta);
      }
    });
    map.on('mouseup', function() {
      if(estaDibujandoLasso && dibujandoObjeto) {
        if(puntosRuta.length > 2) {
          dibujandoObjeto.addTo(capasDibujo);
        } else {
          map.removeLayer(dibujandoObjeto);
        }
        dibujandoObjeto = null;
        puntosRuta = [];
        estaDibujandoLasso = false;
        desactivarModosMapa();
      }
    });
  }
  else if (tipo === 'circle') {
    map.on('mousedown', function(e) {
      map.dragging.disable(); var centro = e.latlng;
      dibujandoObjeto = L.circle(centro, {radius: 1, color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.3}).addTo(map);
      map.on('mousemove', function(ev) { dibujandoObjeto.setRadius(centro.distanceTo(ev.latlng)); });
      map.on('mouseup', function() { dibujandoObjeto.addTo(capasDibujo); dibujandoObjeto = null; desactivarModosMapa(); });
    });
  } 
  else if (tipo === 'rectangle') {
    map.on('mousedown', function(e) {
      map.dragging.disable(); var p1 = e.latlng;
      dibujandoObjeto = L.rectangle([p1, p1], {color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.3}).addTo(map);
      map.on('mousemove', function(ev) { dibujandoObjeto.setBounds([p1, ev.latlng]); });
      map.on('mouseup', function() { dibujandoObjeto.addTo(capasDibujo); dibujandoObjeto = null; desactivarModosMapa(); });
    });
  } 
  else if (tipo === 'measure') {
    puntosRuta = [];
    dibujandoObjeto = L.polyline([], {color: '#ef4444', weight: 4, dashArray: '6, 6'}).addTo(map);
    tooltipMedicion = L.tooltip({permanent: true, className: 'bg-white text-red-600 p-1 rounded font-bold text-xs border border-red-200 shadow', direction: 'top'});
    
    map.on('click', function(e) {
      puntosRuta.push(e.latlng); dibujandoObjeto.setLatLngs(puntosRuta);
      var dist = calcularDistanciaRuta(puntosRuta);
      tooltipMedicion.setLatLng(e.latlng).setContent(`${dist > 1000 ? (dist/1000).toFixed(2)+' km' : dist.toFixed(0)+' m'}`).addTo(map);
    });
    map.on('mousemove', function(e) {
      if(puntosRuta.length > 0) {
        var temp = [...puntosRuta, e.latlng]; dibujandoObjeto.setLatLngs(temp);
        var dist = calcularDistanciaRuta(temp);
        tooltipMedicion.setLatLng(e.latlng).setContent(`Midiendo: ${dist > 1000 ? (dist/1000).toFixed(2)+' km' : dist.toFixed(0)+' m'}`);
      }
    });
    map.on('dblclick', function() {
      var distFinal = calcularDistanciaRuta(puntosRuta);
      L.polyline(puntosRuta, {color: '#b91c1c', weight: 3}).bindPopup(`<b>Distancia Total:</b> ${distFinal > 1000 ? (distFinal/1000).toFixed(2)+' km' : distFinal.toFixed(1)+' m'}`).addTo(capasDibujo);
      map.removeLayer(tooltipMedicion);
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
