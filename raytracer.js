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

var g_context;
var g_frameCount;
var g_width;
var g_height;

function init(canvasId) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) {
    return;
  }
  g_context = canvas.getContext('2d');

  g_width = g_context.canvas.width;
  g_height = g_context.canvas.height;
  g_frameCount = 0;

  initScene();

  setInterval(function() {
    draw();
    g_frameCount = g_frameCount + 1;
  }, 1000 / 30);
}


/**
 * Convert a Vector3 into a CSS color string.
 * @param {Vector3} c Color.
 * @return {string} CSS rgb color.
 */
function colorToString(c) {
  return 'rgb(' + Math.floor(c.x) + ',' + Math.floor(c.y) + ','
         + Math.floor(c.z) + ')';
}


/**
 * Clear the canvas to the specified color.
 * @param {CanvasRenderingContext2D} context The 2D rendering context for a
 *     canvas element.
 * @param {Vector3} color The color to set the canvas to.
 */
function clearBackground(context, color) {
  var c = Vector3.copyFrom(color);
  c.clamp().componentScale(new Vector3(255, 255, 255));

  context.fillStyle = colorToString(c);
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);
}


/**
 * Set a pixel in the canvas to the specified color.
 * @param {CanvasRenderingContext2D} context The 2D rendering context for a
 *     canvas element.
 * @param {number} x The x co-ordinate of the pixel.
 * @param {number} y The y co-ordinate of the pixel.
 * @param {Vector3} color The color to set the pixel.
 */
function setPixel(context, x, y, color) {
  var c = Vector3.copyFrom(color);
  c.clamp().componentScale(new Vector3(255, 255, 255));

  context.fillStyle = colorToString(c);
  context.fillRect(x, y, 1, 1);
}


/**
 * Initialize the scene.
 */
function initScene() {
  g_lights = new Lights();
  g_lights.addLight(new DirectionalLight(new Vector3(0, -1, 0),
                                         new Vector3(1, 1, 1)));

  g_objects = new Array();

  var redDiffuse = new DiffuseMaterial(new Vector3(1, 0, 0),
                                       new Vector3(0.1, 0, 0));
  var redSpecular = new SpecularMaterial(new Vector3(1, 1, 1), 8, redDiffuse);
  var sphere = new Sphere(new Vector3(0, 0, 10), 5, redSpecular);
  g_objects.push(sphere);

  var yellowCheck = new DiffuseMaterial(new Vector3(1, 1, 0),
                                        new Vector3(0.4, 0.4, 0));
  var blueCheck = new DiffuseMaterial(new Vector3(0, 0, 1),
                                      new Vector3(0, 0, 0.4));
  var plane = new Plane(new Vector3(0, 1, 0), -4,
                        new CheckerMaterial(yellowCheck, blueCheck));
  g_objects.push(plane);

  var box = new Box(2, 2, 2, new Vector3(-3.5, -2.5, 1),
                    new DiffuseMaterial(new Vector3(0, 1, 0),
                                        new Vector3(0, 0.2, 0)));
  g_objects.push(box);

  g_sampler = new Sampler(1);

  g_sphere = sphere;

  g_eye_origin = new Vector3(0, 0, -10);
  g_near_plane = 0;  // z coordinate
}


/**
 * Construct a ray that passes through the screen pixel position.
 * @param {number} sx X component of the screen co-ordinate.
 * @param {number} sy Y component of the screen co-ordinate.
 * @return {Ray} A ray that passes through the screen pixel.
 */
function buildRay(sx, sy) {
  var width2 = g_width / 2;
  var height2 = g_height / 2;

  var x = ((sx - width2) / width2) * 5;
  var y = ((height2 - sy) / height2) * 5;
  var d = new Vector3(x, y,
                      g_near_plane - g_eye_origin.z);
  d.normalize();
  return new Ray(g_eye_origin, d);
}


/**
 * Draw the scene.
 */
function draw() {
  // Update the sphere's Y coordinate.
  // TODO: Once transforms are introduced, this should be done by setting
  // the sphere's transform, not by directly modifying a private variable.
  g_sphere.center_.y = (0.5 + Math.sin(g_frameCount)) * 3;

  clearBackground(g_context, new Vector3());

  var sampler = g_sampler;

  // Trace rays
  for (var i = 0; i < g_height; i++) {
    for (var j = 0; j < g_width; j++) {
      sampler.reset();

      while (sampler.hasNext()) {
        var samplePoint = sampler.next();

        // Build ray
        var p = Vector2.add(new Vector2(j, i), samplePoint);
        var ray = buildRay(j + samplePoint.x, i + samplePoint.y);

        // Trace ray against objects in the scene
        var intersection = intersectRayWithScene(ray);

        // If there was an intersection compute the shading.
        if (intersection) {
          var shadeContext = {
            object: intersection.obj,
            ray: ray,
            t: intersection.t,
            normal: intersection.normal
          };
          var color = intersection.obj.shade(shadeContext);
          sampler.accumulateSample(color);
        }
      }
      var pixelColor = sampler.result();
      setPixel(g_context, j, i, pixelColor);
    }
  }
}
