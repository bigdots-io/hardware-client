var firebase = require("firebase");
    LedMatrix = require("node-rpi-rgb-led-matrix"),
    MatrixProcessor = require('./processors/matrix-processor'),
    KeyframeProcessor = require('./processors/keyframe-processor');

var matrix = new LedMatrix(16, 3, 1);

firebase.initializeApp({
  apiKey: "AIzaSyANob4DbCBvpUU1PJjq6p77qpTwsMrcJfI",
  authDomain: "led-fiesta.firebaseapp.com",
  databaseURL: "https://led-fiesta.firebaseio.com",
  serviceAccount: "accountService.json"
});
var rootRef = firebase.database().ref();

var displayID = '-KJYAuwg3nvgTdSaGUU9';

var displayRef = firebase.database().ref('displays/' + displayID + '/');

var matrixData;

displayRef.once('value', function(snapshot) {
	var displayData = snapshot.val();

	var matrixRef = firebase.database().ref('matrices/' + displayData.matrix);

	if(!displayData.keyframe) {
		displayRef.on('child_changed', function(snapshot) {
			if(snapshot.key === 'brightness') {
				var brightness = snapshot.val();

        var matrixProcessor = new MatrixProcessor({ brightness: brightness });

				matrixProcessor.process(matrixData).forEach(function(data) {
					matrix.setPixel(data.x, data.y, data.r, data.g, data.b)
				});
			}
		});

		matrixRef.once('value').then(function(snapshot) {
			matrixData = snapshot.val();

      var matrixProcessor = new MatrixProcessor(displayData);

      matrixProcessor.process(matrixData).forEach(function(data) {
        matrix.setPixel(data.x, data.y, data.r, data.g, data.b)
      });

			processedData.forEach(function(data) {
				matrix.setPixel(data.x, data.y, data.r, data.g, data.b)
			});

			matrixRef.on('child_changed', function(snapshot) {
				var data = matrixProcessor.processDot(snapshot.key, snapshot.val().hex);
				matrix.setPixel(data.x, data.y, data.r, data.g, data.b)
			});
		});
	} else {
		var keyframeRef = firebase.database().ref('keyframes/' + displayData.keyframe);
		keyframeRef.once('value').then(function(snapshot) {
			var keyframeData = snapshot.val();

      new KeyFrameProcessor(new MatrixProcessor(displayData), displayData);
      var processedKeyframes = keyFrameProcessor.process(keyframeData);

      var animator = new Animator(processedKeyframes, { speed: keyframeData.speed});

      animator.start(function(data) {
        matrix.setPixel(data.x, data.y, data.r, data.g, data.b)
      });
		});
	}
});
