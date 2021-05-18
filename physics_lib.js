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
    this.xScale = this.canvasWidth / this.pixelsPerMeter;
    this.yScale = this.canvasHeight / this.pixelsPerMeter;
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

  update() {
    /* Do a single simulation step */
    if (!paused) {
      for (let obj of this.physicsObjects) {
        obj.update();
      }
      this.simTime += this.timeStep;
    }
  }

}
