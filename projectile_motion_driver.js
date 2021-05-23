


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
		const initialPos = this.physicsObjects[0].initialPos;
		const initialVel = this.physicsObjects[0].initialVel;
		return createVector(initialPos.x + initialVel.x * t, initialPos.y + initialVel.y * t - 0.5 * constants.g * t * t);
	}

	peakTime() {
		/* Get the time where the projectile will be at its peak height */
		const initialVel = this.physicsObjects[0].initialVel;
		return initialVel.y / constants.g;
	}

	peakHeight() {
		/* Get the maximum height of the projectile along its path */
		return this.positionAtTime(this.peakTime()).y;
	}

	endRange() {
		/* Get the position of the projectile in the x direction when it hits the ground */
		return this.positionAtTime(this.endTime()).x;
	}

	endTime() {
		/* Get the time when the object will hit the ground */
		const inVel = this.physicsObjects[0].initialVel.y;
		const inPos = this.physicsObjects[0].initialPos.y;
		return (inVel + Math.sqrt(inVel * inVel + 2 * constants.g * inPos)) / constants.g;
	}

	update() {
		if (!this.paused) {
			super.update();

			if (this.physicsObjects.length > 0) {
				this.drawInfoText("Peak time: " + Math.round(this.peakTime()*100)/100, 2);
				this.drawInfoText("Peak height: " + Math.round(this.peakHeight()*100)/100, 3);
				this.drawInfoText("Distance traveled: " + Math.round((this.positionAtTime(this.simTime).x-this.physicsObjects[0].initialPos.x)*100)/100, 4);
			}
		}
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
		this.points = [];
	}

	resetInitials(initialPos, initialVel) {
		this.initialPos = initialPos.copy();
		this.initialVel = initialVel.copy();
		this.setPosition(initialPos.copy());
		this.setVelocity(initialVel.copy());
		this.points = [];
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
		this.points.push(coords);

		strokeWeight(1);
		stroke(255,0,0);
		if (this.points.length > 1) {
			let pos1, pos2;
			for (let i=1; i<this.points.length; i++) {
				pos1 = this.sim.transformCoordinates(this.points[i-1]);
				pos2 = this.sim.transformCoordinates(this.points[i]);
				line(this.points[i-1].x, this.points[i-1].y, this.points[i].x, this.points[i].y);
			}
		}

		pop();
	}

	update() {
		this.applyForce(createVector(0, -constants.g));
		// this.applyForce(p5.Vector.mult(this.vel, -3/4)) /* Air resistance */
		super.update();
		this.checkBounds();
		this.draw();
	}

}

function startSim() {
	const xVel = parseInt(document.getElementById("initial-xvel-slider").value);
	const yVel = parseInt(document.getElementById("initial-yvel-slider").value);
	const initialHeight = parseInt(document.getElementById("initial-height-slider").value);
	simulation.reset(createVector(2, initialHeight), createVector(xVel, yVel));

	const minPixelsPerMeter = Math.min(height/(simulation.peakHeight()+2), width/(simulation.endRange()+2));
	simulation.setPixelsPerMeter(minPixelsPerMeter);
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
	simulation = new ProjectileMotionSimulation(width, height, 25);
	simulation.toggleGridlines();
	simulation.update();
	simulation.pause();
	updateSliderLabels();
}

function draw() {
	simulation.update();
}
