var firebase = require("firebase");
var LedMatrix = require("node-rpi-rgb-led-matrix");
var Color = require("color");

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

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function shadeHex(color, percent) {   
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

function processDot(key, hex, brightness) {
	var rawCoordinates = key.split(':'),
    	    rgb = hexToRgb(shadeHex(hex, -((100 - brightness) / 100)));

	return {
		y: parseInt(rawCoordinates[0], 10), 
		x: parseInt(rawCoordinates[1], 10),
		r: rgb.r,
		g: rgb.g,
		b: rgb.b
	};
}

var matrixData;

displayRef.once('value', function(snapshot) {
	var displayData = snapshot.val(); 

	var matrixRef = firebase.database().ref('matrices/' + displayData.matrix);

	if(!displayData.keyframe) {
		displayRef.on('child_changed', function(snapshot) {
			if(snapshot.key === 'brightness') {
				var brightness = snapshot.val();
				var processedData = [];
			
				for(var key in matrixData) {
					processedData.push(processDot(key, matrixData[key].hex, brightness));
				}

				processedData.forEach(function(data) {
					matrix.setPixel(data.x, data.y, data.r, data.g, data.b)
				});
			}
		});	

		matrixRef.once('value').then(function(snapshot) {
			matrixData = snapshot.val();
			var processedData = [];
			var data

			for(var key in matrixData) {
				processedData.push(processDot(key, matrixData[key].hex, displayData.brightness));
			}

			processedData.forEach(function(data) {
				matrix.setPixel(data.x, data.y, data.r, data.g, data.b)
			});

			matrixRef.on('child_changed', function(snapshot) {
				var data = processDot(snapshot.key, snapshot.val().hex, displayData.brightness);
				matrix.setPixel(data.x, data.y, data.r, data.g, data.b)
			});
		});
	} else {
		keyframeRef = firebase.database().ref('keyframes/' + displayData.keyframe);
		keyframeRef.once('value').then(function(snapshot) {
			keyframeData = snapshot.val();
			var speed = keyframeData.speed;

			console.log(keyframeData)
			
			var processedKeyframes = [];
			
			for(var frameKey in keyframeData.frames) {
				var processedKeyframe = [];
				for(var key in keyframeData.frames[frameKey]) {
					processedKeyframe.push(processDot(key, keyframeData.frames[frameKey][key].hex, displayData.brightness));
				}
				processedKeyframes.push(processedKeyframe);
			}

			var index = 0;
			setInterval(function() {
				processedKeyframes[index].forEach(function(data) {
					matrix.setPixel(data.x, data.y, data.r, data.g, data.b)
				});

				if(index >= processedKeyframes.length - 1) {
					index = 0;
				} else {
					index = index + 1;
				}
			}, speed)
		});
	}
});
