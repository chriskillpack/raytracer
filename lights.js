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
 * Container for all the scene lights.
 * @constructor
 */
function Lights() {
  /**
   * Holds the scene lights.
   * @type {Array.<!Light>}
   * @private
   */
  this.lights_ = new Array();
}


/**
 * Add a light to the scene.
 * @param {Light} light The light to be added.
 */
Lights.prototype.addLight = function(light) {
  this.lights_.push(light);
};


/**
 * Iterate over each light in the scene evaluating it's contribution to the
 * given point and executing the provided material context.
 * @param {Vector3} pos The world position of the point receiving the
 *     light.
 * @param {Vector3} normal The world normal of the point receiving the light.
 * @param {function(this:Material, irradiance)} closure Material shader
 *     callback executed for each light.
 * @param {Material} context The context the closure will run in.
 */
Lights.prototype.forEachLight = function(pos, normal, closure, context) {
  for (var i = 0; i < this.lights_.length; i++) {
    var irradiance = this.lights_[i].evaluateLight(pos, normal);
    closure.call(context, irradiance);
  }
};


/**
 * A POD structure that holds the result of a lighting calculation.
 * @param {Vector3} direction The direction of the irradiance on the point.
 * @param {Vector3} color The color and intensity of the irradiance.
 * @param {boolean} lightVisible Whether the light can see the point or not.
 * @constructor
 */
function Irradiance(direction, color, lightVisible) {
  /**
   * The direction of the irradiance on the point.
   * @type {Vector3}
   */
  this.direction = direction;

  /**
   * The color and intensity of the irradiance.
   * @type {Vector3}
   */
  this.color = color;

  /**
   * Whether the light can see the point.
   * @type {boolean}
   */
  this.lightVisible = lightVisible;
}


/**
 * Implements a directional light.
 * @param {Vector3} direction The normalized direction of the light.
 * @param {Vector3} color The color of the light.
 * @constructor
 */
function DirectionalLight(direction, color) {
  /**
   * The direction the light is shining in.
   * @type {Vector3}
   * @private
   */
  this.direction_ = direction;

  /**
   * The color of the light.
   * @type {Vector3}
   * @private
   */
  this.color_ = color;
}


/**
 * How large of a step to take when building the start point for the
 * shadow test.
 * @const
 * @private
 */
DirectionalLight.LIGHT_STEP_SIZE_ = 10000;


/**
 * Evaluate the directional light as it applies to the provided world
 * position.
 * @param {Vector3} pos The world position of the surface point.
 * @param {Vector3} normal The lighting normal in world space for the surface
 *     point.
 * @return {Irradiance} The result of the light evaluation for the input point.
 */
DirectionalLight.prototype.evaluateLight = function(pos, normal) {
  // Shadow test - can the surface point 'see' the light?
  // Directional lights don't have an source, but we need one for the shadow
  // test. In addition, directional lights don't have perspective shadows
  // so we take the point under consideration and take a very large step
  // along the light's direction 'towards' the light source.
  var lightPosition = Vector3.addMul(pos, this.direction_,
                                     -DirectionalLight.LIGHT_STEP_SIZE_);
  var ray = new Ray(lightPosition, this.direction_);
  var shadowTest = intersectRayWithScene(ray);
  // TODO: This test will be unnecessary once we move to testing ray segments.
  var lightVisible = Math.abs(shadowTest.t -
                              DirectionalLight.LIGHT_STEP_SIZE_) < 1e-2;

  return new Irradiance(this.direction_, this.color_, lightVisible);
};
