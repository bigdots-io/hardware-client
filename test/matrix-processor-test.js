var assert = require('chai').assert,
    testData = require('./test-data'),
    MatrixProcessor = require('../processors/matrix-processor');

describe('MatrixProcessor', function() {
  var matrixProcessor = new MatrixProcessor({
    brightness: 100
  });

  describe('#process()', function () {
    it('should return an array of transformed dots', function () {
      var processedMatrix = matrixProcessor.process(testData.rawMatrix);
      assert.deepEqual(processedMatrix, [
        {y: 0, x: 0, r: 0, b: 0, g: 0},
        {y: 0, x: 1, r: 0, b: 0, g: 0},
        {y: 1, x: 0, r: 0, b: 0, g: 0},
        {y: 1, x: 1, r: 255, b: 255, g: 255}
      ]);
    });
  });
});
