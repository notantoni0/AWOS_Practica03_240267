// Variables globales 
let googleMap; 
let leafletMap; 
let googleMarkers = []; 
let leafletMarkers = []; 
let currentLocation = { 
    lat: parseFloat('<%= initialLocation.lat %>'), 
    lng: parseFloat('<%= initialLocation.lng %>'), 
    name: '<%= initialLocation.name %>' 
}; 
let searchCount = 0; 
 
// Inicialización cuando el DOM está listo 
document.addEventListener('DOMContentLoaded', function() { 
    // Inicializar contadores 
    updateStats(); 
     
    // Configurar event listeners 
    document.getElementById('searchButton').addEventListener('click', searchLocation); 
    document.getElementById('addressInput').addEventListener('keypress', function(e) { 
        if (e.key === 'Enter') searchLocation(); 
    }); 
    document.getElementById('currentLocationBtn').addEventListener('click', getCurrentLocation); 
    document.getElementById('clearMarkersBtn').addEventListener('click', clearAllMarkers); 
     
    // Inicializar mapas (Google Maps se inicializa mediante callback) 
    initLeafletMap(); 
}); 
 
// Función para inicializar Google Maps (llamada por la API) 
function initGoogleMap() { 
    console.log('Inicializando Google Maps');
    
    // Asegurar que las coordenadas son números
    const centerLat = parseFloat(currentLocation.lat);
    const centerLng = parseFloat(currentLocation.lng);
    
    console.log('Centro Google Maps:', centerLat, centerLng);
    
    // Verificar que no sean NaN
    if (isNaN(centerLat) || isNaN(centerLng)) {
        console.error('Coordenadas inválidas para Google Maps');
        return;
    }
    
    const mapOptions = { 
        center: { lat: centerLat, lng: centerLng }, 
        zoom: 12, 
        mapTypeId: google.maps.MapTypeId.ROADMAP, 
        styles: [ 
            { 
                "featureType": "administrative", 
                "elementType": "labels.text.fill", 
                "stylers": [{"color": "#444444"}] 
            }, 
            { 
                "featureType": "landscape", 
                "elementType": "all", 
                "stylers": [{"color": "#f2f2f2"}] 
            }, 
            { 
                "featureType": "poi", 
                "elementType": "all", 
                "stylers": [{"visibility": "off"}] 
            }, 
            { 
                "featureType": "road", 
                "elementType": "all", 
                "stylers": [{"saturation": -100}, {"lightness": 45}] 
            }, 
            { 
                "featureType": "road.highway", 
                "elementType": "all", 
                "stylers": [{"visibility": "simplified"}] 
            }, 
            { 
                "featureType": "road.arterial", 
                "elementType": "labels.icon", 
                "stylers": [{"visibility": "off"}] 
            }, 
            { 
                "featureType": "transit", 
                "elementType": "all", 
                "stylers": [{"visibility": "off"}] 
            }, 
            { 
                "featureType": "water", 
                "elementType": "all", 
                "stylers": [{"color": "#46bcec"}, {"visibility": "on"}] 
            } 
        ] 
    }; 
     
    googleMap = new google.maps.Map(document.getElementById('googleMap'), mapOptions); 
     
    // Agregar marcador inicial 
    addGoogleMarker(centerLat, centerLng, currentLocation.name); 
     
    // Escuchar cambios de zoom 
    googleMap.addListener('zoom_changed', () => { 
        document.getElementById('googleZoom').textContent = googleMap.getZoom(); 
    }); 
     
    // Escuchar clics en el mapa 
    googleMap.addListener('click', (event) => { 
        handleMapClick(event.latLng.lat(), event.latLng.lng()); 
    }); 
    
    console.log('Google Maps inicializado correctamente');
}

