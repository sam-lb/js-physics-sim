


class ProjectileMotionSimulation extends BaseSimulation {

	constructor(canvasWidth, canvasHeight, pixelsPerMeter=1, timeStep=1/60) {
		super(canvasWidth, canvasHeight, pixelsPerMeter, timeStep);
	}

}


class Projectile extends PhysicsObject {

	constructor(sim, x, y, radius, col, mass=1) {
		super(sim, x, y, mass);
		this.radius = radius;
		this.diameter = 2 * this.radius;
		this.col = col;
	}

	draw() {
		const coords = this.sim.transformCoordinates(this.pos);
		push();
		fill(this.col.x, this.col.y, this.col.z);
		circle(coords.x, coords.y, this.sim.scaleMeterQuantity(this.diameter));
		pop();
	}

	update() {
		super.update()
		this.draw();
	}

}

let simulation, projectile;
function setup() {
	const canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent("canvas-div");
	simulation = new ProjectileMotionSimulation(width, height, 15);
	projectile = new Projectile(simulation, 10, 10, 2, createVector(0,255,0));
}

function draw() {
	simulation.update();
}
