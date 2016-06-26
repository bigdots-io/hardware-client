var firebase = require("firebase");
    LedDisplay = require("./led-display"),
    MatrixProcessor = require('./processors/matrix-processor'),
    KeyframeProcessor = require('./processors/keyframe-processor');

var ledDisplay = new LedDisplay({
  rows: 16,
  chains: 3,
  parallel: 1
});

firebase.initializeApp({
  apiKey: "AIzaSyANob4DbCBvpUU1PJjq6p77qpTwsMrcJfI",
  authDomain: "led-fiesta.firebaseapp.com",
  databaseURL: "https://led-fiesta.firebaseio.com",
  serviceAccount: "accountService.json"
});

var displayID = '-KJYAuwg3nvgTdSaGUU9';

var displayRef = firebase.database().ref(`displays/${displayID}/`);

var matrixData;

displayRef.once('value', function(snapshot) {
	var displayData = snapshot.val();

	var matrixRef = firebase.database().ref(`matrices/${displayData.matrix}`);

	if(!displayData.keyframe) {
		matrixRef.once('value').then(function(snapshot) {
			matrixData = snapshot.val();

      var matrixProcessor = new MatrixProcessor(displayData);
      console.log('here')
      ledDisplay.update(matrixProcessor.process(matrixData));

			matrixRef.on('child_changed', function(snapshot) {
        var key = snapshot.key,
            hex = snapshot.val().hex;

				ledDisplay.updateDot(matrixProcessor.processDot(key, hex));
			});

      displayRef.on('child_changed', function(snapshot) {
        if(snapshot.key === 'brightness') {
          var brightness = snapshot.val();

          matrixProcessor = new MatrixProcessor({ brightness: brightness });

          ledDisplay.update(matrixProcessor.process(matrixData));
        }
      });
		});
	} else {
		var keyframeRef = firebase.database().ref(`keyframes/${displayData.keyframe}`);
		keyframeRef.once('value').then(function(snapshot) {
			var keyframeData = snapshot.val();

      var keyframeProcessor = new KeyframeProcessor(new MatrixProcessor(displayData));
      var processedKeyframes = keyframeProcessor.process(keyframeData.frames);

      var animator = new Animator(processedKeyframes, {speed: keyframeData.speed});

      animator.start(function(data) {
        ledDisplay.updateDot(data);
      });
		});
	}
});
