"use strict";

var MatrixProcessor = require('./processors/matrix-processor');

var frames = [
  {
    '0:0': {hex: '#FFFFFF'},
    '0:1': {hex: '#000000'},
    '0:2': {hex: '#000000'}
  }, {
    '0:0': {hex: '#FFFFFF'},
    '0:1': {hex: '#FFFFFF'},
    '0:2': {hex: '#000000'}
  }, {
    '0:0': {hex: '#FFFFFF'},
    '0:1': {hex: '#FFFFFF'},
    '0:2': {hex: '#FFFFFF'}
  }
];

class LoadingScene {
  constructor() {
    this.interval = null;
    this.frameIndex = 0;
    this.processedFrames = [];
  }

  start(callback) {
    var matrixProcessor = new MatrixProcessor({
      brightness: 10
    });

    frames.forEach((frame) => {
      this.processedFrames.push(matrixProcessor.process(frame));
    });

    this.interval = setInterval(() => {
      callback(this.processedFrames[this.frameIndex]);

      if(this.frameIndex == frames.length - 1) {
        this.frameIndex = 0;
      } else {
        this.frameIndex = this.frameIndex + 1;
      }
    }, 250);
  }

  stop() {
    clearInterval(this.interval);
  }
}

module.exports = LoadingScene;
