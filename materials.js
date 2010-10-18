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
 * Base class that all materials must inherit from and implement two methods:
 *   evaluate()
 *       Handles the overall computation for the shading operation, including
 *       processing contributions from all lights.
 *   evaluateRadiance_()
 *       Compute the material's reaction to the irradiance.
 * @constructor
 */
function Material() {
}


/**
 * Evaluate the material with the shade context.
 * @param {ShadeContext} context The shade context.
 * @return {Vector3} The color of the material.
 */
Material.prototype.evaluate = function(context) {
  throw 'evaluate is not implemented.';
  return new Vector3(0, 0, 0);
};


/**
 * Compute the radiance of the material to the incoming light.
 * @param {Irradiance} irradiance The light reaching the point on the material.
 * @param {Vector3} pos The world space position of the point to be shaded.
 * @param {Vector3} normal The geometric normal of the shaded point in world
 *     space.
 * @param {ShadeContext} context The shade context.
 * @return {Vector3} Material reflectance.
 * @private
 */
Material.prototype.evaluateRadiance_ = function(irradiance, pos, normal,
                                                context) {
  throw 'evaluateRadiance_ is not implemented.';
  return new Vector3(0, 0, 0);
};


/**
 * Implements an ambient material.
 * @param {Vector3} color The material color.
 * @constructor
 */
function AmbientMaterial(color) {
  /**
   * @type {Vector3}
   * @private
   */
  this.color_ = color;
}
AmbientMaterial.prototype = new Material();


/**
 * Evaluate the material with the shade context.
 * @param {ShadeContext} context The shade context.
 * @return {Vector3} The color of the material.
 */
AmbientMaterial.prototype.evaluate = function(context) {
  return this.color_;
};


/**
 * Compute the radiance of the AmbientMaterial to the incoming light.
 * @param {Irradiance} irradiance The light reaching the point on the material.
 * @param {Vector3} pos The world space position of the point to be shaded.
 * @param {Vector3} normal The geometric normal of the shaded point in world
 *     space.
 * @param {ShadeContext} context The shade context.
 * @return {Vector3} Material reflectance.
 * @private
 */
AmbientMaterial.prototype.evaluateRadiance_ = function(irradiance, pos, normal,
                                                       context) {
  return this.color_;
};


/**
 * Implements a diffuse material.
 * @param {Vector3} color The diffuse color.
 * @param {?Vector3} opt_ambientColor The ambient color.
 * @constructor
 */
function DiffuseMaterial(color, opt_ambientColor) {
  /**
   * @type {Vector3}
   * @private
   */
  this.color_ = color;

  /**
   * @type {Vector3}
   * @private
   */
  this.ambientColor_ = opt_ambientColor || new Vector3(0, 0, 0);
}
DiffuseMaterial.prototype = new Material();


/**
 * Evaluate the material with the shade context.
 * @param {ShadeContext} context The shade context.
 * @return {Vector3} The color of the material.
 */
DiffuseMaterial.prototype.evaluate = function(context) {
  var worldPos = context.ray.pointOnRay(context.t);

  var color = new Vector3(0, 0, 0);
  g_lights.forEachLight(worldPos, context.normal, function(incidentLight) {
    // Compute the material's response to the incoming light.
    var c = this.evaluateRadiance_(incidentLight, worldPos, context.normal);
    color.add(c);
  }, this);
  var ambient = Vector3.componentScale(this.ambientColor_, this.color_);
  color.add(ambient);

  return color;
};


/**
 * Compute the reflectance of the material to the incoming light.
 * @param {Irradiance} irradiance The light reaching the point on the material.
 * @param {Vector3} pos The world space position of the point to be shaded.
 * @param {Vector3} normal The geometric normal of the point to be shaded.
 * @param {ShadeContext} context The shade context.
 * @return {Vector3} Material reflectance.
 * @private
 */
DiffuseMaterial.prototype.evaluateRadiance_ = function(irradiance, pos,
                                                       normal, context) {
  if (irradiance.lightVisible) {
    var lambert = Math.max(-Vector3.dot(normal,
                                        irradiance.direction), 0);
    var c = Vector3.scale(irradiance.color, lambert);
    c.componentScale(this.color_);
    return c;
  } else {
    return new Vector3(0, 0, 0);
  }
};


/**
 * Implements a specular material.
 * @param {Vector3} specularColor The specular color of the surface.
 * @param {number} specularPower The shininess of the surface.
 * @param {DiffuseMaterial} diffuseMaterial The diffuse material component.
 * @constructor
 */
function SpecularMaterial(specularColor, specularPower, diffuseMaterial) {
  /**
   * @type {Vector3}
   * @private
   */
  this.specularColor_ = specularColor;

  /**
   * @type {number}
   * @private
   */
  this.specularPower_ = specularPower;

  /**
   * @type {Material}
   * @private
   */
  this.diffuseMaterial_ = diffuseMaterial;
}
SpecularMaterial.prototype = new Material();


/**
 * Evaluate the material with the shade context.
 * @param {ShadeContext} context The shade context.
 * @return {Vector3} The color of the material.
 */
SpecularMaterial.prototype.evaluate = function(context) {
  var worldPos = context.ray.pointOnRay(context.t);

  var diffuseColor = new Vector3(0, 0, 0);
  var specularColor = new Vector3(0, 0, 0);
  g_lights.forEachLight(worldPos, context.normal, function(incidentLight) {
    // Compute the diffuse material's reaction to the incident light.
    diffuseColor.add(
      this.diffuseMaterial_.evaluateRadiance_(
        incidentLight, worldPos, context.normal, context));

    // Compute the specular component's reaction to the incident light.
    specularColor.add(
      this.evaluateRadiance_(incidentLight, worldPos, context.normal,
                             context));
  }, this);

  return Vector3.add(diffuseColor, specularColor);
};


/**
 * Compute the reflectance of the material to the incoming light.
 * @param {Irradiance} irradiance The light reaching the point on the material.
 * @param {Vector3} pos The world position of the shaded point.
 * @param {Vector3} normal The geometric normal of the shaded point.
 * @param {ShadeContext} context The shade context.
 * @return {Vector3} Material reflectance.
 * @private
 */
SpecularMaterial.prototype.evaluateRadiance_ = function(irradiance, pos,
                                                        normal, context) {
  var r = Vector3.reflect(context.ray.direction, normal);
  var pow = Math.pow(Math.max(-Vector3.dot(r, irradiance.direction), 0),
                     this.specularPower_);
  return Vector3.scale(irradiance.color, pow);
};


/**
 * Implements a checkerboard material.
 * @param {Material} material1 The material of one set of squares.
 * @param {Material} material2 The material of the other set of squares.
 * @param {number} size The size of the squares.
 * @constructor
 */
function CheckerMaterial(material1, material2, size) {
  this.material1 = material1;
  this.material2 = material2;
  this.size = size;
}

/**
 * Evaluate the material with the shade context.
 * @param {ShadeContext} context The shade context.
 * @return {Vector3} The color of the material.
 */
CheckerMaterial.prototype.evaluate = function(context) {
  // Compute the world position
  var worldPos = context.ray.pointOnRay(context.t);
  var x = Math.floor(worldPos.x / 4) & 1;
  var z = Math.floor(worldPos.z / 4) & 1;
  var material = (x ^ z) ? this.material1 : this.material2;
  return material.evaluate(context);
};
