let env, boundaryModes, constants, bgSurf;

boundaryModes = {
  BOUNDARIES_ON: 1,
  BOUNDARIES_OFF: 2,
  TORUS: 3,
  BOUNDARIES_ON_WITH_DAMPING: 4,
};

constants = {
	EARTH_MASS: 5.9722 * Math.pow(10, 24), // kg
	EARTH_RADIUS: 6.371 * Math.pow(10, 6), // m
	SOLAR_MASS: 1.989 * Math.pow(10, 30), // kg
	SOLAR_RADIUS: 696.34 * Math.pow(10, 6), // m
	SPEED_OF_LIGHT: 2.997 * Math.pow(10, 8), // m/s
	GRAVITATIONAL: 6.6743015 / 10000000000, // m^2/(kg*s^2)
	EARTH_GRAV_ACC: 9.81, // m/s^2
};

iHat = p5.prototype.createVector(1, 0);
jHat = p5.prototype.createVector(0, 1);

function vectorAngle(vec) {
  if (vec.x === 0) {
    if (vec.y >= 0) {
      return HALF_PI;
    }
    return 3*HALF_PI;
  }
  return atan(vec.y / vec.x);
}

function midpoint(A, B) {
	return p5.Vector.mult(p5.Vector.add(A, B), 0.5);
}

function solveQuadratic(a, b, c) {
	// return the solution (-b + sqrt(b^2 - 4ac)) / 2a
	return (sqrt(b*b - 4*a*c) - b) / (2*a);
}

function solveQuadraticN(a, b, c) {
	// return the solution (-b - sqrt(b^2-4ac)) / 2a
	return (-sqrt(b*b - 4*a*c) - b) / (2*a);
}

function project(u, v) {
	// find the projection of u onto v
	return p5.Vector.mult(v, u.dot(v)/v.magSq());
}

function projectOnUnitVec(u, v) {
	// find the projection of u onto v, where v is a unit vector
	return p5.Vector.mult(v, u.dot(v));
}

function crossProduct2d(u, v) {
	return u.x * v.y - u.y * v.x;
}

function crossProdWithScalar1(u, s) {
	return createVector(s * u.y, -s * u.x);
}

function crossProdWithScalar2(u, s) {
	return createVector(-s * u.y, s * u.x);
}

function timeString(seconds) {
	seconds = Math.floor(seconds*100)/100;
	let cStr = ":", cStr2 = ".";
	let minutesR = Math.floor(seconds / 60);
	let secondsR = Math.floor(seconds-minutesR*60);
	let deciR = Math.floor(100 * (seconds - Math.floor(seconds)));
	if (secondsR < 10) {
		cStr += "0";
	}
	if (deciR < 10) {
		cStr2 += "0";
	}
	
	return minutesR + cStr + secondsR + cStr2 + deciR;
}

class Environment {
  /**
   * Handler for all objects in the simulator
   */

  constructor(simWidth, simHeight, bgColor=createVector(255, 255, 255), pixelsPerMeter=10, boundaryMode=boundaryModes.BOUNDARIES_ON) {
    this.simWidth = simWidth;
    this.simHeight = simHeight;
    this.bgColor = bgColor;
    this.pixelsPerMeter = pixelsPerMeter;
    this.boundaryMode = boundaryMode;
    this.objects = [];
    this.rescale(this.simWidth, this.simHeight);
	
	this.wallElasticity = 0.8;
	
	this.universalGravityEnabled = true;
	this.collisionsEnabled = true;
	this.timeStep = 1 / 100;
	this.simTime = 0;
  }
  
  setTimeStep(timeStep) {
	  this.timeStep = timeStep;
  }

  setPixelsPerMeter(pixels) {
    this.pixelsPerMeter = pixels;
    this.rescale(this.simWidth, this.simHeight);
  }

  setBoundaryMode(mode) {
    this.boundaryMode = mode;
  }

  rescale(simWidth, simHeight) {
    // rescale the window and calculate the meters in the x and y directions
    this.xMeters = simWidth / this.pixelsPerMeter;
    this.yMeters = simHeight / this.pixelsPerMeter;
  }

  coordinateTransform(pos) {
    // transform the origin to the bottom left corner and the coordinate system to cartesian. scale the position by the pixels to meters proportion
    pos = p5.Vector.mult(pos, this.pixelsPerMeter);
    return createVector(pos.x, this.simHeight - pos.y);
  }
  
