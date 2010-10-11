/**
 * A class that implements the ray.
 * @param {Vector3} origin The origin of the ray.
 * @param {Vector3} direction The direction of the ray.
 * @constructor
 */
function Ray(origin, direction) {
  this.origin = origin;
  this.direction = direction;
}


/**
 * Compute a position along the ray for a given parametric value t.
 * @param {Number} t The parametric value.
 * @return {Vector3} Position along the ray.
 */
Ray.prototype.pointOnRay = function(t) {
  return Vector3.addMul(this.origin, this.direction, t);
};