// Función para inicializar Leaflet 
function initLeafletMap() { 
    console.log('Inicializando Leaflet');
    
    // Verificar que el contenedor existe
    const mapContainer = document.getElementById('leafletMap');
    if (!mapContainer) {
        console.error('No se encontró el contenedor leafletMap');
        return;
    }
    
    // Verificar que L está disponible
    if (typeof L === 'undefined') {
        console.error('Leaflet no está cargado');
        return;
    }
    
    // Asegurar que las coordenadas son números
    const centerLat = parseFloat(currentLocation.lat);
    const centerLng = parseFloat(currentLocation.lng);
    
    console.log('Centro Leaflet:', centerLat, centerLng);
    
    // Verificar que no sean NaN
    if (isNaN(centerLat) || isNaN(centerLng)) {
        console.error('Coordenadas inválidas para Leaflet');
        // Usar coordenadas por defecto
        currentLocation.lat = 40.4168;
        currentLocation.lng = -3.7038;
        currentLocation.name = 'Madrid, España';
        centerLatFinal = 40.4168;
        centerLngFinal = -3.7038;
    } else {
        centerLatFinal = centerLat;
        centerLngFinal = centerLng;
    }
    
    leafletMap = L.map('leafletMap').setView([centerLatFinal, centerLngFinal], 12); 
     
    // Usar OpenStreetMap como capa base 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', 
        maxZoom: 19 
    }).addTo(leafletMap); 
     
    // Agregar marcador inicial 
    addLeafletMarker(centerLatFinal, centerLngFinal, currentLocation.name); 
     
    // Escuchar cambios de zoom 
    leafletMap.on('zoomend', () => { 
        document.getElementById('leafletZoom').textContent = leafletMap.getZoom(); 
    }); 
     
    // Escuchar clics en el mapa 
    leafletMap.on('click', (event) => { 
        handleMapClick(event.latlng.lat, event.latlng.lng); 
    }); 
    
    console.log('Leaflet inicializado correctamente');
} 
 
// Función para buscar una ubicación 
async function searchLocation() { 
    const addressInput = document.getElementById('addressInput'); 
    const address = addressInput.value.trim(); 
     
    if (!address) { 
        showNotification('Por favor, ingresa una dirección', 'warning'); 
        return; 
    } 
     
    try { 
        showLoading(true); 
         
        // Geocodificar la dirección 
        const response = await fetch(`/geocode?address=${encodeURIComponent(address)}`); 
        const data = await response.json(); 
         
        if (data.success) { 
            // Actualizar ubicación actual 
            currentLocation = { 
                lat: data.lat, 
                lng: data.lng, 
                name: data.name 
            }; 
             
            // Centrar ambos mapas 
            centerBothMaps(data.lat, data.lng); 
             
            // Agregar marcadores 
            addGoogleMarker(data.lat, data.lng, data.name); 
            addLeafletMarker(data.lat, data.lng, data.name); 
             
            // Actualizar información 
            updateLocationInfo(data.lat, data.lng, data.name); 
             
            // Incrementar contador 
            searchCount++; 
            updateStats(); 
             
            showNotification(`Ubicación encontrada: ${data.name}`, 'success'); 
        } else { 
            showNotification(data.error || 'Error al buscar la ubicación', 'error'); 
        } 
    } catch (error) { 
        console.error('Error en búsqueda:', error); 
        showNotification('Error de conexión con el servidor', 'error'); 
    } finally { 
        showLoading(false); 
    } 
} 
 
// Función para obtener ubicación actual 
function getCurrentLocation() { 
    if (!navigator.geolocation) { 
        showNotification('Geolocalización no soportada por tu navegador', 'error'); 
        return; 
    } 
     
    showLoading(true); 
     
    navigator.geolocation.getCurrentPosition( 
        async (position) => { 
            const lat = position.coords.latitude; 
            const lng = position.coords.longitude; 
             
            try { 
                // Obtener dirección a partir de coordenadas 
                const response = await fetch(`/reverse-geocode?lat=${lat}&lng=${lng}`); 
                const data = await response.json(); 
                 
                if (data.success) { 
                    currentLocation = { 
                        lat: lat, 
                        lng: lng, 
                        name: data.address 
                    }; 
                     
                    // Centrar mapas 
                    centerBothMaps(lat, lng); 
                     
                    // Agregar marcadores 
                    addGoogleMarker(lat, lng, 'Mi ubicación actual'); 
                    addLeafletMarker(lat, lng, 'Mi ubicación actual'); 
                     
                    // Actualizar información 
                    updateLocationInfo(lat, lng, 'Mi ubicación actual'); 
                     
                    // Actualizar input 
                    document.getElementById('addressInput').value = data.address; 
                     
                    searchCount++; 
                    updateStats(); 
                     
                    showNotification('Ubicación actual obtenida', 'success'); 
                } 
            } catch (error) { 
                console.error('Error en reverse geocoding:', error); 
                // Si falla el reverse geocoding, usar solo las coordenadas 
                currentLocation = { 
                    lat: lat, 
                    lng: lng, 
                    name: `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}` 
                }; 
                 
                centerBothMaps(lat, lng); 
                addGoogleMarker(lat, lng, 'Mi ubicación actual'); 
                addLeafletMarker(lat, lng, 'Mi ubicación actual'); 
                updateLocationInfo(lat, lng, 'Mi ubicación actual'); 
                showNotification('Ubicación obtenida (sin dirección específica)', 'info'); 
            } finally { 
                showLoading(false); 
            } 
        }, 
        (error) => { 
            showLoading(false); 
            switch(error.code) { 
                case error.PERMISSION_DENIED: 
                    showNotification('Permiso de geolocalización denegado', 'error'); 
                    break; 
                case error.POSITION_UNAVAILABLE: 
                    showNotification('Información de ubicación no disponible', 'error'); 
                    break; 
                case error.TIMEOUT: 
                    showNotification('Tiempo de espera agotado', 'error'); 
                    break; 
                default: 
                    showNotification('Error desconocido al obtener ubicación', 'error'); 
            } 
        }, 
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } 
    ); 
} 
 
