// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let stage = {
  1:{"pieces":[["box",0,0,0,200,10,200],["box",100,0,100,200,10,200]]},
  2:{},
  3:{},
};
let level = 1;
let myWonderfulBoxes = [];
let myFriend;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  myFriend = new Player(0,-120,0,40,70,40);
  createLevel();
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
  for (let box = 0; box < myWonderfulBoxes.length; box++) {
    myWonderfulBoxes[box].display();
    myFriend.checkCollision(myWonderfulBoxes[box]);
  }
}

class Player {
  constructor(x, y, z, sizeX, sizeY, sizeZ) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.sizeZ = sizeZ;
    this.speed = 5;
    this.fallingspeed = 5;
    this.isOnFloor = false;
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
      this.y += this.fallingspeed;
    }
    
    //Movement
    //w
    if (keyIsDown(87)) {
      this.z -= this.speed;
    }
    //a
    if (keyIsDown(65)) {
      this.z -= this.speed;
    }
    //s
    if (keyIsDown(83)) {
      this.z -= this.speed;
    }
    //d
    if (keyIsDown(68)) {
      this.z -= this.speed;
    }
  }

  checkCollision(colBox) {
    if (this.y + this.sizeY < colBox.y && this.y + this.sizeY > colBox.y - 7 && (this.x > colBox.x - colBox.sizeX && this.x < colBox.x + colBox.sizeX) && (this.z > colBox.z - colBox.sizeZ && this.z < colBox.z + colBox.sizeZ)) {
      console.log("haha look at me im stading");
      this.isOnFloor = true;
    }
    else {
      this.isOnFloor = false;
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
    translate(this.x, this.y, this.z);
    box(this.sizeX, this.sizeY, this.sizeZ);
  }
}