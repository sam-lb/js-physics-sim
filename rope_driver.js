


class RopeSimulation extends BaseSimulation {

  constructor(canvasWidth, canvasHeight, nodeCount=100, linkLength=0.1, linkStrength=1, nodeMass=1, pixelsPerMeter=1, timeStep=1/60) {
    super(canvasWidth, canvasHeight, pixelsPerMeter, timeStep);
    this.nodeCount = nodeCount;
    this.linkLength = linkLength;
    this.linkStrength = linkStrength;
    this.nodeMass = nodeMass;
    this.links = [];
    this.generateLinks();
  }

  generateLinks() {
    let y = this.yUnits-10;
    for (let i=0; i<this.nodeCount; i++) {
      new RopeNode(this, this.xUnits/2, y, 0.05, false, false, this.nodeMass);
      y -= this.linkLength;
    }
    this.physicsObjects[0].toggleFixed();

    for (let i=1; i<this.physicsObjects.length; i++) {
      this.links.push(new RopeLink(this, this.physicsObjects[i-1], this.physicsObjects[i], this.linkLength, this.linkStrength));
    }
  }

  update() {
    if (!this.paused) {
      clear();
      for (let link of this.links) {
        link.update();
      }
      super.update();
    }
  }
}


class ClothSimulation extends BaseSimulation {

  constructor(canvasWidth, canvasHeight, nodeCount=10, linkLength=1, linkStrength=1, nodeMass=1, pixelsPerMeter=1, timeStep=1/60) {
    super(canvasWidth, canvasHeight, pixelsPerMeter, timeStep);
    this.nodeCount = nodeCount;
    this.linkLength = linkLength;
    this.linkStrength = linkStrength;
    this.nodeMass = nodeMass;
    this.links = [];
    this.generateLinks();
  }

  generateLinks() {
    for (let i=0; i<this.nodeCount; i++) {
      for (let j=0; j<this.nodeCount; j++) {
        new RopeNode(this, this.xUnits/2-10+j*this.linkLength, this.yUnits-10-i*this.linkLength, 0.05, false, false, this.nodeMass);
      }
    }

    this.physicsObjects[0].toggleFixed();
    this.physicsObjects[this.nodeCount-1].toggleFixed();
    // this.physicsObjects[(this.nodeCount-1)*(this.nodeCount)].toggleFixed();
    // this.physicsObjects[this.physicsObjects.length-1].toggleFixed();
    //this.physicsObjects[Math.floor(this.nodeCount/2)].toggleFixed();



    let node1, node2, node3;
    for (let i=0; i<this.nodeCount-1; i++) {
      for (let j=0; j<this.nodeCount-1; j++) {
        node1 = this.physicsObjects[j+i*this.nodeCount];
        node2 = this.physicsObjects[1+j+i*this.nodeCount];
        node3 = this.physicsObjects[j+(i+1)*this.nodeCount];
        this.links.push(new RopeLink(this, node1, node2, this.linkLength, this.linkStrength));
        this.links.push(new RopeLink(this, node1, node3, this.linkLength, this.linkStrength));

        if (i === this.nodeCount-2) {
          this.links.push(new RopeLink(this, node3, this.physicsObjects[1+j+(i+1)*this.nodeCount], this.linkLength, this.linkStrength));
        }

        if (j === this.nodeCount-2) {
          this.links.push(new RopeLink(this, node2, this.physicsObjects[1+j+(i+1)*this.nodeCount], this.linkLength, this.linkStrength));
        }
      }
    }
  }

  update() {
    if (!this.paused) {
      clear();
      for (let link of this.links) {
        link.update();
      }
      super.update();
    }
  }
}


class RopeLink {

  constructor(sim, node1, node2, restLength, springConstant) {
    this.sim = sim;
    this.node1 = node1;
    this.node2 = node2;
    this.restLength = restLength;
    this.springConstant = springConstant;
  }

  draw() {
    const pos1 = this.sim.transformCoordinates(this.node1.pos);
    const pos2 = this.sim.transformCoordinates(this.node2.pos);
    push();
    strokeWeight(1);
    stroke(0,0,255);
    line(pos1.x, pos1.y, pos2.x, pos2.y);
    pop();
  }

  update() {
    const force = p5.Vector.sub(this.node2.pos, this.node1.pos);
    if (force.x === 0 && force.y === 0) return; // cut out here because this would cause a zero division error
    const mag = force.mag();
    const displacement = mag - this.restLength;
    force.mult(this.springConstant * displacement / mag);
    this.node1.applyForce(force);
    this.node2.applyForce(p5.Vector.mult(force, -1));
    this.draw();
  }

}


class RopeNode extends PhysicsObject {

  constructor(sim, x, y, radius, fixed=false, visible=true, mass=1) {
    super(sim, x, y, mass);
    this.radius = radius;
    this.diameter = 2 * this.radius;
    this.fixed = fixed;
    this.visible = visible;
  }

  toggleFixed() {
    this.fixed = !this.fixed;
  }

  draw() {
    const pos = this.sim.transformCoordinates(this.pos);
    push();
    stroke(0);
    strokeWeight(1);
    fill(255);
    circle(pos.x, pos.y, this.sim.scaleMeterQuantity(this.diameter));
    pop();
  }

  update() {
    this.applyForce(createVector(0, -constants.g));
    if (!this.fixed) super.update();
    if (this.visible) this.draw();
  }

}


function dragObject() {
  const mousePos = simulation.reverseCoordinates(createVector(mouseX, mouseY));

  if (nearestObj === null) {
    nearestObj = simulation.physicsObjects[0];
    let minDist = dist(nearestObj.pos.x, nearestObj.pos.y, mousePos.x, mousePos.y), distance;
    for (let pObj of simulation.physicsObjects) {
      distance = dist(pObj.pos.x, pObj.pos.y, mousePos.x, mousePos.y);
      if (distance < minDist) {
        minDist = distance;
        nearestObj = pObj;
      }
    }
  }
  const force = p5.Vector.sub(mousePos, nearestObj.pos);
  force.normalize();
  force.mult(15000*nearestObj.mass);
  nearestObj.applyForce(force);
}

function mouseReleased() {
  nearestObj = null;
}


let simulation, projectile, nearestObj = null;
function setup() {
	const canvas = createCanvas(windowWidth/2, windowHeight);
	canvas.parent("canvas-div");
	//simulation = new RopeSimulation(width, height, 50, 1/10, 1000, 1/10, 10, 1/600); // width, height, #nodes, restLength, k, mass, pixperm, timestep
  simulation = new ClothSimulation(width, height, 20, 1, 1000, 1/10, 10, 1/300); // width, height, #nodes, restLength, k, mass, pixperm, timestep
  simulation.toggleClearOnUpdate();
  //simulation.toggleGridlines();
}

function draw() {
  if (mouseIsPressed) {
    dragObject();
  }
	simulation.update();
}
