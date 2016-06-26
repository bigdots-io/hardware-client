var assert = require('chai').assert,
    testData = require('./test-data'),
    KeyFrameProcessor = require('../processors/keyframe-processor'),
    MatrixProcessor = require('../processors/matrix-processor');

describe('KeyFrameProcessor', function() {
  var matrixProcessor = new MatrixProcessor({
    brightness: 100
  });
  var keyFrameProcessor = new KeyFrameProcessor(matrixProcessor);

  describe('#computeDiffs()', function () {
    it('should return an array of only what dots changed', function () {
      var processedFrames = keyFrameProcessor.process(testData.rawFrames);
      assert.deepEqual(processedFrames, [
        [
          {y: 0, x: 0, r: 0, b: 0, g: 0},
          {y: 0, x: 1, r: 0, b: 0, g: 0},
          {y: 1, x: 0, r: 0, b: 0, g: 0},
          {y: 1, x: 1, r: 255, b: 255, g: 255},
        ], [
          {y: 0, x: 1, r: 255, b: 255, g: 255},
          {y: 1, x: 1, r: 0, b: 0, g: 0}
        ]
      ]);
    });
  });
});
