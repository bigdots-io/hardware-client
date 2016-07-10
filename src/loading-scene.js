"use strict";

var MatrixProcessor = require('./processors/matrix-processor');

var frames = [
  {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#000000'},
    '0:2': {hex: '#000000'},
    '0:3': {hex: '#000000'},
    '0:4': {hex: '#000000'},
    '0:5': {hex: '#000000'},
    '0:6': {hex: '#000000'},
    '0:7': {hex: '#000000'}
  }, {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#CC4400'},
    '0:2': {hex: '#000000'},
    '0:3': {hex: '#000000'},
    '0:4': {hex: '#000000'},
    '0:5': {hex: '#000000'},
    '0:6': {hex: '#000000'},
    '0:7': {hex: '#000000'}
  }, {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#CC4400'},
    '0:2': {hex: '#FFAA00'},
    '0:3': {hex: '#000000'},
    '0:4': {hex: '#000000'},
    '0:5': {hex: '#000000'},
    '0:6': {hex: '#000000'},
    '0:7': {hex: '#000000'}
  }, {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#CC4400'},
    '0:2': {hex: '#FFAA00'},
    '0:3': {hex: '#CCCC00'},
    '0:4': {hex: '#000000'},
    '0:5': {hex: '#000000'},
    '0:6': {hex: '#000000'},
    '0:7': {hex: '#000000'}
  }, {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#CC4400'},
    '0:2': {hex: '#FFAA00'},
    '0:3': {hex: '#CCCC00'},
    '0:4': {hex: '#88CC00'},
    '0:5': {hex: '#000000'},
    '0:6': {hex: '#000000'},
    '0:7': {hex: '#000000'}
  }, {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#CC4400'},
    '0:2': {hex: '#FFAA00'},
    '0:3': {hex: '#CCCC00'},
    '0:4': {hex: '#88CC00'},
    '0:5': {hex: '#00CC88'},
    '0:6': {hex: '#000000'},
    '0:7': {hex: '#000000'}
  }, {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#CC4400'},
    '0:2': {hex: '#FFAA00'},
    '0:3': {hex: '#CCCC00'},
    '0:4': {hex: '#88CC00'},
    '0:5': {hex: '#00CC88'},
    '0:6': {hex: '#0066CC'},
    '0:7': {hex: '#000000'}
  }, {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#CC4400'},
    '0:2': {hex: '#FFAA00'},
    '0:3': {hex: '#CCCC00'},
    '0:4': {hex: '#88CC00'},
    '0:5': {hex: '#00CC88'},
    '0:6': {hex: '#0066CC'},
    '0:7': {hex: '#CC00CC'}
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
      brightness: 50
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
    }, 100);
  }

  stop() {
    clearInterval(this.interval);
  }
}

module.exports = LoadingScene;