  reverseTransform(pos) {
	  // undo coordinateTransform()
	  pos = createVector(pos.x, this.simHeight - pos.y);
	  return p5.Vector.mult(pos, 1/this.pixelsPerMeter);
  }

  drawCircle(pos, r, color) {
	// draw a circle to the canvas
    let newPos = this.coordinateTransform(pos);
    r *= this.pixelsPerMeter;
    //stroke(0);
    //strokeWeight(1);
	noStroke();
    fill(color.x, color.y, color.z);
    circle(newPos.x, newPos.y, r*2);
  }
  
  drawCircle2(pos, r, color) {
	  let newPos = this.coordinateTransform(pos);
	  r *= this.pixelsPerMeter;
	  noFill();
	  stroke(color.x, color.y, color.z);
	  circle(newPos.x, newPos.y, r*2);
  }
  
  drawLine(start, stop, color) {
	  // draw a line to the canvas
	  let newStart = this.coordinateTransform(start), newStop = this.coordinateTransform(stop);
	  stroke(color.x, color.y, color.z);
	  line(newStart.x, newStart.y, newStop.x, newStop.y);
  }
  
  drawArrow(pos, vec, color) {
	  // draw an arrow to the canvas
	  let mag = vec.mag();
	  if (mag === 0) {return;}
	  vec = p5.Vector.mult(vec, 50/mag);
	  let end = p5.Vector.add(pos, vec), angle = atan2(vec.y, vec.x);
	  this.drawLine(pos, end, color);
	  this.drawLine(end, p5.Vector.sub(end, p5.Vector.fromAngle(angle + QUARTER_PI)), color);
	  this.drawLine(end, p5.Vector.sub(end, p5.Vector.fromAngle(angle - QUARTER_PI)), color);
  }
  
  drawGrid() {
	  // draw the meter grid to the canvas
	  let c = createVector(0,0,0);
	  for (let x=0; x<=this.xMeters; x++) {
		  this.drawLine(createVector(x, 0), createVector(x, this.yMeters), c);
	  }
	  for (let y=0; y<=this.yMeters; y++) {
		  this.drawLine(createVector(0, y), createVector(this.xMeters, y), c);
	  }
  }

  addObject(obj) {
    this.objects.push(obj);
  }
  
  setGravityEnabled(bool) {
	  this.universalGravityEnabled = bool;
  }
  
  setCollisionsEnabled(bool) {
	  this.collisionsEnabled = bool;
  }

  handleInteractions() {
    // handle interactions(collisions,gravity) between all the objects 
    let obj1, obj2;
    for (let i=0; i<this.objects.length; i++) {
      obj1 = this.objects[i];
      for (let j=i+1; j<this.objects.length; j++) {
        obj2 = this.objects[j];
        if (obj1.type === "RigidBody" && obj2.type === "RigidBody") {
          // if obj1 is not obj2
          if (this.collisionsEnabled) { obj1.handleCollision(obj2) };
		  if (this.universalGravityEnabled) { obj1.gravitate(obj2); }
        } else if (obj1.type === "Rectangle" && obj2.type === "Rectangle") {
			if (obj1.collideRect(obj2)) {
				obj1.color = createVector(255, 0, 0);
				obj2.color = createVector(255, 0, 0);
				noLoop();
			} else {
				obj1.color = createVector(0, 255, 0);
				obj2.color = createVector(0, 255, 0);
			}
		}
      }
    }
  }

  update() {
    // update the scene
    //background(this.bgColor.x, this.bgColor.y, this.bgColor.z);
	if (frameCount === 1) {
		this.bgSurf = createGraphics(this.simWidth, this.simHeight);
		this.bgSurf.background(255);
	}
	image(this.bgSurf, 0, 0);
	this.handleInteractions();
	for (let obj of this.objects) {
      obj.update();
    }
	//this.drawGrid();
	this.simTime += this.timeStep;
	stroke(0);
	fill(0);
	text("Simulation time: "+timeString(this.simTime), 10, 30);
  }
}

class RigidBody {
  /**
   * Base class for all rigidbody objects in the simulator
   */

  constructor(env, x=0, y=0, mass=1, charge=0, color=createVector(255, 0, 0), elasticity=1, csf=0.75, ckf=0.5, dragCoef=0.5) {
    this.env = env;
	this.type = "RigidBody";

    this.mass = mass;
    this.charge = charge;
    this.color = color;
	this.elasticity = elasticity;
    this.csf = csf;
    this.ckf = ckf;
    this.dragCoef = dragCoef;

    this.acc = createVector(0, 0);
    this.vel = createVector(0, 0);
    this.pos = createVector(x, y);
	
	this.env.addObject(this);
  }
  
