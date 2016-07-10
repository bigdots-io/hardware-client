"use strict";

var frames = [
  [
    {y: 0, x: 0, r: 255, g: 255, b: 255},
    {y: 0, x: 1, r: 0, g: 0, b: 0},
    {y: 0, x: 2, r: 0, g: 0, b: 0}
  ],
  [
    {y: 0, x: 0, r: 255, g: 255, b: 255},
    {y: 0, x: 1, r: 255, g: 255, b: 255},
    {y: 0, x: 2, r: 0, g: 0, b: 0}
  ],
  [
    {y: 0, x: 0, r: 255, g: 255, b: 255},
    {y: 0, x: 1, r: 255, g: 255, b: 255},
    {y: 0, x: 2, r: 255, g: 255, b: 255}
  ]
]

class LoadingScene {
  constructor() {
    this.interval = null;
    this.frameIndex = 0;
  }

  start(callback) {
    this.interval = setInterval(() => {
      callback(frames[this.frame]);

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
