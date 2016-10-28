var firebase = require("firebase"),
    DisplayCoupler = require('display-coupler'),
    LedDisplay = require("./led-display");

var config = require('../display-config');

firebase.initializeApp({
  apiKey: "AIzaSyANob4DbCBvpUU1PJjq6p77qpTwsMrcJfI",
  authDomain: "led-fiesta.firebaseapp.com",
  databaseURL: "https://led-fiesta.firebaseio.com"
});

var displayCoupler = new DisplayCoupler(firebase.database(), {
  height: config.height,
  width: config.width
});

var ledDisplay = new LedDisplay({
  rows: config.width,
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
