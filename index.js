/**
  * Copyright (c) 2015 EcoTa.co, All rights reserved.
  */
'use strict';

//Load env variable
var dotenv = require('dotenv');
dotenv.load();

// New relic
if (process.env.NODE_ENV === 'production') {
  require('newrelic');
}

var express     = require('express');
var app         = express();
var http        = require('http').Server(app);
var io          = require('socket.io')(http);
var request     = require('request').defaults({ encoding: null });
var bodyParser  = require('body-parser');
var path        = require('path');

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
var port = Number(process.env.PORT || 3000);
var server = http.listen(port, function() {
  console.log("TweetAJoke started and listening on port " + port);
});

/////////////////////////
// Twitt Bot           //
////////////////////////

//Configuration
var Twit = require('twit'),
    config = require('config'),
    async = require('async');

var twitter = require('./lib/twitter');

var T = new Twit(config.get("Twitter")),

twitter = new twitter({
  consumer_key: config.get("Twitter.consumer_key"),
  consumer_secret: config.get("Twitter.consumer_secret"),
  token: config.get("Twitter.access_token"),
  token_secret: config.get("Twitter.access_token_secret")
});

//Stream
var lilleFlandre = ['3.069242','50.636045', '3.073975', '50.636500' ],
    lilleEurope = ['3.069242','50.636045', '3.073975', '50.636500' ],
    aeroportLesquin = ['3.0850982666015625','50.55952368675604', '3.1238937377929688', '50.57522461569038' ],
    gareDuNord = ['2.353612', '48.880108', '2.357630', '48.882527' ];

var stream = T.stream('statuses/filter', { locations: [lilleFlandre, aeroportLesquin, gareDuNord] });

stream.on('tweet', function (tweet) {
  
  //Partern matching (Gare)
  if (/gare/i.test(tweet.text)) {
    io.emit('tweet', {
      message: tweet.text,
      user_name: tweet.user.name,
      user_image: tweet.user.profile_image_url,
      place: tweet.place.full_name,
      geoJSON: tweet.coordinates
    });
  } else if (tweet.coordinates != null) {
    
    var bb = {
      ix:3.069242,
      iy:50.636045, 
      ax:3.073975, 
      ay:50.636500
    }
    // bb is the bounding box, (ix,iy) are its top-left coordinates, 
    // and (ax,ay) its bottom-right coordinates
    if(bb.ix <= tweet.coordinates[0] && tweet.coordinates[0] <= bb.ax && bb.iy <= tweet.coordinates[1] && tweet.coordinates[0] <= bb.ay ) {
      io.emit('tweet', {
        message: tweet.text,
        user_name: tweet.user.name,
        user_image: tweet.user.profile_image_url,
        place: tweet.place.full_name,
        geoJSON: tweet.coordinates
      });
    }
  }  
});

stream.on('error', function(error) {
  console.log(error)
});