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
let allPortals = [];
let myFriend, cam, font, angle, pg;
let player_spawn_cords = [0,0,0];
let showHitboxes = false;
let starCount = 0;
let collectedStars = 0;
let intro_playing = true;
let mainMenu = false;

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
  if (key === "p") {
    mainMenu = !mainMenu;
    createLevel();
  }
}

function preload() {
  font = loadFont("SeagirlDreams.otf");
  starSound = loadSound("shine-10.mp3");
  portalSound = loadSound("teleport.mp3");
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
  intro_playing = true;
  starCount = 0;
  collectedStars = 0;
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
      starCount += 1;
      let newStar = new Star(badword[piece][1],badword[piece][2],badword[piece][3],badword[piece][4]);
      allStars.push(newStar);
    }
    else if (badword[piece][0] === "portal") {
      // Creates a star at the specified position to be collected by the player
      let newPortal = new Portal(badword[piece][1],badword[piece][2],badword[piece][3],badword[piece][4],badword[piece][5],badword[piece][6]);
      allPortals.push(newPortal);
    }
  }
  myFriend = undefined;
  // Spawns in the player to the scene
  myFriend = new Player(player_spawn_cords[0],player_spawn_cords[1],player_spawn_cords[2],40,70,40);
}

function draw() {
  if (mainMenu) {
    background(220);
    textSize(50);
    textFont(font);
    textAlign(CENTER);
    text('Press p to start the level', width / 2, height / 2);
  }
  else {
    background(220);
    // Allows camera control
    if (!intro_playing) {
      orbitControl();
    }

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

      for (let i = 0; i < allPortals.length; i++) {
        allPortals[i].display();
        myFriend.checkPortal(allPortals[i]);
      }

      // Shows the stars
      for (let stars = 0; stars < allStars.length; stars++) {
        allStars[stars].display();
        myFriend.checkStar(allStars[stars]);
      }

      let cam_x = cam.centerX - cam.eyeX;
      let cam_z = cam.centerZ - cam.eyeZ;
      let yaw = atan2(cam_x, cam_z);
      angle = yaw;
    // *(360/PI) for degrees btw
    }
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
    this.airacceleration = 0.5;
    this.airtime = 0;
    this.isOnFloor = false;
    this.lastPosition = {x: this.x, y: this.y, z: this.z};
    this.createElevator();
    this.elevator;
  }

  createElevator() {
    this.elevator = new Elevator(this.x, this.y/2, this.z);
    this.y += 500;
  }

  // Shows the player when called
  display() {
    this.elevator.display();
    push();
    if (this.elevator.moving === false) {
      translate(this.x, this.y, this.z);
    }
    else {
      translate(this.x, this.elevator.y-30, this.z);
      this.y = this.elevator.y-51;
      this.airtime = 0;
    }
    ellipsoid(this.sizeX, this.sizeY, this.sizeZ);
    pop();

    if (showHitboxes) {
      // Player feet
      push();
      fill("red");
      translate(this.x, this.y + this.sizeY, this.z);
      box(10, 1, 10);
      pop();
      // Player head
      push();
      fill("yellow");
      translate(this.x, this.y - this.sizeY, this.z);
      box(10, 1, 10);
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
    let sprintSpeed;
    if (!intro_playing) {
      // Speed up with left shift
      if (keyIsDown(16)) {
        sprintSpeed = this.speed * 2;
      }
      else {
        sprintSpeed = this.speed;
      }
      // W
      if (keyIsDown(87)) {
        this.x += sin(angle)*sprintSpeed;
        this.z += cos(angle)*sprintSpeed;
      }
      // S
      if (keyIsDown(83)) {
        this.x -= sin(angle)*sprintSpeed;
        this.z -= cos(angle)*sprintSpeed;
      }
      // A
      if (keyIsDown(68)) {
        this.x -= cos(angle)*sprintSpeed;
        this.z += sin(angle)*sprintSpeed;
      }
      // D
      if (keyIsDown(65)) {
        this.x += cos(angle)*sprintSpeed;
        this.z -= sin(angle)*sprintSpeed;
      }
    }
  }

  // Detects collision between the player and any boxes to stop the player from running through walls
  checkCollision(colBox) {
    if (this.y + this.sizeY < colBox.y - colBox.sizeY/2 &&  // checks if above the platform
      this.y + this.sizeY > colBox.y - colBox.sizeY/2 - 20 && // checks if right above the platform or if just above it in general
      (this.x + this.sizeX/2 > colBox.x - colBox.sizeX/2 && 
      this.x - this.sizeX/2 < colBox.x + colBox.sizeX/2) &&
      (this.z + this.sizeZ/2 > colBox.z - colBox.sizeZ/2 &&
      this.z - this.sizeZ/2 < colBox.z + colBox.sizeZ/2)) {
      this.y = colBox.y - (colBox.sizeY/2 + 5) - this.sizeY;
      this.isOnFloor = true;
      if (colBox instanceof VertMoving) {
        this.y = colBox.y - (colBox.sizeY/2 + 5) - this.sizeY - 15;
      }
    }
    if (this.y + this.sizeY > colBox.y - colBox.sizeY/2 && // checks if below the platform's base
      (this.x + this.sizeX/2 > colBox.x - colBox.sizeX/2 && 
      this.x - this.sizeX/2 < colBox.x + colBox.sizeX/2) &&
      (this.z + this.sizeZ/2 > colBox.z - colBox.sizeZ/2 &&
      this.z - this.sizeZ/2 < colBox.z + colBox.sizeZ/2) &&
      this.y - this.sizeY < colBox.y + colBox.sizeY/2) {
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
      // push();
      // fill("coral");
      // translate(colBox.x, colBox.y - colBox.sizeY/2 - 20, colBox.z);
      // box(colBox.sizeX, 1, colBox.sizeZ);
      // pop();
      push();
      fill("lavender");
      translate(this.x, colBox.y - colBox.sizeY/2 - this.sizeY, this.z);
      box(10, 10, 10);
      pop();
    }
  }

  checkPortal(colPortal) {
    let topofMeBuddy = colPortal.y - colPortal.height - 150;
    if (this.y + this.sizeY < colPortal.y + 10 &&  // checks if above the platform
      this.y + this.sizeY > topofMeBuddy && // checks if ontop of the portal and not just above in general
      (this.x + this.sizeX/2 > colPortal.x - colPortal.radius/2 && 
      this.x - this.sizeX/2 < colPortal.x + colPortal.radius/2) &&
      (this.z + this.sizeZ/2 > colPortal.z - colPortal.radius/2 &&
      this.z - this.sizeZ/2 < colPortal.z + colPortal.radius/2)) {
      portalSound.play();
      this.x = colPortal.x2;
      this.y = colPortal.y2;
      this.z = colPortal.z2;
      this.fallingspeed = 0;
      this.airtime = 0;
      //this.airacceleration = 0;
    }
    if (showHitboxes) {
      push();
      fill("teal");
      translate(colPortal.x, topofMeBuddy, colPortal.z);
      box(10, 10, 10);
      pop();
    }
  }

  checkStar(colStar) {
    if (this.y + this.sizeY > colStar.y + colStar.radius &&
      this.y - this.sizeY < colStar.y - colStar.radius &&
      (this.x + this.sizeX/2 > colStar.x - colStar.radius/2 && 
      this.x - this.sizeX/2 < colStar.x + colStar.radius/2) &&
      (this.z + this.sizeZ/2 > colStar.z - colStar.radius/2 &&
      this.z - this.sizeZ/2 < colStar.z + colStar.radius/2)) {
      if (!colStar.collected) {
        starSound.play();
        colStar.collected = true;
        collectedStars ++;
        if (collectedStars === starCount) {
          createLevel(); 
        }
      }
    }
  }
}

