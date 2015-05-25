jQuery(document).ready(function() {
	// create a map in the "map" div, set the view to a given place and zoom
	var map = L.map('map', {
		center: [0, 0],
		zoom: 2,
		minZoom: 2
	});

	// add an OpenStreetMap tile layer
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

/*
	// add a marker in the given location, attach some popup content to it and open the popup
	var marker = L.marker([40.2838, -3.8215]);
	marker.addTo(map)
    	.bindPopup('Aulario III de la URJC Fuenlabrada')
    	.openPopup();
*/

    // popup donde haga click en el mapa
	var popup = L.popup();
	function onMapClick(e) {
		//alert("You clicked the map at " + e.latlng);
    	popup
        	.setLatLng(e.latlng)
        	.setContent("Has hecho click en: " + e.latlng.toString())
        	.openOn(map);
	}
	map.on('click', onMapClick);
/*
	//localizacion
	map.locate({setView: true, maxZoom: 5});

	function onLocationFound(e) {
    	var radius = e.accuracy / 2;
    	L.marker(e.latlng).addTo(map)
        	.bindPopup("Estas a " + radius + " metros alrededor de este punto").openPopup();
    	L.circle(e.latlng, radius).addTo(map);
	}
	map.on('locationfound', onLocationFound);

	function onLocationError(e) {
    	alert(e.message);
	}
	map.on('locationerror', onLocationError);
*/
});