  setVelocity(vel) {
	  this.vel = vel;
  }

  calculateArea() {
    // calculate the area of the object
  }

  calculateMoment() {
    // calculate the object's moment of inertia
  }

  calculateCenterOfMass() {
    // calculate the object's center of mass
  }

  calculateDensity() {
    // calculate the object's density
    return this.mass / this.area;
  }

  calculateQuantities() {
    // calculate area, moment, and center of mass
    // should be called by subclasses in their constructors
    this.area = this.calculateArea();
    this.moment = this.calculateMoment();
    this.centerOfMass = this.calculateCenterOfMass();
    this.density = this.calculateDensity();
  }

  handleBoundaries() {
    // handle the object's behavior at the edges of the screen according to this.env.boundaryMode
  }

  applyForce(force) {
    // calculate the acceleration caused by a force using a = F/m
    this.acc.add(p5.Vector.mult(force, 1/this.mass));
  }
  
  gravitate(obj) {
	  // gravitate towards another object
	  let d = p5.Vector.sub(obj.centerOfMass, this.centerOfMass);
	  this.applyForce(d.setMag(constants.GRAVITATIONAL * this.mass * obj.mass / d.magSq()));
  }
}

class Orb extends RigidBody {
  /**
   * Circular objects
   */

  constructor(env, x=0, y=0, radius=1, mass=1, charge=0, color=createVector(0, 255, 0), elasticity=1, csf=0, ckf=0, dragCoef=0.5) {
    super(env, x, y, mass, charge, color, elasticity, csf, ckf, dragCoef);
    this.r = radius;
    this.calculateQuantities();
	this.lastPoint = null;
	this.update();
  }

  calculateArea() {
    // calculate area using A = pi * r^2
    return PI * this.r * this.r;
  }

  calculateMoment() {
    // calculate moment of inertia using I = pi*r^4/4
    this.moment = QUARTER_PI * pow(this.r, 4);
  }

  calculateCenterOfMass() {
    // calculate center of mass using
    this.centerOfMass = this.pos;
  }

  handleBoundaries() {
    // see parent class
    switch(this.env.boundaryMode) {
      case boundaryModes.BOUNDARIES_ON:
        // Right
        if(this.pos.x + this.r >= this.env.xMeters) {
          this.pos.x = this.env.xMeters - this.r;
          this.vel.x *= -env.wallElasticity;
        }
        // Left
        if (this.pos.x - this.r <= 0) {
          this.pos.x = this.r;
          this.vel.x *= -env.wallElasticity;
        }
        // Top
        if (this.pos.y + this.r >= this.env.yMeters) {
          this.pos.y = this.env.yMeters - this.r;
          this.vel.y *= -env.wallElasticity;
        }
        // Bottom
        if (this.pos.y - this.r <= 0) {
          this.pos.y = this.r;
          this.vel.y *= -env.wallElasticity;
        }
        break;
      case boundaryModes.BOUNDARIES_OFF:
        break;
      case boundaryModes.TORUS:
        //Right
        if(this.centerOfMass.x > this.env.xMeters)
        {
          this.pos.x = 0;
        }
        //Left
        if(this.centerOfMass.x < 0)
        {
          this.pos.x = this.env.xMeters;
        }
        //Top
        if(this.centerOfMass.y > this.env.yMeters)
        {
          this.pos.y = 0;
        }
        //Bottom
        if(this.centerOfMass.y < 0)
        {
          this.pos.y = this.env.yMeters;
        }
        break;
    }
  }

