// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

//https://threejs.org/docs/#AnimationMixer
let stage = {};
let level = 1;
let myWonderfulBoxes = [];
let allStars = [];
let myFriend, cam, font, angle, pg;
let player_spawn_cords = [0,0,0];
let showHitboxes = false;

// - reused wait function from my Grid Game - [aurora [starzz]]
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function keyPressed() {
  if (key === "q") {
    saveJSON(stage);
  }
  if (key === "e") {
    createLevel();
  }
  if (key === "r") {
    level += 1;
    createLevel();
  }
  if (key === "b") {
    showHitboxes = !showHitboxes;
  }
}

function preload() {
  font = loadFont("SeagirlDreams.otf");
}

function setup() {
  createCanvas(1280, 720, WEBGL);
  createLevel();
  cam = _renderer._curCamera; 
}

async function createLevel() {
  stage = loadJSON("levels/level"+level+".json", onLevelLoad);
}

function onLevelLoad() {
  // This array stores all of the objects present on he field
  myWonderfulBoxes = [];

  let badword = stage["pieces"];
  // Checks the json for the level to know what objects need to be added
  for (let piece = 0; piece < badword.length; piece++) {
    // Creates a rectangular prism based on the position and dimensions in the json
    if (badword[piece][0] === "box") {
      let boxexclaimationmark = new Box(badword[piece][1],badword[piece][2],badword[piece][3],badword[piece][4],badword[piece][5],badword[piece][6]);
      myWonderfulBoxes.push(boxexclaimationmark);
    }
    if (badword[piece][0] === "movingplat_vertical") {
      let boxexclaimationmark = new VertMoving(badword[piece][1],badword[piece][2],badword[piece][3],badword[piece][4],badword[piece][5],badword[piece][6]);
      myWonderfulBoxes.push(boxexclaimationmark);
    }
    else if (badword[piece][0] === "player_spawn") {
      // Determines the player's spawn point
      // could've done a for loop for this but.... ehhhhhhhhhhhh im lazy ill do it later (if i remember) - [starzz (aurora)]
      player_spawn_cords[0] = badword[piece][1];
      player_spawn_cords[1] = badword[piece][2];
      player_spawn_cords[2] = badword[piece][3];
    }
    else if (badword[piece][0] === "star") {
      // Creates a star at the specified position to be collected by the player
      let newStar = new Star(badword[piece][1],badword[piece][2],badword[piece][3],badword[piece][4]);
      allStars.push(newStar);
    }
  }
  myFriend = undefined;
  // Spawns in the player to the scene
  myFriend = new Player(player_spawn_cords[0],player_spawn_cords[1],player_spawn_cords[2],40,70,40);
}

