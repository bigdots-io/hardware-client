"use strict";

var LedMatrix = require("node-rpi-rgb-led-matrix");

class LedDisplay {
  constructor(config) {
    var {rows, chains, parallel} = config
    this.display = new LedMatrix(rows, chains, parallel);
  }

  update(dots) {
    dots.forEach((dot) => {
      this.updateDot(dot)
    });
  }

  updateDot(dot) {
    this.display.setPixel(dot.x, dot.y, dot.r, dot.g, dot.b)
  }
}

module.exports = LedDisplay;