  handleCollision(orb) {
	// handle collisions with another orb
    let distance = dist(this.pos.x, this.pos.y, orb.pos.x, orb.pos.y);
    if (distance <= this.r + orb.r+2) {
	  let correction, v1, v2;
	  correction = (this.r + orb.r + 1 - distance);
	  v1 = p5.Vector.sub(this.pos, orb.pos).setMag(correction);
	  v2 = p5.Vector.sub(orb.pos, this.pos).setMag(correction);

      this.pos.add(v1);
      orb.pos.add(v2);
	  
	  // vEctOr bASeD aPProAcH
	  // let p1 = this.pos, p2 = orb.pos, dr, n, un, ut, v1n, v1t, v2n, v2t, m1=this.mass, m2=orb.mass, v1nNew, v2nNew;
	  // v1 = this.vel;
	  // v2= orb.vel;
	  // n = p5.Vector.sub(p1, p2);
	  // un = n.copy().normalize();
	  // ut = createVector(-un.y, un.x);
	  // v1n = un.dot(v1);
	  // v1t = ut.dot(v1);
	  // v2n = un.dot(v2);
	  // v2t = ut.dot(v2);
	  // v1nNew = (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
	  // v2nNew = (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);
	  // v1 = un.copy().setMag(v1nNew);
	  // v2 = ut.copy().setMag(v1t);
	  // this.vel = p5.Vector.add(v1, v2);
	  // v1.setMag(v2nNew);
	  // v2.setMag(v2t);
	  // orb.vel = p5.Vector.add(v1, v2);
	  
	  // MY APPROACH USING CONSERVATION OF MOMENTUM AND ENERGY
	  // let a, b;
	  // a = this.mass * this.vel.x * this.vel.x + orb.mass * orb.vel.x * orb.vel.x;
	  // b = this.mass * this.vel.x + orb.mass * orb.vel.x;
	  // orb.vel.x = solveQuadratic(-1 * this.mass * orb.mass, orb.mass, this.mass*a - b);
	  // this.vel.x = sqrt((a - orb.mass * orb.vel.x * orb.vel.x) / this.mass);
	  
	  // a = this.mass * this.vel.y * this.vel.y + orb.mass * orb.vel.y * orb.vel.y;
	  // b = this.mass * this.vel.y + orb.mass * orb.vel.y;
	  // orb.vel.y = solveQuadratic(-1 * this.mass * orb.mass, orb.mass, this.mass*a - b);
	  // this.vel.y = sqrt((a - orb.mass * orb.vel.y * orb.vel.y) / this.mass);
	  
	  // MY SECOND APPROACH USING CONSERVATION OF MOMENTUM AND ENERGY
	  let A, B;
	  A = this.mass * this.vel.x + orb.mass * orb.vel.x;
	  B = this.mass * this.vel.x * this.vel.x + orb.mass * orb.vel.x * orb.vel.x;
	  if (Math.sign(this.vel.x) === -1 && Math.sign(orb.vel.x) === 1) {
		this.vel.x = solveQuadratic(this.mass * this.mass + this.mass * orb.mass, -2*A*this.mass, A*A-orb.mass*B);
	  } else {
		this.vel.x = solveQuadraticN(this.mass * this.mass + this.mass * orb.mass, -2*A*this.mass, A*A-orb.mass*B);
	  }
	  orb.vel.x = (A - this.mass * this.vel.x)/orb.mass;
	  
	  A = this.mass * this.vel.y + orb.mass * orb.vel.y;
	  B = this.mass * this.vel.y * this.vel.y + orb.mass * orb.vel.y * orb.vel.y;
	  //this.vel.y = solveQuadratic(this.mass * this.mass + this.mass * orb.mass, -2*A*this.mass, A*A-orb.mass*B);
	  if (Math.sign(this.vel.y) === -1 && Math.sign(orb.vel.y) === 1) {
		this.vel.y = solveQuadratic(this.mass * this.mass + this.mass * orb.mass, -2*A*this.mass, A*A-orb.mass*B);
	  } else {
		this.vel.y = solveQuadraticN(this.mass * this.mass + this.mass * orb.mass, -2*A*this.mass, A*A-orb.mass*B);
	  }
	  orb.vel.y = (A - this.mass * this.vel.y)/orb.mass;
	  
	  // THE APPROACH USING KINEMATICS FROM THE INTERNET
	  // this.vel.x = ((this.mass - orb.mass) * this.vel.x + 2 * this.mass * orb.mass) / (this.mass + orb.mass);
	  // orb.vel.x = ((orb.mass - this.mass) * this.vel.x + 2 * this.mass * orb.mass) / (this.mass + orb.mass);
	  // this.vel.y = ((this.mass - orb.mass) * this.vel.y + 2 * this.mass * orb.mass) / (this.mass + orb.mass);
	  // orb.vel.y = ((orb.mass - this.mass) * this.vel.y + 2 * this.mass * orb.mass) / (this.mass + orb.mass);
	  
	  // STUPID IF STATEMENTS
	  // if (Math.sign(this.vel.x) !== Math.sign(orb.vel.x)) {
		  // this.vel.x *= -1;
		  // orb.vel.x *= -1;
	  // }
	  // if (Math.sign(this.vel.y) !== Math.sign(orb.vel.y)) {
		  // this.vel.y *= -1;
		  // orb.vel.y *= -1;
	  // }
	}
  }
  
