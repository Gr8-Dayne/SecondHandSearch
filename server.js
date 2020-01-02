'use strict';

var attr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',

  Url = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZXRlcm5hMiIsImEiOiJjaXppZjRoaTIwMmYxMndsNHJ4dzR1eWJsIn0.MvJ5fsV47RHlSAt2fBEKLg';

var Stamen_Terrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 18,
  ext: 'png'
});

var map = L.map('map', {
  zoomSnap: 5.0,
  layers:[Stamen_Terrain]}).fitWorld();


function infoFunction() {
  alert('This application would like to know your current location in order to show which vehicles are closer to you.');
}

function locateFunction(){
  if (navigator.geolocation) {
    navigator.geolocation.showPosition(showPosition);
    map.setView({
      setView: true,
      maxZoom: 16,
      timeout: 15000,
      watch: false,
    })} else {
    alert('User denied web page access to location.')
  }
}

function showPosition(position){
  alert('Your location: ' + position.coords.latitude + ', ' + position.coords.longitude)
}

//the below JS code takes advantage of the Geolocate API as it is incorporated in the Leaflet JS API with the locate method
function onLocationFound(e) { //this function does three things if the location is found: it defines a radius variable, adds a circle to the map, and adds a popup to the map.


  var radius = e.accuracy / 10; //this defines a variable radius as the accuracy value returned by the locate method divided by 2. It is divided by 2 because the accuracy value is the sum of the estimated accuracy of the latitude plus the estimated accuracy of the longitude. The unit is meters.

  var radius = e.accuracy / 2; //this defines a variable radius as the accuracy value returned by the locate method divided by 2. It is divided by 2 because the accuracy value is the sum of the estimated accuracy of the latitude plus the estimated accuracy of the longitude. The unit is meters.

  var r= radius.toFixed(2);
  var coordinates = e.latlng.lat + ", " + e.latlng.lng;
  var secondHandIcon = L.icon({
    iconUrl: 'https://img.icons8.com/cotton/64/000000/van.png',

    iconSize: [27, 47],
    popupAnchor: [-0.5, -16],
    shadowAnchor: [22, 94]
  });

// input from CG to go here.....


  L.marker(e.latlng).addTo(map)
    .bindPopup("Your location is within" + radius + " meters of this point");

  var marker = L.marker([Vehicles.lat, Vehicles.long], {icon: secondHandIcon}).addTo(map)


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
  maxZoom: 16,
  timeout: 15000,
  watch: false,
});

// Server starts here....

require('dotenv').config();
const PORT = process.env.PORT;
const express = require('express');
const superagent = require('superagent');
const app = express();
const pg = require('pg');
const ejs = require('ejs');
const methodoverride = require('method-override');
const craigslist = require('node-craigslist');

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(methodoverride('_method'));


const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => console.error(error));
client.connect();

let vehicleResultsArray = [];

function Vehicles(listing, price) {
  this.title = listing.title;
  this.price = price;
  this.lat = listing.mapUrl.slice(37, 45);
  this.long = listing.mapUrl.slice(47, 57);
  this.image = listing.images[0];
  this.url = listing.url;
}



app.get('/', getSearchPage);
app.post('/', postSearchResults);
app.post('/save', saveToDatabase);
app.get('/contact', (req, res) => {
  res.render('contact');
})

function getSearchPage(req, res) {
  res.render('index');
}

async function postSearchResults(req, res) {
  vehicleResultsArray = [];
  const clientCL = new craigslist.Client({
    city: req.body.location
  }),
    options = {
      category: 'cta',
    };
  try {
    let listings = await clientCL.search(options, `${req.body.year} ${req.body.make} ${req.body.model}`)
    for (let i = 0; i < 10; i++) {
      try {
        let listingInfo = await clientCL.details(listings[i])
        let vehicleResult = new Vehicles(listingInfo, listings[i].price);
        vehicleResultsArray.push(vehicleResult);
      } catch (error) {
        console.log(error)
      }
    }
    console.log('vehicleResultsArray :', vehicleResultsArray);
    res.render('searchResult.ejs', { vehicles: vehicleResultsArray });
  } catch (error) {
    console.log(error)
  }
}
// clientCL.details(listing).then(detail => {
//   let title = detail.title.toLowerCase();
//   let make = req.body.make.toLowerCase();
//   let model = req.body.model.toLowerCase();
//   if(title.includes(`${make}`) && title.includes(`${model}`) && title.includes(`${req.body.year}`)){
//     let vehicleResult = new Vehicles(detail);
//     vehicleResultsArray.push(vehicleResult);

function saveToDatabase(req, res) {
  const instruction = `INSERT INTO vehicles(title, lat, long, image_URL, CL_URL)
  VALUES ($1, $2, $3, $4, $5)`;
  let values = [req.body.title, req.body.lat, req.body.long, req.body.image, req.body.url];
  client.query(instruction, values);
  res.status(204).send();
}

app.listen(PORT, () => console.log(`App is running on ${PORT}`));

