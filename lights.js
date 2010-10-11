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
 * @param {function(this:Material, light)} closure Callback from the material
 *     shader that will be executed per light.
 * @param {Material} context The context the closure will run in.
 */
Lights.prototype.forEachLight = function(closure, context) {
  for (var i = 0; i < this.lights_.length; i++) {
    closure.call(context, this.lights_[i]);
  }
};


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
 * @return {{lightVisible:boolean, direction:Vector3, color:Vector3}}
 *     lightVisible is true if the point can see the light, direction is the
 *     incoming direction of the light on the point and color holds the color
 *     (and intensity) of the light arriving at the point.
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
  var shadowTest = intersectRayWithScene(ray, true);
  var lightVisible = (shadowTest === undefined ||
                      Math.abs(shadowTest.t -
                               DirectionalLight.LIGHT_STEP_SIZE_) < 1e-2);
  // Build the response.
  var r = {};
  r.lightVisible = lightVisible;
  r.direction = this.direction_;
  r.color = this.color_;

  return r;
};
