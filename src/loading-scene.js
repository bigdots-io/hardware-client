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
    this.frame = 0;
  }

  start(callback) {
    this.interval = setInterval(() => {
      callback(frames[this.frame]);
      if(this.frame == frames.length) {
        this.frame = 0;
      } else {
        this.frame = this.frame + 1;
      }
    }, 250);
  }

  stop() {
    clearInterval(this.interval);
  }
}

module.exports = LoadingScene;
