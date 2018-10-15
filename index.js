/**
  * Copyright (c) 2015 EcoTa.co, All rights reserved.
  */
'use strict';

//Load env variable
const dotenv = require('dotenv');
dotenv.load();

// New relic
if (process.env.NODE_ENV === 'production') {
  require('newrelic');
}

const express     = require('express');
const app         = express();
const http        = require('http').Server(app);
const io          = require('socket.io')(http);
const request     = require('request').defaults({ encoding: null });
const bodyParser  = require('body-parser');
const path        = require('path');

// Application configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'views'));

/////////////////////////
// Routes definitions //
////////////////////////

// Homepage
app.get('/', function(req, res) {
  res.render('index');
})

// Fire up the web server
const port = Number(process.env.PORT || 3000);
const server = http.listen(port, function() {
  console.log("BotTwitter started and listening on port " + port);
});

/////////////////////////
// Twitt Bot           //
////////////////////////

//Configuration
const Twit = require('twit'),
      config = require('config'),
      async = require('async');

const T = new Twit(config.get("Twitter"));

// let twitter = require('./lib/twitter');
// twitter = new twitter({
//   consumer_key: config.get("Twitter.consumer_key"),
//   consumer_secret: config.get("Twitter.consumer_secret"),
//   token: config.get("Twitter.access_token"),
//   token_secret: config.get("Twitter.access_token_secret")
// });

//Stream
const lilleFlandre = ['2.944336','50.499452','3.262939','50.736455'];

const stream = T.stream('statuses/filter', { locations: [lilleFlandre] });

stream.on('tweet', function (tweet) {
  console.log(tweet);
  io.emit('tweet', {
    message: tweet.text,
    user_name: tweet.user.name,
    user_image: tweet.user.profile_image_url,
    place: tweet.place.full_name,
    geoJSON: tweet.coordinates
  });
});

stream.on('error', function(error) {
  console.log(error)
});
