"use strict";

class Animator {
  constructor(keyframes, config) {
    this.keyframes = keyframes;
    this.config = config;
  }

  start(cb) {
    var index = 0;
    this.interval = setInterval(() => {
      this.keyframes[index].forEach(function(data) {
        cb(data.x, data.y, data.r, data.g, data.b)
      });

      if(index >= this.keyframes.length - 1) {
        index = 0;
      } else {
        index = index + 1;
      }
    }, this.config.speed)
  }
}

module.exports = Animator;
