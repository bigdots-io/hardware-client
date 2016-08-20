var firebase = require("firebase"),
    LedDisplay = require("./led-display"),
    DisplayCoupler = require('display-coupler'),
    MatrixProcessor = require('./processors/matrix-processor');

firebase.initializeApp({
  apiKey: "AIzaSyANob4DbCBvpUU1PJjq6p77qpTwsMrcJfI",
  authDomain: "led-fiesta.firebaseapp.com",
  databaseURL: "https://led-fiesta.firebaseio.com"
});

var matrixProcessor = new MatrixProcessor({brightness: 10});

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

  displayCoupler.startUp({
    onPixelChange: function(y, x, hex) {
      ledDisplay.updateDot(matrixProcessor.processDot(`${y}:${x}`, hex));
    }
  });

  console.log('Starting up');

  setTimeout(function() {
    displayCoupler.connect(hardwareData.display, {
      onPixelChange: function(y, x, hex) {
        ledDisplay.updateDot(matrixProcessor.processDot(`${y}:${x}`, hex));
      }
    });
  }, 5000);
});

// displayRef.once('value', function(snapshot) {
// 	var displayData = snapshot.val();
//
// 	var matrixRef = firebase.database().ref(`matrices/${displayData.matrix}`);
  //
	// matrixRef.once('value').then(function(snapshot) {
  //
	// 	matrixData = snapshot.val();
  //
  //   var matrixProcessor = new MatrixProcessor(displayData);
  //
  //   loadingScene.stop();
  //
  //   ledDisplay.update(matrixProcessor.process(matrixData));
  //
  //   console.log('Initial render');
  //
	// 	matrixRef.on('child_changed', function(snapshot) {
  //
  //     var key = snapshot.key,
  //         hex = snapshot.val().hex;
  //
	// 		ledDisplay.updateDot(matrixProcessor.processDot(key, hex));
  //
  //     console.log('matrix child_changed: ', key, hex);
	// 	});
  //
  //   displayRef.on('child_changed', function(snapshot) {
  //     console.log('display child_changed: ', snapshot.key);
  //
  //     if(snapshot.key === 'brightness') {
  //       var brightness = snapshot.val();
  //
  //       matrixProcessor = new MatrixProcessor({ brightness: brightness });
  //
  //       ledDisplay.update(matrixProcessor.process(matrixData));
  //     }
  //   });
	// });
// });
