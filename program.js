document.getElementById("nombre-barrio").innerText = "Barrio Ingles";
document.getElementById("nombre-localidad").innerText = "Localidad Rafael Uribe Uribe";


// **MAPA

// Inicializar el mapa centrado en la zona del barrio
var map = L.map('map', {
    center: [4.5709, -74.2973], // Ajusta con las coordenadas de tu barrio
    zoom: 14,
    zoomControl: true,
    dragging: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    touchZoom: true
});

// Mapa base vectorial (izquierda)
var vectorial = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '© CartoDB | © OpenStreetMap contributors'
}).addTo(map);

// Mapa raster satelital (derecha)
var satelite = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Control deslizante para comparación de mapas
var sideBySide = L.control.sideBySide(vectorial, satelite).addTo(map);

// Cargar el polígono del barrio desde GeoJSON
fetch('ingles.geojson')  // Asegúrate de tener el archivo en la misma carpeta
    .then(response => response.json())
    .then(data => {
        var barrioLayer = L.geoJSON(data, {
            style: {
                color: 'blue',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.4
            }
        }).addTo(map);

        map.fitBounds(barrioLayer.getBounds()); // Ajusta el zoom al polígono
    })
    .catch(error => console.error('Error cargando el GeoJSON:', error));

// Activar herramientas de dibujo con Geoman
map.pm.addControls({
    position: 'topleft',
    drawMarker: true,
    drawPolyline: true,
    drawPolygon: true,
    editMode: true,
    removalMode: true
});

// Permitir interacción sobre las geometrías dibujadas
map.on('pm:create', function(e) {
    e.layer.pm.enable();
    console.log('Geometría creada:', e.layer.toGeoJSON());
});

// SECCIÓN 3

var mapLocalidad = L.map('map-localidad', {
    center: [4.5709, -74.2973], // Ajusta a tu ubicación
    zoom: 12
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(mapLocalidad);

var localidadLayer; // Variable para almacenar el polígono de la localidad

// Función para cargar una localidad específica por su nombre
function cargarLocalidad(nombreLocalidad) {
    fetch('localidades.geojson') // Asegúrate de que el archivo está en la misma carpeta
        .then(response => response.json())
        .then(data => {
            // Filtrar solo la localidad seleccionada
            const localidadFiltrada = {
                "type": "FeatureCollection",
                "features": data.features.filter(feature => feature.properties.LocNombre === nombreLocalidad)
            };

            if (localidadFiltrada.features.length === 0) {
                alert('Localidad no encontrada');
                return;
            }
            // Eliminar capa anterior si existe
            if (localidadLayer) {
                mapLocalidad.removeLayer(localidadLayer);
            }

            // Dibujar el polígono de la localidad en el mapa
            localidadLayer = L.geoJSON(localidadFiltrada, {
                style: {
                    color: 'blue',
                    weight: 2,
                    fillOpacity: 0.4
                }
            }).addTo(mapLocalidad);

            // Ajustar el mapa al polígono
            mapLocalidad.fitBounds(localidadLayer.getBounds());
        })
        .catch(error => console.error('Error cargando el GeoJSON:', error));
}

// Cargar por defecto "RAFAEL URIBE URIBE" al cargar la página
cargarLocalidad("RAFAEL URIBE URIBE");

//BOTONES

// Capa NDVI (Imagen ráster desde un servidor WMS)
var ndviLayer = L.tileLayer.wms("URL_DEL_SERVIDOR_WMS", {
    layers: "NDVI",
    format: "image/png",
    transparent: true
});

// Capa SAVI
var saviLayer = L.tileLayer.wms("URL_DEL_SERVIDOR_WMS", {
    layers: "SAVI",
    format: "image/png",
    transparent: true
});

// Evento para mostrar NDVI
document.getElementById("NVDI").addEventListener("click", function () {
    mapLocalidad.addLayer(ndviLayer);
    mapLocalidad.removeLayer(saviLayer);
});

// Evento para mostrar SAVI
document.getElementById("SAVI").addEventListener("click", function () {
    mapLocalidad.addLayer(saviLayer);
    mapLocalidad.removeLayer(ndviLayer);
});

// Evento para restaurar el mapa y quitar capas de NDVI y SAVI
document.getElementById("Rutas_Transmi").addEventListener("click", function () {
    mapLocalidad.removeLayer(ndviLayer);
    mapLocalidad.removeLayer(saviLayer);
});


//SECCION 4

// Función para calcular y mostrar los datos del polígono del barrio
function calcularDatosPoligono(barrioGeoJSON) {
    if (!barrioGeoJSON || barrioGeoJSON.features.length === 0) {
        console.error("No se encontró el polígono del barrio.");
        return;
    }
    
    let barrio = barrioGeoJSON.features[0]; // Tomamos el primer polígono encontrado
    let area = turf.area(barrio); // Área en metros cuadrados
    let perimetro = turf.length(barrio, {units: 'kilometers'}); // Perímetro en km
    let centroide = turf.centroid(barrio).geometry.coordinates; // Centroide
    let bbox = turf.bbox(barrio); // Bounding box [minX, minY, maxX, maxY]
    let vertices = turf.coordAll(barrio); // Lista de vértices
    
    // Mostrar datos en la sección HTML
    document.getElementById("area").textContent = (area / 1e6).toFixed(2) + " km²";
    document.getElementById("perimetro").textContent = perimetro.toFixed(2) + " km";
    document.getElementById("centroide").textContent = `Lat: ${centroide[1].toFixed(5)}, Lng: ${centroide[0].toFixed(5)}`;
    document.getElementById("bbox").textContent = `[${bbox.map(coord => coord.toFixed(5)).join(", ")}]`;
    document.getElementById("vertices").textContent = vertices.length;
}

// Cargar el GeoJSON del barrio y calcular los datos
fetch('localidades.geojson') // Asegúrate de que la ruta es correcta
    .then(response => response.json())
    .then(data => {
        let barrioFiltrado = {
            "type": "FeatureCollection",
            "features": data.features.filter(f => f.properties.LocNombre === "RAFAEL URIBE URIBE")
        };
        calcularDatosPoligono(barrioFiltrado);
    })
    .catch(error => console.error('Error cargando el GeoJSON:', error));

//SECCION 5

// Función para mostrar los paraderos en el mapa
function mostrarParaderosEnMapa(paraderosGeoJSON) {
    var mapParaderos = L.map('map-paraderos').setView([4.5709, -74.2973], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(mapParaderos);

    L.geoJSON(paraderosGeoJSON, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, { icon: L.icon({
                iconUrl: 'bus-stop-icon.png',
                iconSize: [25, 25]
            }) });
        }
    }).addTo(mapParaderos);
}