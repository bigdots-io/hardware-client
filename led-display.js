"use strict";

var LedMatrix = require("node-rpi-rgb-led-matrix");

class LedDisplay {
  constructor({rows, chains, parallel}) {
    this.display = new LedMatrix(rows, chains, parallel);
  }

  update(dots) {
    dots.forEach((data) => {
      this.updateDot(data)
    });
  }

  updateDot(dot) {
    this.display.setPixel(dot.x, dot.y, dot.r, dot.g, dot.b)
  }
}

module.exports = LedDisplay;
