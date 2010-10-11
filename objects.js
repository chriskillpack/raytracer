/**
 * Implement a Sphere primitive.
 * @param {Vector3} center The center of the sphere.
 * @param {number} radius The radius of the sphere.
 * @param {Material} material The material that covers the sphere.
 * @constructor
 */
function Sphere(center, radius, material) {
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

  /**
   * @type {Material}
   * @private
   */
  this.material_ = material;
}


/**
 * Perform a ray-sphere intersection test.
 * @param {Ray} ray The ray to be tested.
 * @return {Array.<number>} The array of the ray's parametrics values at
 *     points of intersection with the sphere.
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
    return [];
  }

  var intersections = new Array();
  var discrim = Math.sqrt(discrim_sq);
  if (Math.abs(discrim_sq) > 1e-2) {
    // Two intersections
    intersections.push((-b - discrim) / (2 * a));
    intersections.push((-b + discrim) / (2 * a));
  } else {
    // Glancing, one solution
    intersections.push(-b / (2 * a));
  }

  return intersections;
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
  v.normalize();
  return v;
};


/**
 * Invoke the object's material to shade the intersection point.
 * @param {RayContext} context The constructed context of the ray
 *     intersection.
 * @return {Vector3} The color output of the shade operation.
 */
Sphere.prototype.shade = function(context) {
  context.normal = this.normal(context.ray, context.t);
  return this.material_.evaluate(context);
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

  /**
   * @type {Material}
   * @private
   */
  this.material_ = material;
}


/**
 * Test for an intersection between the ray and the plane.
 * @param {Ray} ray The ray to intersect with the plane.
 * @return {Array.<number>} The array of the ray's parametrics values at
 *     points of intersection with the plane.
 */
Plane.prototype.intersect = function(ray) {
  /**
   * From https://www.siggraph.org/education/materials/HyperGraph/raytrace/rayplane_intersection.htm
   */
  var Vd = Vector3.dot(this.normal_, ray.direction);
  if (Math.abs(Vd) < 1e-2) {
    // Parallel to the plane, no intersection
    return [];
  }
  var V0 = -(Vector3.dot(this.normal_, ray.origin) - this.offset_);
  var t = V0 / Vd;
  if (t < 0) {
    // Intersection is behind eye origin, ignore
    return [];
  }

  return [t];
};


/**
 * Invoke the object's material to shade the intersection point.
 * @param {RayContext} context The constructed context of the ray
 *     intersection.
 * @return {Vector3} The color output of the shade operation.
 */
Plane.prototype.shade = function(context) {
  context.normal = this.normal_;
  return this.material_.evaluate(context);
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
  var width2 = width / 2;
  var height2 = height / 2;
  var depth2 = depth / 2;

  /**
   * The material used for shading.
   * @type {Material}
   * @private
   */
  this.material_ = material;

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
  var t0 = Math.max(txMin, Math.max(tyMin, tzMin));
  // Find the smallest of txMax, tyMax and tzMax.
  var t1 = Math.min(txMax, Math.min(tyMax, tzMax));
  if (t0 < t1) {
    // Intersection.
    return [t0, t1];
  }

  // No intersection.
  return [];
};


/**
 * Invoke the object's material to shade the intersection point.
 * @param {RayContext} context The constructed context of the ray
 *     intersection.
 * @return {Vector3} The color output of the shade operation.
 */
Box.prototype.shade = function(context) {
  // HACK!
  context.normal = new Vector3(0, 1, 0);
  return this.material_.evaluate(context);
};


// TODO: Make this a method of an scene container.
// TODO: This function should test ray segments against objects for
// intersection.
function intersectRayWithScene(ray, opt_stopOnFirstIntersection,
                               opt_skipObject) {
  var closest_t = Infinity;
  var closest_obj = undefined;
  for (var objectIdx = 0; objectIdx < g_objects.length; objectIdx++) {
    if (g_objects[objectIdx] == opt_skipObject) {
      continue;
    }

    var t = g_objects[objectIdx].intersect(ray);
    for (var items = 0; items < t.length; items++) {
      if (t[items] < closest_t) {
        closest_t = t[items];
        closest_obj = g_objects[objectIdx];
      }
    }
    if (closest_obj && opt_stopOnFirstIntersection) {
      break;
    }
  }

  if (closest_obj === undefined) {
    return undefined;
  }

  // Processing causes a headache building object literals on return
  // statements. So we break it apart for now.
  var r = {};
  r.t = closest_t;
  r.obj = closest_obj;
  return r;
}
