

var attr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
  '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
  'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',

  Url = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZXRlcm5hMiIsImEiOiJjaXppZjRoaTIwMmYxMndsNHJ4dzR1eWJsIn0.MvJ5fsV47RHlSAt2fBEKLg';

var Stamen_Terrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  subdomains: 'abcd',
  minZoom: 3,
  maxZoom: 20,
  ext: 'png'
});

var map = L.map('map', {
  zoomSnap: 10,
  layers: [Stamen_Terrain]
}).fitWorld();

function infoFunction() {
  alert('This application would like to know your current location in order to show which vehicles are closer to you.');
}

function locateFunction() {
  if (navigator.geolocation) {
    navigator.geolocation.showPosition(showPosition);
    map.setView({
      setView: false,
      maxZoom: 50,
      timeout: 15000,
      watch: false,
    })
  } else {
    alert('User denied web page access to location.')
  }
}

function showPosition(position) {
  alert('Your location: ' + position.coords.latitude + ', ' + position.coords.longitude)
}

//the below JS code takes advantage of the Geolocate API as it is incorporated in the Leaflet JS API with the locate method
function onLocationFound(e) { //this function does three things if the location is found: it defines a radius variable, adds a circle to the map, and adds a popup to the map.


  var radius = e.accuracy / 10; //this defines a variable radius as the accuracy value returned by the locate method divided by 2. It is divided by 2 because the accuracy value is the sum of the estimated accuracy of the latitude plus the estimated accuracy of the longitude. The unit is meters.


  var r = radius.toFixed(2);
  var coordinates = e.latlng.lat + ', ' + e.latlng.lng;
  var secondHandIcon = L.icon({
    iconUrl: 'https://img.icons8.com/cotton/64/000000/van.png',

    iconSize: [27, 47],
    popupAnchor: [-0.5, -16],
    shadowAnchor: [22, 94]
  });

  const vehicleLat = getUrlVars().lat;
  const vehicleLong = getUrlVars().long;

  L.marker(e.latlng).addTo(map)
    .bindPopup('Your location is within ' + radius + ' meters of this point');

  //$.get('/map').then(a => console.log(a))




  L.marker([Number(vehicleLat), Number(vehicleLong)], { icon: secondHandIcon }).addTo(map)
  map.flyTo([vehicleLat, vehicleLong]);
}

function onLocationError(e) {
  alert(e.message);
}
//this function runs if the location is not found when the locate method is called. It populates an alert window that reports the error

//these are event listeners that call the functions above depending on whether or not the locate method is successful
map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);


//This specifies that the locate method should run
map.locate({
  setView: true,
  timeout: 15000,
  watch: false,
});

function getUrlVars() {
  let vars = [], hash;
  let hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for (var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
}
