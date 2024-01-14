const DEPLOY = 1;

let socket;

if (DEPLOY) {
  socket = io.connect("");
} else {
  socket = io.connect("http://localhost:3000");
}

const form = document.getElementById("userForm");
const formDiv = document.getElementById("formContainer");
const gameAreaDiv = document.getElementById("gameArea");

const mainContainer = new PIXI.Container();

const canvas = document.getElementById("canvas");

const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0x777777, // Set the background color
  antialias: true,

  view: canvas,
});

// mainContainer.addChild(app.stage);
app.stage.addChild(mainContainer);

document.getElementById("gameArea").appendChild(app.view);

let clientBalls = {};
let selfID;

let zoom = 100;

// let t = 0;
let camera = new Camera();

socket.on("connect", () => {
  selfID = socket.id;
  let startX = 40 + Math.random() * 560;
  let startY = 40 + Math.random() * 400;
  clientBalls[socket.id] = new Player(startX, startY, 32);
  clientBalls[socket.id].player = true;
  clientBalls[socket.id].maxSpeed = 5;
  userInput(clientBalls[socket.id]);
  socket.emit("newPlayer", { x: startX, y: startY });
});

socket.on("updatePlayers", (players) => {
  playersFound = {};
  for (let id in players) {
    // if we dont have the player and it is not us
    if (clientBalls[id] === undefined && id !== socket.id) {
      // make a new player
      clientBalls[id] = new Player(players[id].x, players[id].y, 32);
      clientBalls[id].maxSpeed = 5;
    }
    playersFound[id] = true;

    console.log(players[id]);
  }

  // if a player was not in players, that means it had to have been deleted so we delete here
  for (let id in clientBalls) {
    if (!playersFound[id]) {
      delete clientBalls[id];
    }
  }
});

socket.on("positionUpdate", (playerPos) => {
  for (let id in playerPos) {
    if (clientBalls[id] !== undefined) {
      clientBalls[id].setPosition(playerPos[id].x, playerPos[id].y);
    }
  }
});

canvas.style.width = `${101 / window.devicePixelRatio}vw`;

window.addEventListener("resize", () => {
  canvas.style.width = `${101 / window.devicePixelRatio}vw`;
});

document.addEventListener("mousemove", function (event) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  const mouseX = event.clientX;
  const mouseY = event.clientY;

  clientBalls[selfID].setRotation(
    Math.atan2(mouseY - centerY, mouseX - centerX)
  );

  // console.log("Angle in radians:", clientBalls[selfID].angle);
});

function render() {
  app.stage.removeChildren();
  mainContainer.removeChildren();

  if (selfID) {
    camera.setTargetPosition(clientBalls[selfID].pos);
    camera.updateCamera();

    mainContainer.x = -camera.pos.x + canvas.width / 2;
    mainContainer.y = -camera.pos.y + canvas.height / 2;
    // console.log(1 / zoom);
    // mainContainer.scale.set(1 / zoom);
    app.stage.addChild(mainContainer);
  }

  // reversed, because the player is first in the dict and we want the player to appear on top
  for (let id of Object.keys(clientBalls).reverse()) {
    clientBalls[id].draw();
  }
  // userInterface();

  requestAnimationFrame(render);
}

requestAnimationFrame(render);

// window.addEventListener("resize", () => {
//   // app.renderer.resize(window.innerWidth, window.innerHeight);

//   const newWidth = window.innerWidth;
//   const newHeight = window.innerHeight;

//   app.renderer.resize(newWidth, newHeight);
//   // app.stage.width = newWidth;
//   // app.stage.height = newHeight;

//   app.renderer.resolution = window.devicePixelRatio;
// });

// form.onsubmit = function (e) {
//   e.preventDefault();
formDiv.style.display = "none";
gameAreaDiv.style.display = "block";

//   console.log("your name is " + document.getElementById("userName").value);

//   // clientBalls[selfID].name = document.getElementById("userName").value;
//   // socket.emit("clientName", clientBalls[selfID].name);
//   return false;
// };
