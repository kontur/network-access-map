/**
 * Particle class
 *
 */
function Particle(point, velocity, acceleration, destination, maxAge, 
	retractFactor, decayFactor, affectFactor) {
	this.position = point || new Vector();
	this.velocity = velocity || new Vector();
	this.acceleration = acceleration || new Vector();
	this.origin = new Vector(point.x, point.y);
	this.age = 0;
	this.maxAge = maxAge || false;
	this.destination = destination || false;
	this.retractFactor = retractFactor || 0.75;
	this.decayFactor   = decayFactor || 0.99;
	this.affectFactor  = affectFactor ||1.15;
}

Particle.prototype.move = function () {
	this.velocity.add(this.acceleration);
	this.position.add(this.velocity);
}

Particle.prototype.decay = function () {
	var decceleration = this.decayFactor;
	this.acceleration = this.acceleration.multiply(new Vector(decceleration, decceleration));
	this.velocity.multiply(new Vector(decceleration, decceleration));
	return(this.age++);
}

Particle.prototype.retract = function () {
	var distance = new Vector(this.origin.x - this.position.x, this.origin.y - this.position.y);
	var strength = Math.min(10, 10 / Math.pow(distance.x * distance.x + distance.y * distance.y, this.retractFactor));
	this.acceleration.add(new Vector(distance.x * strength, distance.y * strength));
}


Particle.prototype.affect = function (forces) {
	var total = new Vector(0, 0);
	for (var i = 0; i < forces.length; i++) {
		var force = forces[i];
		var distance = new Vector(force.position.x - this.position.x, force.position.y - this.position.y);
		if (Math.sqrt(distance.x * distance.x + distance.y * distance.y) < 150) {
			var strength = Math.min(10, force.mass * force.factor / Math.pow(distance.x * distance.x + distance.y * distance.y, this.affectFactor));
			total.x += distance.x * strength;
			total.y += distance.y * strength;
		}
	}

	if (this.destination) {
		var distance = new Vector(this.destination.x - this.position.x, this.destination.y - this.position.y);
		var strength = Math.min(1, 100 / Math.pow(distance.x * distance.x + distance.y * distance.y, 1.125));
		total.x += distance.x * strength;
		total.y += distance.y * strength;
	}
	this.acceleration = total;
}

Particle.prototype.setDestination = function (dst) {
	this.destination = dst;
}