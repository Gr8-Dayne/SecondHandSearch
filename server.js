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


var
  craigslist = require('node-craigslist'),
  clientCL = new craigslist.Client({
    city: 'seattle'
  }),
  options = {
    category: 'cta'
  };

clientCL
  .search(options, 'bmw')
  .then((listings) => listings.forEach(listing => clientCL.details(listing).then(detail => console.log(detail))))
  .catch((err) => {
    console.error(err);
  });

var settings = {
  'url': 'http://api.marketcheck.com/v1/search?api_key={{MARKETCHECK_API}}&year=2014&make=ford&latitude=34.05&longitude=-118.24&radius=100&car_type=used&start=0&rows=2&seller_type=dealer',
  'method': 'GET',
  'timeout': 0,
  'headers': {
    'Host': 'marketcheck-prod.apigee.net'
  },
};

$.ajax(settings).done(function (response) {
  console.log(response);
});


app.listen(PORT, () => console.log(`App is running on ${PORT}`));
