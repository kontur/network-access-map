/**
 * Force class to simulate attraction
 *
 */

function Force(point, mass, factor) {
	this.position = point || new Vector();
	this.factor = factor || 1;
	this.mass = mass || 0;
}

Force.prototype.setMass = function (mass) {
	this.mass = mass;
}

Force.prototype.setFactor = function (factor) {
	this.factor = factor;
}

Force.prototype.setPosition = function (point) {
	this.position = point;
}