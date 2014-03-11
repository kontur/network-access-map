/**
 * Interactive animated world map 
 *
 */

function World () {	

	var spawnPoints,
		spawnMap,
		spawnGrid,
		height,
		width,	
		context,
		showMap = true,
		showForces = false,
		particles = [],
		forces = [],
		that = this;

	this.coloredContinents = true;
	this.maxAge = 5000;
	this.maxParticles = 1000;
	this.generationRate = 1;
	this.retract = 1.1;
	this.decay = 0.4;
	this.affect = 1.15;
	this.movement = this.retract;
	this.distance   = this.decay;
	this.affectFactor  = this.affect;
	this.map = "distribution";
	this.concentrations = 1.5;


	this.init = function (ctx, w, h, initSpawnMap, initSpawnGrid) {
		context = ctx;
		height = h;
		width  = w;
		spawnMap = initSpawnMap || false;
		spawnGrid = initSpawnGrid || 5;

		var that = this;

		setInterval(function () {
			if (particles.length < that.maxParticles) {
				var generated;
				var isGenerated = false;
				while (!isGenerated) {
					generated = newParticle();
					if (!!generated) {
						isGenerated = true;
						particles.push(generated);
					}
				}
			}
		}, this.generationRate);

		forces.push(
			new Force(new Vector(275, 110), 10, that.concentrations),
			new Force(new Vector(295, 115), 10, that.concentrations),
			
			new Force(new Vector(65, 150), 20, that.concentrations),
			new Force(new Vector(120, 130), 5, that.concentrations),
			new Force(new Vector(140, 145), 20, that.concentrations),

			new Force(new Vector(190, 270), 12, that.concentrations),
						
			new Force(new Vector(550, 290), 5, that.concentrations),

			new Force(new Vector(530, 140), 22, that.concentrations),
			
			new Force(new Vector(300, 180), -5, that.concentrations),
			new Force(new Vector(150, 300), -1, that.concentrations), 

			new Force(new Vector(0, 0),     -50, that.concentrations),
			new Force(new Vector(600, 0),   -50, that.concentrations),
			new Force(new Vector(0, 400),   -50, that.concentrations),
			new Force(new Vector(600, 400), -50, that.concentrations)
		);
		loop();
	}


	// exposed helper function to manipulate world values in real time
	this.setProperty = function (property, value) {
		switch (property) {
			case "decay":
				this.decayFactor = value;
				for (var i = 0; i < particles.length; i++) {
					particles[i].part.decayFactor = value;
				}
			break;
			
			case "affect":
				this.affectFactor = value;
				for (var i = 0; i < particles.length; i++) {
					particles[i].part.affectFactor = value;
				}
			break;

			case "retract":
				this.retractFactor = value;
				for (var i = 0; i < particles.length; i++) {
					particles[i].part.retractFactor = value;
				}
			break;

			case "maxAge":
				this.maxAge = value;
				var parts = [];
				for (var i = 0; i < particles.length; i++) {
					if (particles[i].part.age < this.maxAge) {
						parts.push(particles[i]);
					}
				}
				particles = parts;
			break;

			case "maxParticles":
				this.maxParticles = value;
				while (particles.length > this.maxParticles) {
					particles.pop();
				}
			break;

			case "concentrations":
				for (var f = 0; f < forces.length; f++) {
					forces[f].setFactor(value);
				}
			break;
		}
	}


	// main animation loop routine
	function loop () {
		clear();
		update();
		draw();
		queue();
	}


	// clearing the canvas area and redrawing the background
	function clear() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		if (showMap) {
			try {
				if (that.map == "distribution") {
					context.drawImage(worldImage, 0, 0);
				} else {
					context.drawImage(worldOutline, 0, 0);
				}
			} catch (e) {

			}
		}
	}


	// updating the actual model data
	function update() {
		for (var i = 0; i < particles.length; i++) {
			var age = particles[i].part.decay();
			particles[i].part.affect(forces);
			particles[i].part.retract();
			particles[i].part.move();
			
			if (age > this.maxAge) {
				particles.splice(i, 1);
			}

			if (!canvasArea.contains(particles[i].part.position)) {
				particles.splice(i, 1);
			}

			if (age % 10) {
				particles[i].part.setDestination(
					new Vector(Math.ceil(Math.random() * width) + 1, Math.ceil(Math.random() * height) + 1)
				);
			}
		}
	}


	// drawing the pixel data
	function draw() {		
		for (var i = 0; i < particles.length; i++) {
			var particle = particles[i];
			context.fillStyle = "rgba(255,255,255,"+ (that.maxAge - particle.part.age) / that.maxAge + ")";
			if (that.coloredContinents) {
				context.fillStyle = "rgba(" + particle.color.red + "," + particle.color.green + "," + 
					particle.color.blue + "," + (that.maxAge - particle.part.age) / that.maxAge + ")" ;
			}
			context.beginPath();
			context.arc(particle.part.position.x, particle.part.position.y, 0.25 + Math.random(), 0, Math.PI*2, true); 
			context.closePath();
			context.fill();
		}

		if (showForces) {
			context.fillStyle = "#ff3300";
			for (var f = 0; f < forces.length; f++) {
				context.fillRect(forces[f].position.x, forces[f].position.y, 5, 5);
			}
		}
	}


	function queue() {
		requestAnimationFrame(loop);
	}


	// helper for creating a new random particle
	function newParticle() {
		var position = getMapPoint();
		if (!position) {
			return false;
		}


		var destination = getMapPoint();
		if (!destination) {
			return false;
		}

		var angle = Math.random() * 360;
		var magnitude = 0;

		var velocity = Vector.fromAngle(angle, magnitude);
		return {
			"part": new Particle(position, velocity, null, destination, false, 
				that.movement, that.distance, that.affectFactor),
			"color": {
				"red":   spawnMap[position.y][position.x][0],
				"green": spawnMap[position.y][position.x][1],
				"blue":  spawnMap[position.y][position.x][2],
			}
		}
	}


	// helper to pick a random map point based on distribution weighting
	function getMapPoint() {
		var foundPoint = false;
		var i = 0;

		while (!foundPoint && i < 100) {
			try {
				var point = new Vector(Math.ceil(Math.random() * width) + 1, Math.ceil(Math.random() * height) + 1);
				var probability = (255 - spawn[point.y][point.x][1]) / 255;
				var chance = Math.random();
				if (probability > 0.1) {
					if (chance < probability) {
						foundPoint = true;
					}
				}
			} catch (e) {
				foundPoint = false;
			}
			i++;
		}

		if (foundPoint) {
			return point;
		} else {
			return false;
		}
	}
}