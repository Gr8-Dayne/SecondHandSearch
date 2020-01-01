'use strict';

require('dotenv').config();
const PORT = process.env.PORT;
const express = require('express');
const superagent = require('superagent');
const app = express();
const pg = require('pg');
const ejs = require('ejs');
const methodoverride = require('method-override');
const craigslist = require('node-craigslist');
const MC_API_KEY = process.env.MC_API_KEY;

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(methodoverride('_method'));


const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => console.error(error));
client.connect();



function Vehicles(listing, price) {
  this.title = listing.title;
  this.price = price;
  this.lat = listing.mapUrl.slice(37, 45);
  this.long = listing.mapUrl.slice(47, 57);
  this.image = listing.media.photo_links[0];
  this.url = listing.vdp_url;
}



app.get('/', getSearchPage);
app.post('/', retrieveAndReturnSearchResults);
app.post('/save', saveToDatabase);
app.get('/savedCars', displaySavedCars);
app.get('/contact', (req, res) => {
  res.render('contact');
})

//Route Error
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

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
        errorHandler(error, res);
      }
    }
    console.log('vehicleResultsArray :', vehicleResultsArray);
    res.render('searchResult.ejs', { vehicles: vehicleResultsArray });
  } catch (error) {
    errorHandler(error, res);
  }
}

// clientCL.details(listing).then(detail => {
//   let title = detail.title.toLowerCase();
//   let make = req.body.make.toLowerCase();
//   let model = req.body.model.toLowerCase();
//   if(title.includes(`${make}`) && title.includes(`${model}`) && title.includes(`${req.body.year}`)){
//     let vehicleResult = new Vehicles(detail);
//     vehicleResultsArray.push(vehicleResult);









function retrieveAndReturnSearchResults(req, res) {
  console.log('req.body :', req.body);
  superagent.get(`https://marketcheck-prod.apigee.net/v1/sales?api_key=${MC_API_KEY}&ymm=${req.body.year}|${req.body.make}|${req.body.model}&city=${req.body.location}`).then(marketcheckResponse => {
    console.log(JSON.parse(marketcheckResponse.text));
  })
}


function saveToDatabase(req, res) {
  const instruction = `INSERT INTO vehicles(title, lat, long, image_URL, CL_URL)
  VALUES ($1, $2, $3, $4, $5)`;
  let values = [req.body.title, req.body.lat, req.body.long, req.body.image, req.body.url];
  try {
    client.query(instruction, values);
    res.status(204).send();
  }
  catch (error) {
    errorHandler(error, res);
  }
}

function displaySavedCars(req, res) {
  client.query(`SELECT * FROM vehicles;`).then(savedCars => {
    res.render('savedCars.ejs', { vehicles: savedCars.rows });
  }).catch(error => {
    errorHandler(error, res);
  })
}

function errorHandler(error, response) {
  response.render('error', {
    message: error
  });
}

app.listen(PORT, () => console.log(`App is running on ${PORT}`));

