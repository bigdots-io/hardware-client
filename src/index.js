var firebase = require("firebase");
    LedDisplay = require("./led-display"),
    Animator = require('./animator'),
    Display = require('bigdots-display'),
    MatrixProcessor = require('./processors/matrix-processor'),
    KeyframeProcessor = require('./processors/keyframe-processor'),
    LoadingScene = require('./loading-scene');

firebase.initializeApp({
  apiKey: "AIzaSyANob4DbCBvpUU1PJjq6p77qpTwsMrcJfI",
  authDomain: "led-fiesta.firebaseapp.com",
  databaseURL: "https://led-fiesta.firebaseio.com"
});

var matrixProcessor = new MatrixProcessor({brightness: 10});

var loadingScene = new LoadingScene();

var hardwareKey = "-KLZ3jG7vjm2grCj33y7";
var hardwareRef = firebase.database().ref(`hardware/${hardwareKey}/`);

hardwareRef.once('value', function(snapshot) {
  var hardwareData = snapshot.val();
  var ledDisplay = new LedDisplay({
    rows: hardwareData.rows,
    chains: hardwareData.chains,
    parallel: hardwareData.parallel
  });

  loadingScene.start(function(data) {
    ledDisplay.update(data);
  });

  console.log('Starting up');

  var display = new Display(hardwareData.display);

  setTimeout(function() {
    loadingScene.stop();
    display.load({
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
