var LedMatrix = require("node-rpi-rgb-led-matrix");

var matrix = new LedMatrix(16);
console.log(matrix.brightness)
console.log(matrix.brightness())
matrix.setBrightness(10);
matrix.fill(255, 50, 100);
setTimeout(function() {
	matrix.setPixel(0, 0, 0, 50, 255);
}, 5000);

