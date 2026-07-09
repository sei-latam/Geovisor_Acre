var map = L.map('map', { zoomControl: false }).setView([-11.018, -68.752], 13);
L.control.zoom({ position: 'bottomright' }).addTo(map);

var capasMapasBase = {
  "Satélite Esri": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"),
  "Esri World Street Map": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"),
  "Esri World Topo Map": L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"),
  "OpenStreetMap": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
  "CartoDB Positron": L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"),
  "CartoDB Dark Matter": L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png")
};

var esriImágenes = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}");
var esriEtiquetas = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}");
var grupoSateliteHibrido = L.layerGroup([esriImágenes, esriEtiquetas]);
//query user
var mapaBaseActivoActual = grupoSateliteHibrido;
mapaBaseActivoActual.addTo(map);
var capasDibujo = L.layerGroup().addTo(map);
var capasPronostico = {};
const JSON_URL = "https://raw.githubusercontent.com/sei-latam/Geovisor_Acre/main/consultas.json"; 
const GEOSERVER_BASE_URL = "http://acre.senamhi.gob.bo/geoserver/rio_acre_manchas/wms";
async function cargarCapasDesdeJSON() {
  try {
    var response = await fetch(JSON_URL);
    var data = await response.json();
    
    var container = document.getElementById('geeOverlayLayersContainer');
    if (!container) return;
    container.innerHTML = ""; 

    data.forEach((item, index) => {
      var urlObjeto = new URL(item.servicio);
      var params = new URLSearchParams(urlObjeto.search);      
      var textoCapa = params.get('layers') || "";
      // Si contiene el duplicado "rio_acre_manchas:rio_acre_manchas:", lo reemplazamos por uno solo
      if (textoCapa.includes("rio_acre_manchas:rio_acre_manchas:")) {
        textoCapa = textoCapa.replace("rio_acre_manchas:rio_acre_manchas:", "rio_acre_manchas:");
      }
      
      var chkId = `chkPronostico_${index}`;
      
      capasPronostico[chkId] = L.tileLayer.wms(GEOSERVER_BASE_URL, {
        layers: textoCapa, // Ahora va limpio: "rio_acre_manchas:Depth_..."
        format: 'image/png',
        transparent: true,
        version: '1.1.0',
        attribution: "GeoServer - Pronóstico"
      });

      // Crear el elemento HTML del control (Checkbox con Tailwind de tu proyecto)
      var layerRow = document.createElement('div');
      layerRow.className = "flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg shadow-sm mb-1.5";
      layerRow.innerHTML = `
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-cloud-sun text-blue-500 text-xs"></i>
          <div class="flex flex-col">
            <span class="text-[11px] font-bold text-slate-700">Pronostico:</span>
            <span class="text-[9px] text-slate-400">${item.fechaDetectada.replace('T', ' ')}</span>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="${chkId}" class="sr-only peer">
          <div class="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      `;

      // Escuchador de eventos para encender/apagar capas
      layerRow.querySelector('input').addEventListener('change', function(e) {
        if(e.target.checked) {
          capasPronostico[chkId].addTo(map);
        } else {
          map.removeLayer(capasPronostico[chkId]);
        }
        actualizarLeyendaDinamica();
      });

      container.appendChild(layerRow);
    });

  } catch (error) {
    console.error("Error cargando o procesando el archivo consultas.json:", error);
  }
}

function actualizarLeyendaDinamica() {
  var contenedor = document.getElementById('leyendaContenedorDinamico');
  if (!contenedor) return;
  
  var html = "";
  Object.keys(capasPronostico).forEach((id, index) => {
    var checkbox = document.getElementById(id);
    if (checkbox && checkbox.checked) {
      var fila = checkbox.closest('.flex');
      var titulo = fila ? fila.querySelector('.font-bold').innerText : "Capa de Pronóstico";
      html += `<div class="flex items-center gap-2"><span class="w-3 h-3 bg-blue-500 rounded-sm"></span><span>${titulo}</span></div>`;
    }
  });
  
  contenedor.innerHTML = html || `<span class="text-slate-400 italic">No hay capas cargadas en el visor.</span>`;
}


function cambiarMapaBase(nombre) {
  map.removeLayer(mapaBaseActivoActual);
  if (nombre === "Satélite Híbrido") {
    mapaBaseActivoActual = grupoSateliteHibrido;
  } else {
    mapaBaseActivoActual = capasMapasBase[nombre];
  }
  mapaBaseActivoActual.addTo(map);
}

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
if(grid) {
  Object.keys(mapaDefinicionesOriginales).forEach(nombre => {
    var box = document.createElement('div');
    box.className = "bg-white p-1 rounded border border-slate-200 cursor-pointer hover:border-blue-500 transition-all text-center shadow-sm";
    box.innerHTML = `
      <img src="${mapaDefinicionesOriginales[nombre]}" class="w-full h-16 object-cover rounded mb-1">
      <span class="text-[10px] font-semibold block text-slate-700 truncate">${nombre}</span>
    `;
    box.onclick = function() { cambiarMapaBase(nombre); };
    grid.appendChild(box);
  });
}

function toggleWidget(id) {
  var panel = document.getElementById(id);
  if(panel) panel.classList.toggle('hidden');
}

function toggleLeyenda() { toggleWidget('panelLeyenda'); }
function volverAlHome() { map.setView([-11.018, -68.752], 13); }
function obtenerUbicacionActual() { map.locate({setView: true, maxZoom: 15}); }

// Buscador Nominatim
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

// Inicialización de herramientas de dibujo
var herramientaActiva = null;
function activarHerramientaDibujo(tipo) {
  console.log("Herramienta activa: " + tipo);
  // Implementación básica para evitar errores de llamado en los botones del HTML
}
function limpiarDibujos() {
  capasDibujo.clearLayers();
  document.getElementById('statusDibujo').innerText = "Ninguna herramienta activa";
}

// Ejecución al iniciar la página
document.addEventListener("DOMContentLoaded", function() {
  cargarCapasDesdeJSON();
});