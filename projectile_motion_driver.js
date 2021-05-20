


class ProjectileMotionSimulation extends BaseSimulation {

	/* Simulate projectile motion of an object in freefall */

	constructor(canvasWidth, canvasHeight, pixelsPerMeter=1, timeStep=1/60) {
		super(canvasWidth, canvasHeight, pixelsPerMeter, timeStep);
	}

	reset(initialPos, initialVel) {
		if (this.physicsObjects.length === 0) {
			new Projectile(this, initialPos.x, initialPos.y, initialVel.copy(), 0.25, createVector(255,0,0));
			this.reset(initialPos, initialVel);
			return;
		}

		const projectile = this.physicsObjects[0];
		this.resetSimulationTime();
		this.unpause();
		projectile.resetInitials(initialPos, initialVel);
	}

	positionAtTime(t) {
		/* Get the position of the projectile at time t */
		const initialPos = this.objects[0].initialPos;
		const initialVel = this.objects[0].initialVel;
		return createVector(initialPos.x + initialVel.x * t, initialPos.y + initialVel.y * t - 0.5 * constants.g * t * t);
	}

	peakTime() {
		/* Get the time where the projectile will be at its peak height */
		const initialVel = this.objects[0].initialVel;
		return initialVel.y / constants.g;
	}

	peakHeight() {
		/* Get the maximum height of the projectile along its path */
		return this.positionAtTime(this.peakTime());
	}

}


class Projectile extends PhysicsObject {

	/* The object of the projectile motion simulation */

	constructor(sim, x, y, initialVel, radius, col, mass=1) {
		super(sim, x, y, mass);
		this.initialVel = initialVel;
		this.setVelocity(this.initialVel);
		this.radius = radius;
		this.diameter = 2 * this.radius;
		this.col = col;
	}

	resetInitials(initialPos, initialVel) {
		this.initialPos = initialPos.copy();
		this.initialVel = initialVel.copy();
		this.setPosition(initialPos.copy());
		this.setVelocity(initialVel.copy());
	}

	checkBounds() {
		/* Pause simulation upon hitting the ground */
		if (this.pos.y < this.radius) {
			this.setPosition(createVector(this.pos.x, this.radius));
			this.sim.pause();
		}
	}

	draw() {
		/* Draw the projectile */
		const coords = this.sim.transformCoordinates(this.pos);
		push();
		fill(this.col.x, this.col.y, this.col.z);
		circle(coords.x, coords.y, this.sim.scaleMeterQuantity(this.diameter));
		pop();
	}

	update() {
		this.applyForce(createVector(0, -constants.g));
		super.update()
		this.checkBounds();
		this.draw();
	}

}

function startSim() {
	const xVel = parseInt(document.getElementById("initial-xvel-slider").value);
	const yVel = parseInt(document.getElementById("initial-yvel-slider").value);
	const initialHeight = parseInt(document.getElementById("initial-height-slider").value);
	simulation.reset(createVector(2, initialHeight), createVector(xVel, yVel));
}

function updateSliderLabels() {
	const xVel = document.getElementById("initial-xvel-slider").value;
	const yVel = document.getElementById("initial-yvel-slider").value;
	const initialHeight = document.getElementById("initial-height-slider").value;
	document.getElementById("initial-xvel-value").innerHTML = xVel;
	document.getElementById("initial-yvel-value").innerHTML = yVel;
	document.getElementById("initial-height-value").innerHTML = initialHeight;
}

let simulation, projectile;
function setup() {
	const canvas = createCanvas(windowWidth/2, windowHeight);
	canvas.parent("canvas-div");
	simulation = new ProjectileMotionSimulation(width, height, 50);
	simulation.toggleGridlines();
	simulation.update();
	simulation.pause();
	updateSliderLabels();
}

function draw() {
	simulation.update();
}