function draw() {
  background(220);
  // Allows camera control
  orbitControl();

  // Controls the player
  if (myFriend !== undefined) {
    myFriend.display();
    myFriend.update();
    myFriend.isOnFloor = false;

    // Shows the boxes and checks if the player is colliding with them
    for (let box = 0; box < myWonderfulBoxes.length; box++) {
      myWonderfulBoxes[box].display();
      myFriend.checkCollision(myWonderfulBoxes[box]);
    }

    // Shows the stars
    for (let stars = 0; stars < allStars.length; stars++) {
      allStars[stars].display();
    }

    let cam_x = cam.centerX - cam.eyeX;
    let cam_z = cam.centerZ - cam.eyeZ;
    let yaw = atan2(cam_x, cam_z);
    angle = yaw;
    // *(360/PI) for degrees btw
  }
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

  // Shows the player when called
  display() {
    push();
    translate(this.x, this.y, this.z);
    ellipsoid(this.sizeX, this.sizeY, this.sizeZ);
    pop();

    if (showHitboxes) {
      // Player feet
      push();
      fill("red");
      translate(this.x, this.y + this.sizeY, this.z);
      box(10, 10, 10);
      pop();
      // Player head
      push();
      fill("yellow");
      translate(this.x, this.y - this.sizeY, this.z);
      box(10, 10, 10);
      pop();
    }
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

    // Keyboard controls for player movement
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

  // Detects collision between the player and any boxes to stop the player from running through walls
  checkCollision(colBox) {
    if (this.y + this.sizeY < colBox.y - colBox.sizeY/2 &&  // checks if above the platform
      this.y + this.sizeY > colBox.y - 15 && // checks if right above the platform or if just above it in general
      (this.x + this.sizeX/2 > colBox.x - colBox.sizeX/2 && 
      this.x - this.sizeX/2 < colBox.x + colBox.sizeX/2) &&
      (this.z + this.sizeZ/2 > colBox.z - colBox.sizeZ/2 &&
      this.z - this.sizeZ/2 < colBox.z + colBox.sizeZ/2)) {
      this.y = colBox.y - colBox.sizeY - this.sizeY;
      this.isOnFloor = true;
      if (colBox instanceof VertMoving) {
        this.y = colBox.y - colBox.sizeY - this.sizeY - 0.25;
      }
    }
    if (this.y + this.sizeY > colBox.y - colBox.sizeY/2 && // checks if below the platform's base
      (this.x + this.sizeX/2 > colBox.x - colBox.sizeX/2 && 
      this.x - this.sizeX/2 < colBox.x + colBox.sizeX/2) &&
      (this.z + this.sizeZ/2 > colBox.z - colBox.sizeZ/2 &&
      this.z - this.sizeZ/2 < colBox.z + colBox.sizeZ/2)) {
      if (this.z > colBox.z + colBox.sizeZ / 2 || this.z < colBox.z - colBox.sizeZ / 2) {
        this.z = this.lastPosition.z;
      } 
      if (this.x < colBox.x - colBox.sizeX / 2 || this.x > colBox.x + colBox.sizeX / 2) {
        this.x = this.lastPosition.x;
      }
    }


    // HITBOX COLLISION SPOTS
    if (showHitboxes) {
      // Bottom of boxes
      push();
      fill("blue");
      translate(colBox.x, colBox.y + colBox.sizeY/2, colBox.z);
      box(colBox.sizeX, 1, colBox.sizeZ);
      pop();
      // Top of boxes
      push();
      fill("green");
      translate(colBox.x, colBox.y - colBox.sizeY/2, colBox.z);
      box(colBox.sizeX, 1, colBox.sizeZ);
      pop();
      // Sides of boxes on the XY plane
      push();
      fill("purple");
      translate(colBox.x, colBox.y, colBox.z);
      box(colBox.sizeX-1, colBox.sizeY, colBox.sizeZ+1);
      pop();
      // Sides of boxes on the ZY plane
      push();
      fill("orange");
      translate(colBox.x, colBox.y, colBox.z);
      box(colBox.sizeX+1, colBox.sizeY, colBox.sizeZ-1);
      pop();
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

  // Shows the box when called
  display() {
    push();
    translate(this.x, this.y, this.z);
    box(this.sizeX, this.sizeY, this.sizeZ);
    pop();
  }
}

class VertMoving {
  constructor(x, y, z, sizeX, sizeY, sizeZ) {
    this.x = x;
    this.yLevels = {minY: y[0], maxY: y[1]};
    this.y = this.yLevels.minY;
    this.z = z;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.sizeZ = sizeZ;
    this.animate();
  }

  // Shows the box when called
  display() {
    push();
    translate(this.x, this.y, this.z);
    box(this.sizeX, this.sizeY, this.sizeZ);
    pop();
  }

  async animate() {
    await wait(250);
    p5.tween.manager
      .addTween(this, 'tween1')
      .addMotions([{ key: 'y', target: this.yLevels.maxY}], 70 * abs(this.yLevels.maxY - this.yLevels.minY), 'linear')
      .startTween()
      .onEnd(() => this.animatePartTwo());
  }
  
  async animatePartTwo() {
    await wait(250);
    p5.tween.manager
      .addTween(this, 'tween2')
      .addMotions([{ key: 'y', target: this.yLevels.minY}], 70 * abs(this.yLevels.maxY - this.yLevels.minY), 'linear')
      .startTween()
      .onEnd(() => this.animate());
  }
}

class Star {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.radius = 25;
  }

  // Shows the star when called
  display() {
    push();
    translate(this.x, this.y, this.z);
    sphere(this.radius);
    pop();
  }
}