// Función para manejar clic en el mapa 
async function handleMapClick(lat, lng) { 
    try { 
        // Obtener dirección 
        const response = await fetch(`/reverse-geocode?lat=${lat}&lng=${lng}`); 
        const data = await response.json(); 
         
        const name = data.success ? data.address : `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`; 
         
        // Agregar marcadores 
        addGoogleMarker(lat, lng, name); 
        addLeafletMarker(lat, lng, name); 
         
        // Actualizar información 
        updateLocationInfo(lat, lng, name); 
         
        searchCount++; 
        updateStats(); 
         
        showNotification(`Marcador agregado en: ${name}`, 'info'); 
    } catch (error) { 
        console.error('Error al agregar marcador:', error); 
        const name = `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`; 
        addGoogleMarker(lat, lng, name); 
        addLeafletMarker(lat, lng, name); 
        updateLocationInfo(lat, lng, name); 
        showNotification(`Marcador agregado en coordenadas`, 'info'); 
    } 
} 
 
// Función para agregar marcador en Google Maps 
function addGoogleMarker(lat, lng, title) { 
    if (!googleMap) return; 
     
    const marker = new google.maps.Marker({ 
        position: { lat: lat, lng: lng }, 
        map: googleMap, 
        title: title, 
        animation: google.maps.Animation.DROP, 
        icon: { 
            path: google.maps.SymbolPath.CIRCLE, 
            scale: 10, 
            fillColor: "#4285F4", 
            fillOpacity: 1, 
            strokeColor: "#FFFFFF", 
            strokeWeight: 2 
        } 
    }); 
     
    // Info window 
    const infoWindow = new google.maps.InfoWindow({ 
        content: ` 
            <div class="p-2 bg-white rounded shadow-lg max-w-xs"> 
                <h3 class="font-bold text-lg mb-2">${title}</h3> 
                <p class="text-sm text-gray-600">Lat: ${lat.toFixed(6)}</p> 
                <p class="text-sm text-gray-600">Lng: ${lng.toFixed(6)}</p> 
                <p class="text-xs text-gray-500 mt-2">Google Maps Marker</p> 
            </div> 
        ` 
    }); 
     
    marker.addListener('click', () => { 
        infoWindow.open(googleMap, marker); 
    }); 
     
    googleMarkers.push(marker); 
    updateStats(); 
     
    return marker; 
} 
 
// Función para agregar marcador en Leaflet 
function addLeafletMarker(lat, lng, title) { 
    if (!leafletMap) return; 
     
    // Crear ícono personalizado 
    const leafletIcon = L.divIcon({ 
        html: ` 
            <div style=" 
                width: 20px; 
                height: 20px; 
                background-color: #199900; 
                border: 2px solid white; 
                border-radius: 50%; 
                box-shadow: 0 2px 5px rgba(0,0,0,0.3); 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                color: white; 
                font-size: 10px; 
                font-weight: bold; 
            "> 
                ${leafletMarkers.length + 1} 
            </div> 
        `, 
        className: 'leaflet-custom-icon', 
        iconSize: [24, 24], 
        iconAnchor: [12, 12] 
    }); 
     
    const marker = L.marker([lat, lng], { 
        title: title, 
        icon: leafletIcon, 
        riseOnHover: true 
    }).addTo(leafletMap); 
     
    // Popup 
    marker.bindPopup(` 
        <div class="p-2 bg-white rounded shadow-lg max-w-xs"> 
            <h3 class="font-bold text-lg mb-2">${title}</h3> 
            <p class="text-sm text-gray-600">Lat: ${lat.toFixed(6)}</p> 
            <p class="text-sm text-gray-600">Lng: ${lng.toFixed(6)}</p> 
            <p class="text-xs text-gray-500 mt-2">Leaflet Marker</p> 
        </div> 
    `); 
     
    leafletMarkers.push(marker); 
    updateStats(); 
     
    return marker; 
} 
 