class Elevator {
  constructor(x, y, z) {
    this.origY = y;
    this.lowestY = y+250;
    this.x = x;
    this.y = y+250;
    this.z = z;
    this.leftdoorposer;
    this.rightdoorposer;
    this.pieces = [
      {piece:new Box(this.x, this.y-5150, this.z, 10, 10000, 10), indexer:0},
      {piece:new Box(this.x, this.y+50, this.z, 300, 10, 300), indexer:0},
      {piece:new Box(this.x, this.y-150, this.z, 300, 10, 300), indexer:0},
      {piece:new Box(this.x-150, this.y-50, this.z, 10, 200, 300), indexer:0},
      {piece:new Box(this.x, this.y-50, this.z-150, 300, 200, 10), indexer:0},
      {piece:new Box(this.x, this.y-50, this.z+150, 300, 200, 10), indexer:0}];
    for (let piece in this.pieces) {
      this.pieces[piece].indexer = myWonderfulBoxes.length;
      myWonderfulBoxes.push(this.pieces[piece].piece);
    }
    this.moving = true;
    cam.setPosition(this.x+1000, -80, this.z);
    cam.lookAt(this.x, this.origY, this.z);
    p5.tween.manager
      .addTween(this, 'tween1')
      .addMotions([{ key: 'y', target: this.origY}], 1000, 'easeOutQuart')
      .startTween()
      .onEnd(() => this.killer());
  }

  killer() {
    this.moving = false;
    intro_playing = false;
  }

  display() {
    for (let piece in this.pieces) {
      let offset = myWonderfulBoxes[this.pieces[piece].indexer].origY - this.lowestY;
      console.log(offset);
      myWonderfulBoxes[this.pieces[piece].indexer].y = this.y+offset;
    }
    push();
    //translate(this.x, this.y, this.z);
    //box(100, 100, 100);
    pop();
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
    this.origY = y;
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
      .addMotions([{ key: 'y', target: this.yLevels.maxY}], 25 * abs(this.yLevels.maxY - this.yLevels.minY), 'linear')
      .startTween()
      .onEnd(() => this.animatePartTwo());
  }
  
  async animatePartTwo() {
    await wait(250);
    p5.tween.manager
      .addTween(this, 'tween2')
      .addMotions([{ key: 'y', target: this.yLevels.minY}], 25 * abs(this.yLevels.maxY - this.yLevels.minY), 'linear')
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
    this.collected = false;
  }

  // Shows the star when called
  display() {
    if (!this.collected) {
      push();
      translate(this.x, this.y, this.z);
      fill("yellow");
      sphere(this.radius);
      pop();
    }
  }
}

class Portal {
  constructor(x1, y1, z1, x2, y2, z2) {
    this.x = x1;
    this.x2 = x2;
    this.y = y1;
    this.y2 = y2;
    this.z = z1;
    this.z2 = z2;
    this.radius = 50;
    this.height = 5;
  }

  display() {
    push();
    translate(this.x, this.y, this.z);
    cylinder(this.radius, this.height);
    pop();
  }
}