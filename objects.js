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
 * The base class for all scene objects.
 * @param {Material} material The object's material.
 * @constructor
 */
function SceneObject(material) {
  /**
   * @type {Material}
   * @private
   */
  this.material_ = material;
}


/**
 * Invoke the object's material to shade the intersection point.
 * @param {RayContext} context The constructed context of the ray
 *     intersection.
 * @return {Vector3} The color output of the shade operation.
 */
SceneObject.prototype.shade = function(context) {
  return this.material_.evaluate(context);
};


/**
 * Perform a ray-object intersection test. This function must be implemented
 * by all classes that inherit from SceneObject.
 * @param {Ray} ray The ray to be tested.
 * @return {{t: number, normal: Vector3}} t holds the parametric distance along
 *     the ray to the closest point of intersection with the object, normal
 *     holds the object normal at the point of intersection. If there is no
 *     intersection then undefined is returned.
 */
SceneObject.prototype.intersect = function(ray) {
  throw 'intersect is not implemented.';
};


/**
 * Implement a Sphere primitive.
 * @param {Vector3} center The center of the sphere.
 * @param {number} radius The radius of the sphere.
 * @param {Material} material The material that covers the sphere.
 * @constructor
 */
function Sphere(center, radius, material) {
  SceneObject.call(this, material);

  /**
   * @type {Vector3}
   * @private
   */
  this.center_ = center;

  /**
   * @type {number}
   * @private
   */
  this.radius_ = radius;
}
Sphere.prototype = new SceneObject();

/**
 * Perform a ray-sphere intersection test.
 * @param {Ray} ray The ray to be tested.
 * @return {{t: number, normal: Vector3}} t holds the parametric distance along
 *     the ray to the closest point of intersection with the sphere, normal
 *     holds the sphere normal at the point of intersection. If there is no
 *     intersection then undefined is returned.
 */
Sphere.prototype.intersect = function(ray) {
  /**
   * From: http://www.cs.umbc.edu/~olano/435f02/ray-sphere.html
   */
  var dst = Vector3.subtract(ray.origin, this.center_);

  var a = Vector3.dot(ray.direction, ray.direction);
  var b = 2 * Vector3.dot(ray.direction, dst);
  var c = Vector3.dot(dst, dst) - (this.radius_ * this.radius_);

  var discrim_sq = b * b - 4 * a * c;
  if (discrim_sq < 0) {
    return undefined;
  }

  var discrim = Math.sqrt(discrim_sq);
  if (Math.abs(discrim_sq) > 1e-2) {
    // Two intersections, return the closer one. For reference the other is at
    // (-b + discrim) / (2 * a).
    var t = (-b - discrim) / (2 * a);
  } else {
    // Glancing intersection, with one solution.
    var t = -b / (2 * a);
  }

  return {
    t: t,
    normal: this.normal(ray, t)
  };
};


/**
 * Compute the normal of the sphere for the intersection point.
 * @param {Ray} ray The intersecting ray.
 * @param {number} t The parametric point of intersection.
 * @return {Vector3} The normal at the point of intersection.
 */
Sphere.prototype.normal = function(ray, t) {
  var worldPos = ray.pointOnRay(t);
  var v = Vector3.subtract(worldPos, this.center_);
  return v.normalize();
};


/**
 * Implements a plane primitive.
 * @param {Vector3} normal The plane normal.
 * @param {number} offset The distance of the plane along the normal from
 *   the origin.
 * @param {Material} material The plane surface material.
 * @constructor
 */
function Plane(normal, offset, material) {
  SceneObject.call(this, material);

  /**
   * @type {Vector3} normal
   * @private
   */
  this.normal_ = normal;

  /**
   * @type {number}
   * @private
   */
  this.offset_ = offset;
}
Plane.prototype = new SceneObject();


/**
 * Test for an intersection between the ray and the plane.
 * @param {Ray} ray The ray to intersect with the plane.
 * @return {{t: number, normal: Vector3}} t holds the parametric distance along
 *     the ray to the closest point of intersection with the plane, normal
 *     holds the plane normal at the point of intersection. If there is no
 *     intersection then undefined is returned.
 */
Plane.prototype.intersect = function(ray) {
  /**
   * From https://www.siggraph.org/education/materials/HyperGraph/raytrace/rayplane_intersection.htm
   */
  var Vd = Vector3.dot(this.normal_, ray.direction);
  if (Math.abs(Vd) < 1e-2) {
    // Parallel to the plane, no intersection
    return undefined;
  }
  var V0 = -(Vector3.dot(this.normal_, ray.origin) - this.offset_);
  var t = V0 / Vd;
  if (t < 0) {
    // Intersection is behind ray origin, ignore.
    return undefined;
  }

  return {
    t: t,
    normal: this.normal_
  };
};


