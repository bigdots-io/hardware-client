var firebase = require("firebase"),
    LedDisplay = require("./led-display"),
    DisplayCoupler = require('display-coupler'),
    MatrixProcessor = require('./processors/matrix-processor');

firebase.initializeApp({
  apiKey: "AIzaSyANob4DbCBvpUU1PJjq6p77qpTwsMrcJfI",
  authDomain: "led-fiesta.firebaseapp.com",
  databaseURL: "https://led-fiesta.firebaseio.com"
});

var matrixProcessor = new MatrixProcessor();

var displayCoupler = new DisplayCoupler(firebase.database());

var hardwareKey = "-KLZ3jG7vjm2grCj33y7";
var hardwareRef = firebase.database().ref(`hardware/${hardwareKey}/`);

hardwareRef.once('value', function(snapshot) {
  var hardwareData = snapshot.val();
  var ledDisplay = new LedDisplay({
    rows: hardwareData.rows,
    chains: hardwareData.chains,
    parallel: hardwareData.parallel
  });

  var onPixelChange = function(y, x, hex, displayData) {
    displayData = displayData || {};
    ledDisplay.updateDot(matrixProcessor.processDot(y, x, hex, displayData));
  }

  displayCoupler.startUp({ onPixelChange: onPixelChange });

  console.log('Starting up');

  setTimeout(function() {
    displayCoupler.connect(hardwareData.display, {
      onPixelChange: onPixelChange
    });
  }, 5000);
});
