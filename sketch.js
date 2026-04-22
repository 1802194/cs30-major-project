// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

//https://threejs.org/docs/#AnimationMixer

let stage = {
  1:{"pieces":[["box",120,-100,-130,200,75,200],["box",0,0,0,700,10,700]]},
  2:{},
  3:{},
};
let level = 1;
let myWonderfulBoxes = [];
let myFriend, cam, font, angle, pg;

function preload() {
  font = loadFont("/SeagirlDreams.otf");
}

function setup() {
  createCanvas(1280, 720, WEBGL);
  myFriend = new Player(0,-120,0,40,70,40);
  createLevel();
  cam = _renderer._curCamera; 
}

function createLevel() {
  myWonderfulBoxes = [];
  let badword = stage[level]["pieces"];
  for (let piece = 0; piece < stage[level]["pieces"].length; piece++) {
    let boxexclaimationmark = new Box(badword[piece][1],badword[piece][2],badword[piece][3],badword[piece][4],badword[piece][5],badword[piece][6]);
    myWonderfulBoxes.push(boxexclaimationmark);
  }
}

function draw() {
  background(220);
  orbitControl();
  myFriend.display();
  myFriend.update();
  myFriend.isOnFloor = false;
  for (let box = 0; box < myWonderfulBoxes.length; box++) {
    myWonderfulBoxes[box].display();
    myFriend.checkCollision(myWonderfulBoxes[box]);
  }
  let cam_x = cam.centerX - cam.eyeX;
  let cam_z = cam.centerZ - cam.eyeZ;
  let yaw = atan2(cam_x, cam_z);
  angle = yaw;
  // *(360/PI) for degrees btw
}

class Player {
  constructor(x, y, z, sizeX, sizeY, sizeZ) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.airtime = 0;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.sizeZ = sizeZ;
    this.speed = 3;
    this.fallingspeed = 8;
    this.airacceleration = 0.75;
    this.airtime = 0;
    this.isOnFloor = false;
    this.lastPosition = {x: this.x, y: this.y, z: this.z};
  }

  display() {
    push();
    translate(this.x, this.y, this.z);
    ellipsoid(this.sizeX, this.sizeY, this.sizeZ);
    pop();
  }

  update() {
    //Gravity
    if (!this.isOnFloor) {
      this.y += this.fallingspeed + this.airtime;
      this.airtime += this.airacceleration;
    }
    else {
      this.airtime = 0;
    }

    this.lastPosition = {x: this.x, y: this.y, z: this.z};

    // W
    if (keyIsDown(87)) {
      this.x += sin(angle)*this.speed;
      this.z += cos(angle)*this.speed;
    }
    // S
    if (keyIsDown(83)) {
      this.x -= sin(angle)*this.speed;
      this.z -= cos(angle)*this.speed;
    }
    // A
    if (keyIsDown(68)) {
      this.x -= cos(angle)*this.speed;
      this.z += sin(angle)*this.speed;
    }
    // D
    if (keyIsDown(65)) {
      this.x += cos(angle)*this.speed;
      this.z -= sin(angle)*this.speed;
    }
  }

  checkCollision(colBox) {
    if (this.y + this.sizeY < colBox.y + colBox.sizeY && 
      this.y + this.sizeY > colBox.y - 7 && 
      (this.x + this.sizeX/2 > colBox.x - colBox.sizeX/2 && 
      this.x - this.sizeX/2 < colBox.x + colBox.sizeX/2) &&
      (this.z + this.sizeZ/2 > colBox.z - colBox.sizeZ/2 &&
      this.z - this.sizeZ/2 < colBox.z + colBox.sizeZ/2)) {
      this.isOnFloor = true;
    }

    if (this.y + this.sizeY > colBox.y + colBox.sizeY &&
      (this.x + this.sizeX/2 > colBox.x - colBox.sizeX/2 && 
      this.x - this.sizeX/2 < colBox.x + colBox.sizeX/2) &&
      (this.z + this.sizeZ/2 > colBox.z - colBox.sizeZ/2 &&
      this.z - this.sizeZ/2 < colBox.z + colBox.sizeZ/2)) {
      if (this.z > colBox.z + colBox.sizeX / 2 || this.z < colBox.z - colBox.sizeX / 2) {
        this.z = this.lastPosition.z;
      } 
      if (this.x < colBox.x - colBox.sizeZ / 2 || this.x > colBox.x + colBox.sizeZ / 2) {
        this.x = this.lastPosition.x;
      }
    }
  }
}

class Box {
  constructor(x, y, z, sizeX, sizeY, sizeZ) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.sizeZ = sizeZ;
  }

  display() {
    push();
    translate(this.x, this.y, this.z);
    box(this.sizeX, this.sizeY, this.sizeZ);
    pop();
  }
}