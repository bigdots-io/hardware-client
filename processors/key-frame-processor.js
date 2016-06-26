"use strict";

class KeyFrameProcessor {
  constructor(matrixProcessor) {
    this.matrixProcessor = matrixProcessor;
  }

  process(rawFrames) {
    var processedFrames = [];

    for(var key in rawFrames) {
      processedFrames.push(this.matrixProcessor.process(rawFrames[key]));
    }

    return this.computeDiffs(processedFrames);
  }

  computeDiffs(rawFrames) {
    var processedFrames = [];
    rawFrames.forEach(function(rawFrame, index) {
      if(index == 0) {
        processedFrames.push(rawFrame);
      } else {
        var processedFrame = [];
        rawFrame.forEach(function(rawDot, i) {
          if(JSON.stringify(rawDot) !== JSON.stringify(rawFrames[index - 1][i])) {
            processedFrame.push(rawDot);
          }
        });
        processedFrames.push(processedFrame);
      }
    });
    return processedFrames;
  }
}

module.exports = KeyFrameProcessor;
