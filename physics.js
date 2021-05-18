let GRAVITY = p5.prototype.createVector(0, 9.8);
let PIXELS_PER_METER = 5;
let numOrbs = 5;
let orbs = [];

class Orb {
	
	constructor(x, y, mass=1, velocity=createVector(4,0), density=1) {
		this.pos = createVector(x, y);
		this.mass = mass;
		/**
		D = m/(pi*r^2)
		sqrt(m*pi/D) = r
		*/
		this.density = density;
		this.radius = sqrt(this.mass * PI / this.density) * PIXELS_PER_METER;
		this.invMass = 1 / mass;
		this.vel = velocity;
		this.acc = createVector(0, 0);
		this.color = createVector(random(255),random(255),random(255));
	}
	
	applyForce(force) {
		// F = ma
		// a = 1/m * F
		let acc = p5.Vector.mult(force, this.invMass);
		this.acc.add(acc);
	}
	
	applyAcceleration(acc) {
		this.applyForce(p5.Vector.mult(acc, this.mass));
	}
	
	applyGravity() {
		this.applyAcceleration(GRAVITY);
	}
	
	borderClamp() {
		if (height - (this.pos.y + this.radius) < 1) {
			this.pos.y = height - this.radius;
			this.vel.y *= -1;
		}
		if (this.pos.x - this.radius < 1) {
			this.pos.x = this.radius;
			this.vel.x *= -1;
		}
		if (width - (this.pos.x + this.radius) < 1) {
			this.pos.x = width - this.radius;
			this.vel.x *= -1;
		}
	}	
	
	draw() {
		stroke(0);
		strokeWeight(1);
		fill(this.color.x, this.color.y, this.color.z, 128);
		circle(this.pos.x, this.pos.y, 2*this.radius);
	}
	
	update() {
		this.acc.set(0, 0);
		this.applyGravity();
		
		this.acc.mult(PIXELS_PER_METER/frameRate());
		this.vel.add(this.acc);
		this.pos.add(this.vel);
		
		this.borderClamp();
		
		this.draw();
	}
}


function setup() {
	const canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent("canvas-div");
	for (let i=0; i<numOrbs; i++) {
		orbs[i] = new Orb(random(50, windowWidth-50), random(100, 300), random(10, 50), createVector(random(-4, 4)));
	}
}

function draw() {
	background(255);
	for (let orb of orbs) {
		orb.update();
	}
	line(0,windowHeight,windowWidth,windowHeight);
}