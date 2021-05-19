


class ProjectileMotionSimulation extends BaseSimulation {

	/* Simulate projectile motion of an object in freefall */

	constructor(canvasWidth, canvasHeight, pixelsPerMeter=1, timeStep=1/60) {
		super(canvasWidth, canvasHeight, pixelsPerMeter, timeStep);
	}

	positionAtTime(initialPos, initialVel, t) {
		/* Get the position of the an object with given initial position and initial velocity at time t */
		return createVector(initialPos.x + initialVel.x * t, initialPos.y + initialVel.y * t - 0.5 * constants.g * t * t);
	}

	peakTime(initialVel) {
		/* Get the time where an object with the given initial velocity will be at its peak height */
		return initialVel.y / constants.g;
	}

	peakHeight(initialPos, initialVel) {
		/* Get the maximum height of an object with given initial position and initial velocity */
		return this.positionAtTime(initialPos, initialVel, this.peakTime(initialPos, initialVel));
	}

}


class Projectile extends PhysicsObject {

	/* The object of the projectile motion simulation */

	constructor(sim, x, y, radius, col, mass=1) {
		super(sim, x, y, mass);
		this.radius = radius;
		this.diameter = 2 * this.radius;
		this.col = col;
		this.setVelocity(createVector(6, 5));
	}

	lockBounds() {
		/* Keep the projectile on screen */
		this.pos.set(constrain(this.pos.x, this.radius, this.sim.xUnits-this.radius), constrain(this.pos.y, this.radius, this.sim.yUnits-this.radius));
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
		this.lockBounds();
		this.draw();
	}

}

let simulation, projectile;
function setup() {
	const canvas = createCanvas(windowWidth/2, windowHeight);
	canvas.parent("canvas-div");
	simulation = new ProjectileMotionSimulation(width, height, 50);
	simulation.toggleGridlines();
	projectile = new Projectile(simulation, 2, 10, 0.25, createVector(255,0,0));
}

function draw() {
	simulation.update();
}