  friction() {
	  // apply friction
	  if (this.vel.mag() === 0) {
		// apply static friction 
		return;
	  } else {
		this.applyForce(p5.Vector.mult(this.vel, -(this.mass * 9.8 * this.ckf)/this.vel.mag()));
	  }
  }

  draw() {
    // draw the circle to the screen
	//this.env.drawArrow(this.pos, this.acc, createVector(0, 0, 255));
	//this.env.drawArrow(this.pos, this.vel, createVector(255, 0, 0));
    this.env.drawCircle(this.pos, this.r, this.color);
	
	let point = env.coordinateTransform(this.pos);
	if (this.lastPoint !== null) {
			env.bgSurf.stroke(this.color.x, this.color.y, this.color.z);
			env.bgSurf.line(this.lastPoint.x, this.lastPoint.y, point.x, point.y);
		}
	this.lastPoint = point;
  }

  update() {
    // accelerations/force applications happen here
	
	//
	
	if (frameCount > 1) {
		//this.friction();
		this.applyForce(createVector(0, -this.mass * constants.EARTH_GRAV_ACC));
		
		//console.log(this.acc);
		this.acc.mult(this.env.timeStep);
		this.vel.add(this.acc);
		if (this.vel.mag() > constants.SPEED_OF_LIGHT) {
			this.vel.setMag(constants.SPEED_OF_LIGHT);
		}

		this.pos.add(p5.Vector.mult(this.vel,this.env.timeStep));
		this.calculateCenterOfMass();
		this.handleBoundaries();

		this.draw();
		this.acc.set(0, 0, 0);
	} else {
		this.calculateCenterOfMass();
	}
  }
}


class Spring {
	
	constructor(A, B, length=10, k=20, width=5, aFixed=false) {
		env.addObject(this);
		this.type = "Spring";
		this.A = A, this.B = B;
		this.length = length;
		this.k = k;
		this.halfWidth = width / 2;
		this.aFixed = aFixed;
	}
	
	draw(dir) {
		let drawPos = this.A.pos.copy(), point, nPiv=26, orth, aboveHoriz;
		dir.mult(p5.Vector.sub(this.A.pos, this.B.pos).mag() / - nPiv);
		if (dir.y === 0) {
			orth = createVector(0, 1);
		} else {
			orth = createVector(1, -dir.x/dir.y).normalize(); // perpendicular to spring direction
		}
		point = env.coordinateTransform(drawPos);
		if (this.B.pos.y >= this.A.pos.y) {
			aboveHoriz = 1;
		} else {
			aboveHoriz = -1;
		}

		stroke(0);
		noFill();
		strokeWeight(1);
		beginShape();
		vertex(point.x, point.y);
		for (let i=1; i<nPiv-1; i++) {
			drawPos.add(dir);
			point = env.coordinateTransform(p5.Vector.add(drawPos, p5.Vector.mult(orth, aboveHoriz*pow(-1, i)*this.halfWidth)));
			vertex(point.x, point.y);
		}
		point = env.coordinateTransform(this.B.pos);
		vertex(point.x, point.y);
		endShape();
		
		//env.drawCircle2(this.A.pos, this.length, createVector(0,0,255));
		//env.drawCircle2(this.B.pos, this.length, createVector(0,0,255));
	}
	
	update() {
		if (frameCount > 1) {
			let x = this.length - dist(this.A.pos.x, this.A.pos.y, this.B.pos.x, this.B.pos.y); // displacement of mass from equilibrium
			let dir = p5.Vector.sub(this.A.pos, this.B.pos).normalize(); // direction vector of spring
			
			let F_spring = p5.Vector.mult(dir, this.k * x);
			if (!this.aFixed) {this.A.applyForce(F_spring);}
			this.B.applyForce(F_spring.mult(-1));
			this.draw(dir);
		}
	}	
}


class Rectangle extends RigidBody {
	
	constructor(x=0, y=0, width=1, height=1, mass=1, charge=0, color=createVector(255, 0, 0),
				elasticity=1, csf=0.75, ckf=0.5, dragCoef=0.5) {
		super(env, x, y, mass, charge, color, elasticity, csf, ckf, dragCoef);
		this.type = "Rectangle";
		
		this.width = width;
		this.height = height;
		
		this.angle = 0;
		this.angVel = 0;
		this.angAcc = 0;
		
		this.cornerVectors();
		this.findNormals();
		this.calculateQuantities();
	}
	
