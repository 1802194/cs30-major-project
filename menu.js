let position = {x: -300, y: 200, z: 0};
let blocks = [
  [position.x, position.y-5150, position.z, 10, 10000, 10],
  [position.x, position.y+50, position.z, 300, 10, 300],
  [position.x, position.y-150, position.z, 300, 10, 300],
  [position.x-150, position.y-50, position.z, 10, 200, 300],
  [position.x+150, position.y-50, position.z, 10, 200, 300],
  [position.x, position.y-50, position.z-150, 300, 200, 10],
];

function setup() {
  createCanvas(1280, 720, WEBGL);  

  title = createElement('h1', 'VOID');
  title.position(width / 2 - 75 - title.width / 2, -300);
  title.style('font-size', '450px');
  title.style("font-family", "verdana");

  button = createButton('PLAY!');
  button.position((width / 2) + 1100, 500);
  button.mousePressed(load);

}

function draw() {
  orbitControl();
  for (let i = 0; i < blocks.length; i++) {
    push();
    translate(blocks[i][0], blocks[i][1], blocks[i][2]);
    box(blocks[i][3], blocks[i][4], blocks[i][5]);
    pop();
  }
  push();
  translate(position.x, position.y-25, position.z);
  ellipsoid(40, 70, 40);
  pop();
}

function load() {
  window.location.href = "game.html";
}