// Función para centrar ambos mapas 
function centerBothMaps(lat, lng) { 
    const centerLat = parseFloat(lat);
    const centerLng = parseFloat(lng);
    
    if (isNaN(centerLat) || isNaN(centerLng)) {
        console.error('Coordenadas inválidas para centrar mapas');
        return;
    }
    
    if (googleMap) { 
        googleMap.setCenter({ lat: centerLat, lng: centerLng }); 
        googleMap.setZoom(14); 
    } 
     
    if (leafletMap) { 
        leafletMap.setView([centerLat, centerLng], 14); 
    } 
}  
 
// Función para limpiar todos los marcadores 
function clearAllMarkers() { 
    // Limpiar Google Maps 
    googleMarkers.forEach(marker => marker.setMap(null)); 
    googleMarkers = []; 
     
    // Limpiar Leaflet 
    leafletMarkers.forEach(marker => leafletMap.removeLayer(marker)); 
    leafletMarkers = []; 
     
    updateStats(); 
    showNotification('Todos los marcadores han sido eliminados', 'info'); 
} 
 
// Función para actualizar información de ubicación 
function updateLocationInfo(lat, lng, name) { 
    document.getElementById('currentLat').textContent = lat.toFixed(6); 
    document.getElementById('currentLng').textContent = lng.toFixed(6); 
    document.getElementById('currentPlace').textContent = name; 
} 
 
// Función para actualizar estadísticas 
function updateStats() { 
    document.getElementById('googleMarkersCount').textContent = googleMarkers.length; 
    document.getElementById('leafletMarkersCount').textContent = leafletMarkers.length; 
    document.getElementById('totalSearches').textContent = searchCount; 
} 
 
// Función para mostrar notificaciones 
function showNotification(message, type = 'info') { 
    // Eliminar notificación anterior si existe 
    const existingNotification = document.querySelector('.notification'); 
    if (existingNotification) { 
        existingNotification.remove(); 
    } 
     
    // Colores por tipo 
    const colors = { 
        success: 'bg-green-500', 
        error: 'bg-red-500', 
        warning: 'bg-yellow-500', 
        info: 'bg-blue-500' 
    }; 
     
    // Crear notificación 
    const notification = document.createElement('div'); 
    notification.className = `notification fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-transform duration-300 translate-x-0`; 
    notification.innerHTML = ` 
        <div class="flex items-center"> 
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} mr-3"></i> 
            <span>${message}</span> 
        </div> 
    `; 
     
    document.body.appendChild(notification); 
     
    // Auto-eliminar después de 5 segundos 
    setTimeout(() => { 
        notification.style.transform = 'translateX(100%)'; 
        setTimeout(() => notification.remove(), 300); 
    }, 5000); 
} 
 
// Función para mostrar/ocultar loading 
function showLoading(show) { 
    let loadingElement = document.getElementById('loadingOverlay'); 
     
    if (show) { 
        if (!loadingElement) { 
            loadingElement = document.createElement('div'); 
            loadingElement.id = 'loadingOverlay'; 
            loadingElement.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50'; 
            loadingElement.innerHTML = ` 
                <div class="bg-white p-6 rounded-lg shadow-xl"> 
                    <div class="flex items-center"> 
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-google-blue mr4"></div> 
                        <span class="text-gray-700">Procesando...</span> 
                    </div> 
                </div> 
            `; 
            document.body.appendChild(loadingElement); 
        } 
    } else if (loadingElement) { 
        loadingElement.remove(); 
    } 
} 
 
// Función para exportar marcadores 
function exportMarkers() { 
    const markersData = { 
        googleMarkers: googleMarkers.map(marker => ({ 
            lat: marker.getPosition().lat(), 
            lng: marker.getPosition().lng(), 
            title: marker.getTitle() 
        })), 
        leafletMarkers: leafletMarkers.map(marker => ({ 
            lat: marker.getLatLng().lat, 
            lng: marker.getLatLng().lng, 
            title: marker.options.title 
        })), 
        exportDate: new Date().toISOString() 
    }; 
     
    const dataStr = JSON.stringify(markersData, null, 2); 
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr); 
     
    const exportFileDefaultName = `map-markers-${new Date().toISOString().slice(0,10)}.json`; 
     
    const linkElement = document.createElement('a'); 
    linkElement.setAttribute('href', dataUri); 
    linkElement.setAttribute('download', exportFileDefaultName); 
    linkElement.click(); 
     
    showNotification('Marcadores exportados exitosamente', 'success'); 
}