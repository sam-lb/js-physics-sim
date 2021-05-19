const constants = {
  g: 9.81,
  G: 6.67 * Math.pow(10,-11),
  e: 1.6 * Math.pow(10,-19),
  k: 9 * Math.pow(10,9),
  c: 3 * Math.pow(10,8),
};


function nearestGreaterMagnitudeInteger(x) {
  if (x > 0) return Math.ceil(x);
  return Math.floor(x);
}


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
    this.setScales(canvasWidth, canvasHeight);
    this.setPixelsPerMeter(pixelsPerMeter);

    this.simTime = 0;
    this.paused = false;
    this.gridlines = false;
    this.showSimTime = true;
    this.physicsObjects = [];
  }

  setTimeStep(timeStep) {
    /* Set the time step per iteration of the simulation */
    this.timeStep = timeStep;
  }

  setPixelsPerMeter(pixelsPerMeter) {
    /* Set a new pixels to meters ratio and computes number of units in each direction */
    this.pixelsPerMeter = pixelsPerMeter;
    this.xUnits = this.canvasWidth / this.pixelsPerMeter;
    this.yUnits = this.canvasHeight / this.pixelsPerMeter;
  }

  setScales(canvasWidth, canvasHeight) {
    /* Determines the pixel to meter scale when the canvas resizes */
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  resetSimulationTime() {
    /* Set the simulation time to zero */
    this.simTime = 0;
  }

  pause() {
    /* Pause the simulation */
    this.paused = false;
  }

  unpause() {
    /* Pause the simulation */
    this.paused = true;
  }

  toggleGridlines() {
    /* Toggle whether gridlines are drawn to the screen */
    this.gridlines = !this.gridlines;
  }

  toggleShowSimulationTime() {
    /* Toggle whether the simulation time is drawn to the screen */
    this.showSimTime = !this.showSimTime;
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

  drawGridlines() {
    push();
    strokeWeight(1);
    stroke(128, 128);
    let point1, point2;
    for (let x=0; x<this.xUnits+1; x++) {
      point1 = this.transformCoordinates(createVector(x, 0));
      point2 = this.transformCoordinates(createVector(x, this.yUnits));
      line(point1.x, point1.y, point2.x, point2.y);
    }
    for (let y=0; y<this.yUnits+1; y++) {
      point1 = this.transformCoordinates(createVector(0, y));
      point2 = this.transformCoordinates(createVector(this.xUnits, y));
      line(point1.x, point1.y, point2.x, point2.y);
    }
    pop();
  }

  drawSimulationTime() {
    push();
    noStroke();
    fill(0);
    textSize(20);
    text("Simulation time: " + Math.round(this.simTime*10)/10, 20, 30);
    pop();
  }

  update() {
    /* Do a single simulation step */
    if (!this.paused) {
      clear();
      if (this.gridlines) this.drawGridlines();
      for (let obj of this.physicsObjects) {
        obj.update();
      }
      this.simTime += this.timeStep;
      if (this.showSimTime) this.drawSimulationTime();
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
    this.originalPosition = createVector(x, y);
    this.reset();
    this.mass = mass;
    this.inverseMass = 1/this.mass;
  }

  setPosition(pos) {
    this.pos = pos;
  }

  setVelocity(vel) {
    this.vel = vel;
  }

  setAcceleration(acc) {
    this.acc = acc;
  }

  applyForce(force) {
    this.acc.add(p5.Vector.mult(force, this.inverseMass));
  }

  reset() {
    this.pos = this.originalPosition.copy();
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
  }

  update() {
    this.vel.y = min(this.vel.y, 1000);
    this.vel.add(p5.Vector.mult(this.acc, this.sim.timeStep));
    this.pos.add(p5.Vector.mult(this.vel, this.sim.timeStep));
    this.acc.set(0, 0, 0);
  }

}
