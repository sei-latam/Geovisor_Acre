// ==========================================
// 1. CONFIGURACIÓN DEL MAPA Y TODOS LOS BASEMAPS ORIGINALES
// ==========================================

var map = L.map('map', { zoomControl: false }).setView([-11.018, -68.752], 13);
L.control.zoom({ position: 'bottomright' }).addTo(map);

// Capas de mapas base independientes
var capasMapasBase = {
  "Satélite Esri": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"),
  "Esri World Street Map": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"),
  "Esri World Topo Map": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"),
  "OpenStreetMap": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
  "CartoDB Positron": L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"),
  "CartoDB Dark Matter": L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png")
};

// Capas que forman el grupo especial "Satélite Híbrido"
var esriImágenes = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}");
var esriEtiquetas = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}");
var grupoSateliteHibrido = L.layerGroup([esriImágenes, esriEtiquetas]);

// Asignar e inicializar el mapa con el mapa por defecto original (Satélite Híbrido)
var mapaBaseActivoActual = grupoSateliteHibrido;
mapaBaseActivoActual.addTo(map);

// --- CONFIGURACIÓN DE TU GEOSERVER (WMS) ---
var GEOSERVER_URL = "http://localhost:8080/geoserver/wms"; // Reemplaza con tu servidor local o IP pública

var capaInundacion1 = L.tileLayer.wms(GEOSERVER_URL, {
  layers: 'workspace:evento_inundacion_1', // Cambiar por tu workspace:nombre_capa real
  format: 'image/png',
  transparent: true,
  version: '1.1.1',
  attribution: "GeoServer"
});

var capaInundacion2 = L.tileLayer.wms(GEOSERVER_URL, {
  layers: 'workspace:evento_inundacion_2', // Cambiar por tu workspace:nombre_capa real
  format: 'image/png',
  transparent: true,
  version: '1.1.1',
  attribution: "GeoServer"
});

// ==========================================
// 2. CAMBIO DE MAPAS BASE SIN AFECTAR LAS CAPAS RASTER
// ==========================================
function cambiarMapaBase(nombre) {
  // Retirar el mapa base que está actualmente activo
  map.removeLayer(mapaBaseActivoActual);

  // Asignar y agregar el nuevo mapa base seleccionado
  if (nombre === "Satélite Híbrido") {
    mapaBaseActivoActual = grupoSateliteHibrido;
  } else {
    mapaBaseActivoActual = capasMapasBase[nombre];
  }
  mapaBaseActivoActual.addTo(map);
}

// ==========================================
// 3. CONTROLADORES INDEPENDIENTES DE LOS CHECKBOXES
// ==========================================
document.getElementById('chkRaster1').addEventListener('change', function(e) {
  if(e.target.checked) {
    capaInundacion1.addTo(map);
  } else {
    map.removeLayer(capaInundacion1);
  }
  actualizarLeyenda();
});

document.getElementById('chkRaster2').addEventListener('change', function(e) {
  if(e.target.checked) {
    capaInundacion2.addTo(map);
  } else {
    map.removeLayer(capaInundacion2);
  }
  actualizarLeyenda();
});

function actualizarLeyenda() {
  var contenedor = document.getElementById('leyendaContenedorDinamico');
  var html = "";
  if (document.getElementById('chkRaster1').checked) {
    html += `<div class="flex items-center gap-2"><span class="w-3 h-3 bg-emerald-500"></span><span>Distritos afectados</span></div>`;
  }
  if (document.getElementById('chkRaster2').checked) {
    html += `<div class="flex items-center gap-2"><span class="w-3 h-3 bg-blue-500"></span><span>Inundación</span></div>`;
  }
  contenedor.innerHTML = html || `<span class="text-slate-400 italic">No hay capas cargadas en el visor.</span>`;
}

// ==========================================
// 4. RENDEREADO DE LA GALERÍA COMPLETA DE BASEMAPS (7 OPCIONES)
// ==========================================
var mapaDefinicionesOriginales = {
  "Satélite Híbrido": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/4636/4414",
  "Satélite Esri": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/4636/4414",
  "Esri World Street Map": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/13/4636/4414",
  "Esri World Topo Map": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/13/4636/4414",
  "OpenStreetMap": "https://a.tile.openstreetmap.org/13/4636/4414.png",
  "CartoDB Positron": "https://a.basemaps.cartocdn.com/light_all/13/4636/4414.png",
  "CartoDB Dark Matter": "https://a.basemaps.cartocdn.com/dark_all/13/4636/4414.png"
};

var grid = document.getElementById('basemapGridContainer');

Object.keys(mapaDefinicionesOriginales).forEach(nombre => {
  var box = document.createElement('div');
  box.className = "bg-white p-1 rounded border border-slate-200 cursor-pointer hover:border-blue-500 transition-all text-center shadow-sm";
  box.innerHTML = `
    <img src="${mapaDefinicionesOriginales[nombre]}" class="w-full h-16 object-cover rounded mb-1">
    <span class="text-[10px] font-semibold block text-slate-700 truncate">${nombre}</span>
  `;
  box.onclick = function() {
    cambiarMapaBase(nombre);
  };
  grid.appendChild(box);
});

// ==========================================
// 5. FUNCIONES DE INTERFAZ, BUSQUEDA Y DIBUJO
// ==========================================
function toggleWidget(id) {
  var panel = document.getElementById(id);
  if(panel) panel.classList.toggle('hidden');
}

function toggleLeyenda() {
  toggleWidget('panelLeyenda');
}

var timerBusqueda;
function buscarSugerencias() {
  clearTimeout(timerBusqueda);
  var query = document.getElementById('searchInput').value.trim();
  var sugerencias = document.getElementById('searchSuggestions');
  if(query.length < 3) { sugerencias.classList.add('hidden'); return; }
  
  timerBusqueda = setTimeout(async function() {
    try {
      var res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`);
      var data = await res.json();
      sugerencias.innerHTML = "";
      if(data && data.length > 0) {
        sugerencias.classList.remove('hidden');
        data.forEach(item => {
          var div = document.createElement('div');
          div.className = "p-2 hover:bg-slate-100 cursor-pointer truncate border-b border-slate-50";
          div.innerText = item.display_name;
          div.onclick = function() {
            document.getElementById('searchInput').value = item.display_name;
            map.setView([parseFloat(item.lat), parseFloat(item.lon)], 15);
            sugerencias.innerHTML = "";
            sugerencias.classList.add('hidden');
          };
          sugerencias.appendChild(div);
        });
      }
    } catch(e) { console.error(e); }
  }, 400);
}

async function ejecutarBusquedaDirecta() {
  var query = document.getElementById('searchInput').value.trim();
  if(!query) return;
  try {
    var res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`);
    var data = await res.json();
    if(data && data.length > 0) map.setView([parseFloat(data[0].lat), parseFloat(data[0].lon)], 15);
  } catch(e) { console.error(e); }
}

function volverAlHome() { map.setView([-11.0, -68.7], 12); }
function obtenerUbicacionActual() {
  map.locate({setView: true, maxZoom: 15});
}

function activarHerramientaDibujo(tipo) {
  var status = document.getElementById('statusDibujo');
  status.innerText = "Herramienta '" + tipo + "' activa.";
}
function limpiarDibujos() {
  document.getElementById('statusDibujo').innerText = "Ninguna herramienta activa";
}