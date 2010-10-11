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
 * A simple 3D vector class.
 */

/**
 * Create a new Vector3.
 * @param {?number} opt_x The x component.
 * @param {?number} opt_y The y component.
 * @param {?number} opt_z The z component.
 * @constructor
 */
function Vector3(opt_x, opt_y, opt_z) {
  this.set(opt_x || 0, opt_y || 0, opt_z || 0);
}


/**
 * Sets the components of the vector.
 * @param {number} x The x component.
 * @param {number} y The y component.
 * @param {number} z The z component.
 */
Vector3.prototype.set = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
};


/**
 * Create a new Vector3 instance from another.
 * @param {Vector3} v The vector to duplicate.
 * @return {Vector3} A new instance that duplicates v.
 */
Vector3.copyFrom = function(v) {
  return new Vector3(v.x, v.y, v.z);
};


/**
 * Normalize the vector to unit-length.
 * @return {Vector3} this To allow for chaining.
 */
Vector3.prototype.normalize = function() {
  var length = this.length();
  if (length > 1e-4) {
    this.x /= length;
    this.y /= length;
    this.z /= length;
  }

  return this;
};

/**
 * Compute the dot product between two vectors: a . b
 * @param {Vector3} a Input vector.
 * @param {Vector3} b Input vector.
 * @return {number} The dot product of a & b.
 */
Vector3.dot = function(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
};

/**
 * Subtract two vectors and return the result in a new Vector3: a - b
 * @param {Vector3} a The vector to subtract from.
 * @param {Vector3} b The vector to subtract.
 * @return {Vector3} Result of the subtraction.
 */
Vector3.subtract = function(a, b) {
  return new Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
};


/**
 * Add two vectors together and return the result in a new instance.
 * @param {Vector3} a One of the vectors.
 * @param {Vector3} b The other vector.
 * @return {Vector3} Result of the addition.
 */
Vector3.add = function(a, b) {
  return new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
};


/**
 * Add a vector onto this instance.
 * @param {Vector3} v The vector to be added in.
 * @return {Vector3} The instance, to allow for chaining.
 */
Vector3.prototype.add = function(v) {
  this.x += v.x;
  this.y += v.y;
  this.z += v.z;
  return this;
};


/**
 * Scale the components of the vector by a scalar factor.
 * @param {number} factor The scale factor.
 * @return {Vector3} The instance, to allow for chaining.
 */
Vector3.prototype.scale = function(factor) {
  this.x *= factor;
  this.y *= factor;
  this.z *= factor;
  return this;
};


/**
 * Create a new vector that is a scaled copy of the input.
 * @param {Vector3} v The vector to be scaled and copied.
 * @param {number} factor The scale factor.
 * @return {Vector3} A scaled copy of the input vector.
 */
Vector3.scale = function(v, factor) {
  return new Vector3(v.x * factor,
                     v.y * factor,
                     v.z * factor);
};


/**
 * Perform a component-wise scaling of the input vector.
 * @param {Vector3} v The vector to be scaled.
 * @param {Vector3} factor Per-component scale factors.
 * @return {Vector3} A copy of the input vector with it's components scaled.
 */
Vector3.componentScale = function(v, factor) {
  return new Vector3(v.x * factor.x,
                     v.y * factor.y,
                     v.z * factor.z);
};

/**
 * Perform a component-wise scaling of the vector.
 * @param {Vector3} factor Per-component scale factors.
 * @return {Vector3} this To allow for chaining.
 */
Vector3.prototype.componentScale = function(factor) {
  this.x *= factor.x;
  this.y *= factor.y;
  this.z *= factor.z;
  return this;
};


/**
 * Performs a scaled addition of another vector to this instance.
 * @param {Vector3} v The vector to be added.
 * @param {number} factor The scale factor.
 * @return {Vector3} The instance, to allow for chaining.
 */
Vector3.prototype.addMul = function(v, factor) {
  this.x += v.x * factor;
  this.y += v.y * factor;
  this.z += v.z * factor;
  return this;
};


/**
 * Returns a Vector3 that holds the result of adding a scaled copy of one
 * vector to another: a + b * factor.
 * @param {Vector3} a The vector to be added to.
 * @param {Vector3} b The vector to be scaled and then added.
 * @param {number} factor The scale factor.
 * @return {Vector3} The result.
 */
Vector3.addMul = function(a, b, factor) {
  return new Vector3(a.x + b.x * factor,
                     a.y + b.y * factor,
                     a.z + b.z * factor);
};


/**
 * Return the negated copy of a vector.
 * @param {Vector3} v The input vector.
 * @return {Vector3} A copy of the input vector, with each component negated.
 */
Vector3.negate = function(v) {
  return new Vector3(-v.x, -v.y, -v.z);
};


/**
 * Compute the length of the vector.
 * @return {number} The length of the vector.
 */
Vector3.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
};


/**
 * Reflect the vector v around another vector n.
 * Assumes that n is unit-length.
 * @param {Vector3} v The vector to be reflected.
 * @param {Vector3} n The vector to reflect around.
 * @return {Vector3} The reflected vector.
 */
Vector3.reflect = function(v, n) {
  // Formula: v' = v - 2 * n * v . n
  var scaledN = Vector3.copyFrom(n);
  scaledN.scale(Vector3.dot(v, n) * 2);
  return Vector3.subtract(v, scaledN);
};


/**
 * A 2D vector class.
 * @param {number} x The x component.
 * @param {number} y The y component.
 * @constructor
 */
function Vector2(x, y) {
  this.set(x, y);
}


/**
 * Directly sets the individual components of this instance.
 * @param {number} x The x component.
 * @param {number} y The y component.
 * @return {Vector2} This instance, to allow for chaining.
 */
Vector2.prototype.set = function(x, y) {
  this.x = x;
  this.y = y;

  return this;
};


/**
 * Adds two vectors together and returns the result in a new vector.
 * @param {Vector2} a One of the vectors to be added.
 * @param {Vector2} b The other vector to be added.
 * @return {Vector2} The result of the addition operation.
 */
Vector2.add = function(a, b) {
  return new Vector2(a.x + b.x, a.y + b.y);
};


/**
 * Adds another vector into this instance.
 * @param {Vector2} p The vector to be added.
 * @return {Vector2} This instance, to allow for chaining.
 */
Vector2.prototype.add = function(p) {
  this.x += p.x;
  this.y += p.y;

  return this;
};
