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
app.post('/save', saveToDatabase);
app.get('/contact', (req, res) => {
  res.render('contact');
})

//Route Error
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

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
          console.log('detail', detail);
          let vehicleResult = new Vehicles(detail);
          vehicleResultsArray.push(vehicleResult);
        })))
    .catch((err) => {
      console.error(err);
    });
  console.log(vehicleResultsArray);
  res.render('searchResult.ejs', { vehicles: vehicleResultsArray });
  vehicleResultsArray = [];
}


function saveToDatabase(req, res) {
  const instruction = `INSERT INTO vehicles(title, lat, long, image_URL, CL_URL)
  VALUES ($1, $2, $3, $4, $5)`;
  let values = [req.body.title, req.body.lat, req.body.long, req.body.image, req.body.url];
  client.query(instruction, values);
  res.status(204).send();
}

function errorHandler(error, response) {
  response.render('pages/error', {
    message: error
  });
}

app.listen(PORT, () => console.log(`App is running on ${PORT}`));

