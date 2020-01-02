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

let vehicleResultsArray = [];
let inputMake;
let inputModel;
let inputYear;
let inputLocation;

function Vehicles(listing, price) {
  this.title = listing.title;
  this.price = price;
  this.lat = listing.mapUrl.slice(37, 45);
  this.long = listing.mapUrl.slice(46, 57);
  this.image = listing.images[0];
  this.url = listing.url;
}



app.get('/', getSearchPage);
app.post('/', postSearchResults);
app.post('/save', saveToDatabase);
app.get('/savedCars', displaySavedCars);
app.delete('/savedCars/:id', deleteCar);
app.get('/contact', (req, res) => {
  res.render('contact');
});
app.get('/aboutus', (req, res) => {
  res.render('aboutus');
});
app.get('/map', (req, res) => {
  console.log('req.query :', req.query);

  res.render('second', { vehicles: req.query })
});
//Route Error
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

function getSearchPage(req, res) {
  res.render('index');
}

async function postSearchResults(req, res) {
  inputMake = req.body.make;
  inputModel = req.body.model;
  inputYear = req.body.year;
  inputLocation = req.body.location;
  vehicleResultsArray = [];
  const clientCL = new craigslist.Client({
      city: req.body.location
    }),
    options = {
      category: 'cta',
    };
  try {
    let listings = await clientCL.search(options, `${req.body.year} ${req.body.make} ${req.body.model}`)
    for (let i = 0; i < 20; i++) {
      try {
        let listingInfo = await clientCL.details(listings[i])
        let title = listingInfo.title.toLowerCase();
        let make = req.body.make.toLowerCase();
        let model = req.body.model.toLowerCase();
        if (title.includes(`${make}`) && title.includes(`${model}`)) {
          let vehicleResult = new Vehicles(listingInfo, listings[i].price);
          vehicleResultsArray.push(vehicleResult);
        }
      } catch (error) {
        errorHandler(error, res);
      }
    }
    res.render('searchResult', { vehicles: vehicleResultsArray });
  } catch (error) {
    errorHandler(error, res);
  }
}

async function saveToDatabase(req, res) {
  let marketValue = await retrieveAndReturnMarketPrice();
  const checkInstruction = `Select * FROM vehicles WHERE title = $1`;
  const value = [req.body.title];
  client.query(checkInstruction, value).then(sqlResult => {
    if (sqlResult.rowCount > 0) {
      console.log('The vehicle is already here');
      res.status(204).send();
    } else {
      const instruction = `INSERT INTO vehicles(title, lat, long, image_URL, CL_URL, price, market_value)
  VALUES ($1, $2, $3, $4, $5, $6, $7)`;
      let values = [req.body.title, req.body.lat, req.body.long, req.body.image, req.body.url, req.body.price, marketValue];
      try {
        client.query(instruction, values);
        res.status(204).send();
      }
      catch (error) {
        errorHandler(error, res);
      }
    }
  })
}

function retrieveAndReturnMarketPrice() {
  return new Promise((resolve, reject) => {
    superagent.get(`https://marketcheck-prod.apigee.net/v1/sales?api_key=${MC_API_KEY}&ymm=${inputYear}|${inputMake}|${inputModel}&city=${inputLocation}`).then(marketcheckResponse => {
      const data = JSON.parse(marketcheckResponse.text);
      resolve(data.price_stats.mean)
    })
  })
}

function displaySavedCars(req, res) {
  client.query(`SELECT * FROM vehicles;`).then(savedCars => {
    res.render('savedCars.ejs', { vehicles: savedCars.rows });
  }).catch(error => {
    errorHandler(error, res);
  })
}

function deleteCar(req, res) {
  client.query(`DELETE from vehicles WHERE id=$1;`, [req.params.id]).then(() => {
    res.redirect('/savedCars');
  })
}

function errorHandler(error, response) {
  response.render('error', {
    message: error
  });
}

app.listen(PORT, () => console.log(`App is running on ${PORT}`));
