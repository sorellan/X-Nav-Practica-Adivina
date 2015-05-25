///////Variables y constantes//////////////////////////////////////////////////////////
const MAX_PHOTOS = 10;
const INSANE = 500;
const HARD = 1000;
const MEDIUM = 3000;
const EASY = 5000;

var juego;
var dificultad;
var score;
var geojsonFeature;
var listphotos;
var selected_item;
var clickMap;
var displayed = 1;
var map;
var marker;
var juego_actual = 0;
var index_go = 0;

///////////////////////////////////////////////////////////////////////////////////////

///////Funciones///////////////////////////////////////////////////////////////////////
function checkQuery(query) {
	return query == "";
}

function chooseMenu(query) {
	var subquery = []; 
	subquery = query.split("&");
	juego = subquery[0].split("=").pop();
	dificultad = subquery[1].split("=").pop();
	$("#"+juego).attr("checked", true);
	$("#"+dificultad).attr("checked", true);
}

function enableInit(data1, data2) {
	if (data1 && data2)
		$("#btn-init").css("visibility", "visible");
	else 
		$("#btn-init").css("visibility", "hidden");
}

function getInterval() {
	switch (dificultad) {
		case "easy":
			return EASY;
			break;
		case "medium":
			return MEDIUM;
			break;
		case "hard":
			return HARD;
			break;
		default:
			return INSANE;
			break;
	}
}

function showPhotos() {
	var counter = 0;
	$("#photo").html("<img src='"+listphotos[counter]+"'/>");
	(function addPhoto() {
		setTimeout(function() {
			if (counter++ < MAX_PHOTOS && !clickMap) {
				$("#photo").html("<img src='"+listphotos[counter]+"'/>");
				displayed++;
				addPhoto();
			} else {
				if (!clickMap)
					$("#photo").html("<h1>Debes pulsar en algun lugar</h1>");
			}
		}, getInterval());
	})();
}

function getPhotos(item) {
	var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?tagmode=all&format=json&jsoncallback=?";
	listphotos = [];
	$.getJSON(flickerAPI, {
        tags: item,
    }).done(function(data) {
      	$.each(data.items, function(i, item) {
      		listphotos.push(item.media.m);
      		if (i === MAX_PHOTOS) {
            	return false;
          	}	
        });
        showPhotos();
    });
}
//////////////Geojson////////////////////////////////////////////////////////////////////
function loadGeojson() {
	$.getJSON("juegos/"+juego+".json", function(data) {
		geojsonFeature = data;
		//Estraigo un nombre al azar del geojson
		var items = [];
		items = data.features;
		selected_item = items[Math.floor(Math.random() * items.length)];
		clickMap = false;
		getPhotos(selected_item.properties.Name);
    });
}

function history_list(index) {
	index_go = index - juego_actual;
	if (index_go == 0) {
		alert("Este es el juego actual");
	} else {
		history.go(index_go);
	}
}

function history_push() {
	juego_actual++;
	index_go = Math.abs(index_go);
	var date = new Date().toJSON().slice(0,19);
	if(index_go>0)
		history.go(index_go);
	history.pushState({game:juego,level:dificultad,score:score}, null, 
		"?game="+juego+"&level="+dificultad+"&score="+score);
	$("#history").append("<li id='"+juego+score+"'><a href=javascript:history_list("+juego_actual+
		")>Adivinanzas: "+juego+" "+dificultad+" "+date+" "+score+"</a></li>");
}

function getData(coor1, coor2) {
	if(juego == "capitals")
		$("#target").html(selected_item.properties.Name.split(" ")[0]);
	else
		$("#target").html(selected_item.properties.Name);
	var distance = Math.round(coor2.distanceTo(coor1)/1000);
	$("#distance").html("Te has quedado a " + distance + " km");
	score = distance * displayed;
	$("#score").html("Puntos: " + score);
}

/////RESETEO EL JUEGO/////
function resetGame() {
	map.setView([0, 0], 1);
	if(marker!=null)
		map.removeLayer(marker);
	displayed = 1;
	$(".funkyradio input").attr("disabled", false);
	$("#target").html("");
	$("#distance").html("");
	$("#score").html("");
	$("#btn-new").css("visibility","hidden");
	$("#btn-leave").css("visibility","visible");
	$("#"+juego).attr("checked", false);
	$("#"+dificultad).attr("checked", false);
}

function selectOptions() {
	var pulsado1 = false; //para saber si se ha pulsado algun game-type
	var pulsado2 = false; //para saber si se ha pulsado algun game-level
	var query = location.search;
	if (!checkQuery(query)) {
		chooseMenu(query);
		pulsado1 = pulsado2 = true;
		enableInit(pulsado1, pulsado2);
	} else {
		$("input[type=radio]").click(function() {
			if($(this).attr("name") == "game-type") {
				juego = $(this).attr("id");
				pulsado1 = true;
			}
			else {
				dificultad = $(this).attr("id");
				pulsado2 = true;
			}
			enableInit(pulsado1, pulsado2);
		});
	}
}

/////CARGO EL MAPA CON LEAFLET/////
function loadMap() {
	map = L.map('map').setView([0, 0], 1);

	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
	function onMapClick(e) {
		if (!clickMap) {
			clickMap = true;
			var c1 = e.latlng;
			var c2 = new L.LatLng(
			selected_item.geometry.coordinates[1],
			selected_item.geometry.coordinates[0]);
			marker = L.marker(c2);
			marker.addTo(map);
    		getData(c1, c2);
    		$("#btn-new").css("visibility","visible");
			$("#btn-leave").css("visibility","hidden");
			history_push();
		}
	}
	map.on('click', onMapClick);
}

///////////////////////////////////////////////////////////////////////////////////////

jQuery(document).ready(function() {
	loadMap();
	selectOptions();
	$("#btn-init").click(loadGeojson);
	$("#btn-leave").click(function() {
		clickMap = true;
		$("#distance").html("Has abandonado el juego");
		$("#btn-new").css("visibility","visible");
		$(this).css("visibility","hidden");
	});
	$("#btn-new").click(function() {
		index_go = 0;
		resetGame();
		selectOptions();
	});

	window.addEventListener("popstate", function(e) {
		if(index_go < 0){
			resetGame();
			juego = e.state.game;
			dificultad = e.state.level;
			score = e.state.score;
			$("#"+juego+score).remove();
			loadGeojson();
		}
	});
});