/**
 * @param {number} width The width of the box.
 * @param {number} height The height of the box.
 * @param {number} depth The depth of the box.
 * @param {Vector3} center The center of the box.
 * @param {Material} material The box's material.
 * @constructor
 */
function Box(width, height, depth, center, material) {
  SceneObject.call(this, material);

  var width2 = width / 2;
  var height2 = height / 2;
  var depth2 = depth / 2;

  /**
   * The 'minimal' corner of the AABB.
   * @type {Vector3}
   * @private
   */
  this.p0_ = Vector3.subtract(center, new Vector3(width2, height2, depth2));

  /**
   * The 'maximal' corner of the AABB.
   * @type {Vector3}
   * @private
   */
  this.p1_ = Vector3.add(center, new Vector3(width2, height2, depth2));
}
Box.prototype = new SceneObject();


/**
 * Test for an intersection between the ray and the box.
 * @param {Ray} ray The ray to intersect with the box.
 * @return {Array.<number>} The array of the ray's parametrics values at
 *     points of intersection with the plane.
 */
Box.prototype.intersect = function(ray) {
  if (ray.direction.x >= 0) {
    var txMin = (this.p0_.x - ray.origin.x) / ray.direction.x;
    var txMax = (this.p1_.x - ray.origin.x) / ray.direction.x;
  } else {
    var txMin = (this.p1_.x - ray.origin.x) / ray.direction.x;
    var txMax = (this.p0_.x - ray.origin.x) / ray.direction.x;
  }

  if (ray.direction.y >= 0) {
    var tyMin = (this.p0_.y - ray.origin.y) / ray.direction.y;
    var tyMax = (this.p1_.y - ray.origin.y) / ray.direction.y;
  } else {
    var tyMin = (this.p1_.y - ray.origin.y) / ray.direction.y;
    var tyMax = (this.p0_.y - ray.origin.y) / ray.direction.y;
  }

  if (ray.direction.z >= 0) {
    var tzMin = (this.p0_.z - ray.origin.z) / ray.direction.z;
    var tzMax = (this.p1_.z - ray.origin.z) / ray.direction.z;
  } else {
    var tzMin = (this.p1_.z - ray.origin.z) / ray.direction.z;
    var tzMax = (this.p0_.z - ray.origin.z) / ray.direction.z;
  }

  // Find the biggest of txMin, tyMin and tzMin.
  // Also tracks the normal of the intersecting face.
  var t0 = txMin;
  var normal = new Vector3(-Box.sign_(ray.direction.x), 0, 0);
  if (t0 < tyMin) {
    t0 = tyMin;
    normal = new Vector3(0, -Box.sign_(ray.direction.y), 0);
  }
  if (t0 < tzMin) {
    t0 = tzMin;
    normal = new Vector3(0, 0, -Box.sign_(ray.direction.z));
  }

  // Find the smallest of txMax, tyMax and tzMax.
  var t1 = Math.min(txMax, Math.min(tyMax, tzMax));
  if (t0 < t1) {
    // Intersection. The two points of intersection are [t0, t1], but only
    // the closer point is returned.
    return {
      t: t0,
      normal: normal
    };
  }

  // No intersection.
  return undefined;
};


/**
 * Return the sign of a number.
 * @param {number} x The number to be tested.
 * @return {number} -1 if the input is negative, 1 if it is positive, 0
 *     otherwise.
 * @private
 */
Box.sign_ = function(x) {
  if (Math.abs(x) < 1e-5) {
    return 0;
  }

  return (x < 0) ? -1 : 1;
};


/**
 * Test all objects in the scene for intersection with the ray.
 * @param {Ray} ray The ray to intersect with the scene.
 * @return {{t: number, normal: Vector3, obj: SceneObject}} The closest intersection
 *     along the ray, the normal at the point of intersection and the object
 *     that intersected the ray, or undefined if the ray does not intersect
 *     any objects.
 */
// TODO: Make this a method of an scene container.
// TODO: This function should test ray segments against objects for
// intersection.
function intersectRayWithScene(ray) {
  var closest_t = Infinity;
  var closest_obj = undefined;
  var closest_intersection = undefined;
  for (var objectIdx = 0; objectIdx < g_objects.length; objectIdx++) {
    var intersect = g_objects[objectIdx].intersect(ray);
    if (intersect && intersect.t < closest_t) {
      closest_t = intersect.t;
      closest_obj = g_objects[objectIdx];
      closest_intersection = intersect;
    }
  }

  if (closest_obj === undefined) {
    return undefined;
  }

  return {
    t: closest_t,
    normal: closest_intersection.normal,
    obj: closest_obj
  };
}
