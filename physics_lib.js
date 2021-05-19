const constants = {
  g: 9.81,
  G: 6.67 * Math.pow(10,-11),
  e: 1.6 * Math.pow(10,-19),
  k: 9 * Math.pow(10,9),
  c: 3 * Math.pow(10,8),
};


class BaseSimulation {

  /*
  All simulations inherit from BaseSimulation.
  Handles timing, coordinates, and all physics objects.
  */

  constructor(canvasWidth, canvasHeight, pixelsPerMeter=1, timeStep=1/60) {
    /*
    canvasWidth, canvasHeight : dimensions of the JS canvas in pixels
    pixelsPerMeter: ratio of pixels to meters
    timeStep: time step per interation of the simulation
    */
    this.setTimeStep(timeStep);
    this.setPixelsPerMeter(pixelsPerMeter);
    this.setScales(canvasWidth, canvasHeight);

    this.simTime = 0;
    this.paused = false;
    this.physicsObjects = [];
  }

  setTimeStep(timeStep) {
    /* Set the time step per iteration of the simulation */
    this.timeStep = timeStep;
  }

  setPixelsPerMeter(pixelsPerMeter) {
    /* Set a new pixels to meters ratio */
    this.pixelsPerMeter = pixelsPerMeter;
  }

  setScales(canvasWidth, canvasHeight) {
    /* Determines the pixel to meter scale when the canvas resizes */
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  pause() {
    /* Pause the simulation */
    this.paused = false;
  }

  unpause() {
    /* Pause the simulation */
    this.paused = true;
  }

  addPhysicsObject(physicsObject) {
    /* Add a physics object to the simulation */
    this.physicsObjects.push(physicsObject);
  }

  transformCoordinates(point) {
    /* Convert point in meter space to pixels */
    return createVector(point.x * this.pixelsPerMeter, this.canvasHeight - point.y * this.pixelsPerMeter);
  }

  scaleMeterQuantity(quantity) {
    /* Convert meter quantity to pixels  */
    return quantity * this.pixelsPerMeter;
  }

  update() {
    /* Do a single simulation step */
    if (!this.paused) {
      clear();
      for (let obj of this.physicsObjects) {
        obj.update();
      }
      this.simTime += this.timeStep;
    }
  }

}


class PhysicsObject {

  /*
  All physics objects inherit from PhysicsObject.
  Handles the physics of a single object (not interactions between objects, or drawing (by default))
  */

  constructor(sim, x, y, mass=1) {
    this.sim = sim;
    this.sim.addPhysicsObject(this);
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.mass = mass;
    this.inverseMass = 1/this.mass;
  }

  setPosition(pos) {
    this.pos = pos;
  }

  applyForce(force) {
    this.acc.add(p5.Vector.mult(force, this.inverseMass));
  }

  update() {
    this.vel.add(p5.Vector.mult(this.acc, this.sim.timeStep));
    this.pos.add(p5.Vector.mult(this.vel, this.sim.timeStep));
    this.acc.set(0, 0, 0);
  }

}
