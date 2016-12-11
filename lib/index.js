var firebase = require("firebase"),
    DisplayCoupler = require('display-coupler'),
    LedDisplay = require("./led-display"),
    Processor = require("./processor");

var config = require('../display-config');

var processor = new Processor();

firebase.initializeApp({
  apiKey: "AIzaSyC8C93oYUP3Pt_0GlXZ85EO5aozVGpsngA",
  authDomain: "bigdots-b46cc.firebaseapp.com",
  databaseURL: "https://bigdots-b46cc.firebaseio.com"
});

var displayCoupler = new DisplayCoupler(firebase.database(), {
  height: config.height,
  width: config.width
});

var ledDisplay = new LedDisplay({
  rows: config.height,
  chains: config.chains,
  parallel: config.parallel
});

console.log('Starting up');

displayCoupler.connect(config.display, {
  onPixelChange: function(y, x, hex, displayData) {
    displayData = displayData || {};
    ledDisplay.updateDot(processor.processDot(y, x, hex, displayData));
  }
});
