var firebase = require("firebase"),
    DisplayCoupler = require('display-coupler');

var LedDisplay = require("./led-display"),
    Processor = require('./processor');

var config = require('./display-config');

if(!config) {
  throw new Error("Please add the configuration json")
}

firebase.initializeApp({
  apiKey: "AIzaSyANob4DbCBvpUU1PJjq6p77qpTwsMrcJfI",
  authDomain: "led-fiesta.firebaseapp.com",
  databaseURL: "https://led-fiesta.firebaseio.com"
});

var processor = new Processor();

var displayCoupler = new DisplayCoupler(firebase.database());

var ledDisplay = new LedDisplay({
  rows: config.rows,
  chains: config.chains,
  parallel: config.parallel
});

console.log('Starting up');

displayCoupler.connect(config.display, {
  onReady: function(displayData, next) {
    displayCoupler.startUp({
      dimensions: {
        width: displayData.width,
        height: displayData.height
      },
      callbacks: {
        onPixelChange: function(y, x, hex) {
          ledDisplay.updateDot(processor.processDot(y, x, hex, {brightness: 30}));
        }
      }
    });

    setTimeout(function() {
      next();
    }, 5000);
  },
  onPixelChange: function(y, x, hex, displayData) {
    displayData = displayData || {};
    ledDisplay.updateDot(processor.processDot(y, x, hex, displayData));
  }
});
