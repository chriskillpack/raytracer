// Copyright (c) 2010 Chris Killpack
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/**
 * Class to control image pixel sampling. Uses an iterator style API.
 * Inherit from this class to implement different sampling strategies.
 * Intended use:
 *   [for each pixel]
 *   sampler.reset()
 *   while (sampler.hasNext()) {
 *     var sampleCoordinate = sampler.next();
 *     var imagePlaneCoordinate = imagePlanePixel + sampleCoordinate
 *     ...
 *     sampler.accumulateSample(color)
 *   }
 *   sampler.result()
 * @param {number} numSamples The number of samples per pixel that the image
 *     sampler should take.
 * @constructor
 */
function Sampler(numSamples) {
  /**
   * @type {number}
   * @private
   */
  this.numSamples_ = numSamples;

  /**
   * @type {number}
   * @private
   */
  this.remainingSamples_ = numSamples;

  /**
   * @type {Vector3}
   * @private
   */
  this.colorAccumulator_ = new Vector3(0, 0, 0);
}


/**
 * Does the sampler want another sample point?
 * @return {boolean} True if there is another sample point, False otherwise.
 */
Sampler.prototype.hasNext = function() {
  return this.remainingSamples_ > 0;
};


/**
 * Returns the next sample point within the pixel, or undefined if the
 * iterator is expired.
 * @return {Vector2} The sample point.
 */
Sampler.prototype.next = function() {
  if (this.remainingSamples_ <= 0) {
    return undefined;
  }

  this.remainingSamples_ = this.remainingSamples_ - 1;

  // Setup state for accumulateSample().
  // For now we use a box filter.
  this.sampleWeight = 1 / this.numSamples_;

  return new Vector2(0, 0);
};


/**
 * Reset the sampler for the new image pixel.
 */
Sampler.prototype.reset = function() {
  // Reset for the next pixel.
  this.remainingSamples_ = this.numSamples_;
  this.colorAccumulator_.set(0, 0, 0);
};


/**
 * Add in the color contribution of this image sample. The contribution
 * to the final result is weighted.
 * @param {Vector3} color The color for this sample.
 */
Sampler.prototype.accumulateSample = function(color) {
  this.colorAccumulator_.addMul(color, this.sampleWeight);
};


/**
 * Retrieve the final color of the pixel.
 * @return {Vector3} Pixel color.
 */
Sampler.prototype.result = function() {
  return this.colorAccumulator_;
};
