'use strict';

require('dotenv').config();
const PORT = process.env.PORT;
const express = require('express');
const superagent = require('superagent');
const app = express();
const pg = require('pg');
const ejs = require('ejs');
const methodoverride = require('method-override');

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(methodoverride('_method'));

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => console.error(error));
client.connect();

let vehicleResultsArray = [];

function Vehicles(listing) {
  this.title = listing.title;
  this.lat = listing.mapUrl.slice(37, 45);
  this.long = listing.mapUrl.slice(47, 57);
  this.image = listing.images[0];
  this.url = listing.url;
}

app.get('/', getSearchPage);
app.post('/', postSearchResults);

app.get('/contact', (req, res) => {
  res.render('contact');
})

app.get('/aboutus', (req, res) => {
  res.render('aboutus');
})

function getSearchPage(req, res) {
  res.render('index');
}

function postSearchResults(req, res) {

  const
    craigslist = require('node-craigslist'),
    clientCL = new craigslist.Client({
      city: req.body.location
    }),
    options = {
      category: 'cta',
    };

  clientCL
    .search(options, `${req.body.year} ${req.body.make} ${req.body.model}`)
    .then((listings) =>
      listings.forEach(listing =>
        clientCL.details(listing).then(detail => {
          let vehicleResult = new Vehicles(detail);
          saveDatatoDatabase(vehicleResult);
          vehicleResultsArray.push(vehicleResult);
        })))
    .catch((err) => {
      console.error(err);
    });
  console.log(vehicleResultsArray);
  res.render('searchResult.ejs', { vehicles: vehicleResultsArray });
}

function saveDatatoDatabase(vehicleConst) {
  console.log('vehicleConst :', vehicleConst);
  const instructions = `INSERT INTO vehicles (title, lat, long, image_URL, CL_URL) VALUES ($1, $2, $3, $4, $5)`;
  const values = [vehicleConst.title, vehicleConst.lat, vehicleConst.long, vehicleConst.image, vehicleConst.url];
  client.query(instructions, values);
}

app.listen(PORT, () => console.log(`App is running on ${PORT}`));
