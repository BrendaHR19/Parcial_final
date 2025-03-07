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
