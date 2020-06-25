let orbCount, mc, orb2;
let o1, o2, o3, o4, spring;
let traceOn;
let rect, rect2;

function setup() {
	const canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent("canvas-div");
	
	mc = (r) => {return pow(15*r,2)};
  orbCount = 165;
  env.setBoundaryMode(boundaryModes.BOUNDARIES_ON);
  env.setPixelsPerMeter(25);
  env.setGravityEnabled(false);
  env.setCollisionsEnabled(false);
  env.setTimeStep(1/100);
  generateOrbs();
  
  traceOn = false;
}

function generateOrbs() {
	/*let orb, r;
	for (let i=0; i<orbCount; i++) {
		orb = new Orb(env, random() * env.xMeters, random() * env.yMeters, 8*constants.EARTH_RADIUS, constants.EARTH_MASS, 0, createVector(0,random(255),255));
		//orb.setVelocity(p5.Vector.random2D().mult(random(25, 50) * pow(10, 6)));
	}*/
	
	// let orb, pos, mass;
	// let center = createVector(0.5*env.xMeters, 0.5*env.yMeters);
	// for (let i=0; i<orbCount; i++) {
		// pos = createVector(random() * env.xMeters, random() * env.yMeters);
		// mass = random(1, 6);
		// orb = new Orb(env, random() * env.xMeters, random() * env.yMeters, 20+mass, mass, 0, createVector(mass/5*255, 128, 128), 1);
		/*orb = (new Orb(env, pos.x, pos.y, 15, 5000, 0, createVector(255, 255, 0), 1));*/
		// orb.setVelocity(p5.Vector.fromAngle(HALF_PI+atan2(pos.y-center.y, pos.x-center.x)).mult(200));
	// }
	

	//(new Orb(env, 0.6 * env.xMeters, 0.5*env.yMeters, 1, 40, 0, createVector(255, 0, 0))).setVelocity(createVector(-50, -30));
	//orb2 = new Orb(env, 0.3*env.xMeters, env.yMeters*0.5, 5, 500000, 0, createVector(255, 128, 0), 0, 0);
	//(new Orb(env, 0.5*env.xMeters, env.yMeters*0.5, 45, 5000000, 0, createVector(255, 200, 0), 1));
	
	// let x = 0.4*env.xMeters;
	// for (let i=0; i<4; i++) {
		// new Orb(env, x, 0.5*env.yMeters, 30, .1, 0, createVector(255, random()*255, 128), 1, 0, 0, 0);
		// x += 60;
	// }
	// (new Orb(env, 0, 0.5*env.yMeters, 30, .1, 0, createVector(0, 0, 255))).setVelocity(createVector(150, 0), 1, 0, 0, 0);
	
	//spring = new Spring(createVector(env.xMeters/2,env.yMeters/2+2.5), createVector(env.xMeters/2+0.5, env.yMeters/2+2),3,60,10,1);
	//spring = new Spring(createVector(env.xMeters/2-1.5,env.yMeters/2), createVector(env.xMeters/2+1.5, env.yMeters/2),3,100,10,1,false);
	//o1 = new Orb(env, env.xMeters/2+1.5, env.yMeters/2-4, 0.2, 3, 0, createVector(255, 0, 0));
	//o2 = new Orb(env, env.xMeters/2-1.5, env.yMeters/2-4, 0.2, 3, 0, createVector(0, 0, 255));
	//o3 = new Orb(env, env.xMeters/2, env.yMeters/2+1.5*sqrt(3)-4, 0.2, 3, 0, createVector(0, 255, 0));
	//o3.setVelocity(createVector(280, 0));
	//o4 = new Orb(env, env.xMeters/2, env.yMeters/2, 0.05, 30, 0, createVector(0,0,0));
	//new Spring(o2, o1, 3, 350000000, 0.15, false);
	//new Spring(o1, o3, 3, 350000000, 0.15, false);
	//new Spring(o3, o2, 3, 350000000, 0.15, false);
	//spring = new Spring(o4, o3, 4, 200, 0.15, true);
	
	rect = new Rectangle(env.xMeters/2-20, env.yMeters/2-7, 5, 8, 1, 0, createVector(0, 255, 0));
	rect.setAngularVelocity(random(0,3));
	rect.setVelocity(createVector(random(10, 15), random(10, 15)));
	rect2 = new Rectangle(env.xMeters/2+20, env.yMeters/2-7, 13, 3, 1, 0, createVector(0, 0, 255))
	rect2.setAngularVelocity(-6,-3);
	rect2.setVelocity(createVector(random(-15, -10), random(10, 15)));
}

function kineticEnergy() {
	let ke = 0;
	for (let orb of env.objects) {
		ke += 0.5 * orb.mass * orb.vel.magSq();
	}
	text(""+ke, 10, 10);
}

function keyPressed() {
	if (key === " ") {
		// let list = [];
		// for (let object of env.objects) {
			// if (object !== spring) {
				// list.push(object);
			// }
		// } 
		// env.objects = list;
	} else if (key === "r") {
		env.bgSurf.background(255);
	} else if (key === "t") {
		traceOn = !traceOn;
	}
}

function draw() {
	if (frameCount>1) {
		env.setTimeStep(1/frameRate())
		//o4.applyForce(createVector(0, o4.mass*constants.EARTH_GRAV_ACC));
		if (!traceOn) { env.bgSurf.background(255); }
	};
  env.update();
  //kineticEnergy();
}
