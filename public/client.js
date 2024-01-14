const DEPLOY = true;

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

const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0x777777, // Set the background color
  antialias: true,
});

mainContainer.addChild(app.stage);

document.getElementById("gameArea").appendChild(app.view);

let clientBalls = {};
let selfID;

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

function renderOnly() {
  app.stage.removeChildren();

  // reversed, because the player is first in the dict and we want the player to appear on top
  for (let id of Object.keys(clientBalls).reverse()) {
    clientBalls[id].draw();
  }
  // userInterface();

  requestAnimationFrame(renderOnly);
}

requestAnimationFrame(renderOnly);

window.addEventListener("resize", () => {
  app.renderer.resize(window.innerWidth, window.innerHeight);
});

// form.onsubmit = function (e) {
//   e.preventDefault();
formDiv.style.display = "none";
gameAreaDiv.style.display = "block";

//   console.log("your name is " + document.getElementById("userName").value);

//   // clientBalls[selfID].name = document.getElementById("userName").value;
//   // socket.emit("clientName", clientBalls[selfID].name);
//   return false;
// };
