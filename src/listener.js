var firebase = require("firebase")
var LedMatrix = require("node-rpi-rgb-led-matrix");

var matrix = new LedMatrix(16, 3, 1);

var config = {
  apiKey: "AIzaSyANob4DbCBvpUU1PJjq6p77qpTwsMrcJfI",
  authDomain: "led-fiesta.firebaseapp.com",
  databaseURL: "https://led-fiesta.firebaseio.com",
  storageBucket: "led-fiesta.appspot.com",
  serviceAccount: "/home/pi/led-services/src/accountService.json"
};
firebase.initializeApp(config);
var rootRef = firebase.database().ref();

var displayID = '-KJYAuwg3nvgTdSaGUU9';

var displayRef = firebase.database().ref('displays/' + displayID + '/');

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

displayRef.on('value', function(snapshot) {
	var displayData = snapshot.val(); 

	matrixRef = firebase.database().ref('matrices/' + displayData.matrix);

	console.log('requesting')
	matrixRef.once('value').then(function(snapshot) {
		var matrixData = snapshot.val();
		for(var key in matrixData) {
		    var hex = matrixData[key],
			coordinates = key.split(':');
			var data = {hex: hex, y: parseInt(coordinates[0], 10), x: parseInt(coordinates[1], 10)}
			var rgb = hexToRgb(data.hex)
			matrix.setPixel(data.x, data.y, rgb.r, rgb.g, rgb.b)
		}

		matrixRef.on('child_changed', function(snapshot) {
		    var hex = snapshot.val(),
			coordinates = snapshot.key.split(':');
			var data = {hex: hex, y: parseInt(coordinates[0], 10), x: parseInt(coordinates[1], 10)}
			var rgb = hexToRgb(data.hex)
			matrix.setPixel(data.x, data.y, rgb.r, rgb.g, rgb.b)
		});
	});
});
