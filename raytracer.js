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


void setup() {
  size(128, 128);
  frameRate(30);

  initScene();
}


/**
 * Construct a ray that passes through the screen pixel position.
 * @param {number} sx X component of the screen co-ordinate.
 * @param {number} sy Y component of the screen co-ordinate.
 * @return {Ray} A ray that passes through the screen pixel.
 */
function buildRay(sx, sy) {
  var width2 = width / 2;
  var height2 = height / 2;

  var x = ((sx - width2) / width2) * 5;
  var y = ((height2 - sy) / height2) * 5;
  var d = new Vector3(x, y,
                      g_near_plane - g_eye_origin.z);
  d.normalize();
  return new Ray(g_eye_origin, d);
}


void draw() {
  // Update the sphere's Y coordinate.
  // TODO: Once transforms are introduced, this should be done by setting
  // the sphere's transform, not by directly modifying a private variable.
  g_sphere.center_.y = (0.5 + Math.sin(frameCount)) * 3;

  background(0);

  var sampler = g_sampler;

  var width2 = width / 2;
  var height2 = height / 2;

  // Trace rays
  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
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
      stroke(pixelColor.x * 255, pixelColor.y * 255, pixelColor.z * 255);
      point(j, i);
    }
  }
}