	setAngle(angle) {
		this.angle = angle % TWO_PI;
	}
	
	setAngularVelocity(angVel) {
		this.angVel = angVel;
	}
	
	setAngularAcceleration(angAcc) {
		this.angAcc = angAcc;
	}
	
	calculateArea() {
		// calculate the area of the object
		return this.width * this.height;
	}

  calculateMoment() {
    // calculate the object's moment of inertia
	return 1 / 12 * this.mass * (this.width * this.width + this.height * this.height);
  }

  calculateCenterOfMass() {
    // calculate the object's center of mass
	return this.pos;
  }
  
  cornerVectors() {
	  this.xV = createVector(this.width/2 * cos(this.angle), this.width/2 * sin(this.angle));
	  this.yV = createVector(this.height/2 * cos(this.angle + HALF_PI), this.height/2 * sin(this.angle + HALF_PI));
	  let topLeft, topRight, botLeft, botRight;
	  topLeft = env.coordinateTransform(p5.Vector.add(p5.Vector.sub(this.pos, this.xV), this.yV));
	  topRight = env.coordinateTransform(p5.Vector.add(p5.Vector.add(this.pos, this.xV), this.yV));
	  botLeft = env.coordinateTransform(p5.Vector.sub(p5.Vector.sub(this.pos, this.xV), this.yV));
	  botRight = env.coordinateTransform(p5.Vector.sub(p5.Vector.add(this.pos, this.xV), this.yV));
	  this.vertices = [topLeft, topRight, botRight, botLeft];
  }
  
  findNormals() {
	  let p1, p2;
	  this.normals = [];
	  for (let i=0; i<this.vertices.length; i++) {
		  p1 = this.vertices[i];
		  p2 = this.vertices[i+1] || this.vertices[0];
		  this.normals[i] = createVector(p2.y - p1.y, p1.x - p2.x).normalize();
		  this.normals[this.vertices.length+i] = -this.normals[i];
	  }
  }
  
  handleBoundaries() {
        if (this.centerOfMass.x > this.env.xMeters) {
          this.pos.x = 0;
        }
        if (this.centerOfMass.x < 0) {
          this.pos.x = this.env.xMeters;
        }
        if (this.centerOfMass.y > this.env.yMeters) {
          this.pos.y = 0;
        }
        if (this.centerOfMass.y < 0) {
          this.pos.y = this.env.yMeters;
		}
  }
  
  minMax(vec) {
	  let min = Infinity, max=-Infinity, val, localThis = this;
	  this.vertices.forEach(function(vert) {
		  val = p5.Vector.add(localThis.pos, vert).dot(vec);
		  min = val < min ? val : min;
		  max = val > max ? val : max;
	  });
	  return {min: min, max: max,};
  }
  
  collideRect(rect) {
	  let p1, p2;
	  let localThis = this;
	  return this.normals.concat(rect.normals).every(function(norm) {
		  p1 = localThis.minMax(norm);
		  p2 = rect.minMax(norm);
		  return (((p1.min <= p2.max) && (p1.max >= p2.min) || (p2.min >= p1.max) && (p2.max >= p1.min)));
	  });
  }
	
  draw() {
	stroke(0);
	fill(this.color.x, this.color.y, this.color.z);
	beginShape();
	for (let vert of this.vertices) {
		vertex(vert.x, vert.y);
	}
	vertex(this.vertices[0].x, this.vertices[0].y);
	endShape();
	
	env.drawLine(this.pos, p5.Vector.add(this.pos, this.yV), createVector(0,0,0));
  }
  
  update() {
	if (frameCount > 1) {
		this.applyForce(createVector(0, -this.mass * constants.EARTH_GRAV_ACC));

		this.acc.mult(env.timeStep);
		this.vel.add(this.acc);
		if (this.vel.mag() > constants.SPEED_OF_LIGHT) {
			this.vel.setMag(constants.SPEED_OF_LIGHT);
		}
		this.pos.add(p5.Vector.mult(this.vel,env.timeStep));
		
		this.angAcc *= env.timeStep;
		this.angVel += this.angAcc;
		this.angle += this.angVel * env.timeStep;
		
		this.cornerVectors();
		this.findNormals();
		this.calculateCenterOfMass();
		this.handleBoundaries();

		this.draw();
		this.acc.set(0, 0, 0);
		this.angAcc = 0;
	} else {
		this.calculateCenterOfMass();
	}  
  }
}

env = new Environment(window.innerWidth, window.innerHeight, p5.prototype.createVector(255, 255, 255));
