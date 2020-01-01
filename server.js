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

