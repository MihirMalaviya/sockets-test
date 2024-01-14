class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    return new Vector(this.x + v.x, this.y + v.y);
  }

  subtr(v) {
    return new Vector(this.x - v.x, this.y - v.y);
  }

  mag() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  mult(n) {
    return new Vector(this.x * n, this.y * n);
  }

  normal() {
    return new Vector(-this.y, this.x).unit();
  }

  unit() {
    if (this.mag() === 0) {
      return new Vector(0, 0);
    } else {
      return new Vector(this.x / this.mag(), this.y / this.mag());
    }
  }

  static dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  }

  static cross(v1, v2) {
    return v1.x * v2.y - v1.y * v2.x;
  }

  static distance(v1, v2) {
    return v2.subtr(v1);
  }
}

const FRICTION = 0.75;

class Player {
  constructor(x, y, r, speed) {
    this.pos = new Vector(x, y);
    this.vel = new Vector(0, 0);
    this.acc = new Vector(0, 0);
    this.r = r;
    this.speed = speed;

    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
    this.action = false;
  }

  setPosition(x, y) {
    this.pos.x = x;
    this.pos.y = y;
  }

  collide(pos, r) {
    let distanceVec = Vector.distance(pos, this.pos);

    if (distanceVec.mag() <= r * 2) {
      const dir = distanceVec.unit();
      this.vel.x += dir.x * 1;
      this.vel.y += dir.y * 1;
    }
  }

  update() {
    this.vel.x += this.acc.x;
    this.vel.y += this.acc.y;

    this.vel.x *= FRICTION;
    this.vel.y *= FRICTION;

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    for (let id in serverBalls) {
      this.collide(serverBalls[id].pos, serverBalls[id].r);
    }
  }

  input() {
    this.acc = new Vector(this.down - this.up, this.left - this.right)
      .normal()
      .mult(this.speed);
  }

  debug() {
    console.log(
      `Player - Position: X: ${this.pos.x}, Y: ${this.pos.y}, Velocity: X: ${this.vel.x}, Y: ${this.vel.y}`
    );
  }
}

// START //

const DEPLOY = true;

const express = require("express");
const app = express();

const port = 3000;
const PORT = process.env.PORT || port;
app.use(express.static("public"));

let http;
let server;

if (DEPLOY) {
  http = require("http").Server(app);

  server = http;

  server.keepAliveTimeout = 120 * 1000;
  server.headersTimeout = 120 * 1000;
} else {
  server = app.listen(port);
}

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  console.log("__dirname = " + __dirname);

  res.sendFile(__dirname + "/index.html");
});

if (DEPLOY) {
  http.listen(PORT, function () {
    console.log(`listening on ${PORT}`);
  });
}

let playerData = {};
let serverBalls = {};

io.on("connection", connected);
setInterval(serverLoop, 1000 / 60);

function connected(socket) {
  socket.on("newPlayer", (data) => {
    console.log("New client connected, with id: " + socket.id);
    serverBalls[socket.id] = new Player(data.x, data.y, 32, 2);
    serverBalls[socket.id].maxSpeed = 5;
    playerData[socket.id] = data;
    console.log(
      "Starting position: " +
        playerData[socket.id].x +
        " - " +
        playerData[socket.id].y
    );
    console.log("Current number of players: " + Object.keys(playerData).length);
    console.log("players dictionary: ", playerData);
    io.emit("updatePlayers", playerData);
  });

  // need to fix logic
  // socket.on("playerNamed", (data) => {

  //   for (let id in serverBalls) {
  //     playerData[id].name = serverBalls[id].name;
  //     // playerData[id].name = "bob";
  //     // console.log(playerData[id]);
  //   }
  //   io.emit("updateNames", playerData);

  // });

  socket.on("disconnect", function () {
    // serverBalls[socket.id].remove();
    delete serverBalls[socket.id];
    delete playerData[socket.id];
    console.log("Goodbye client with id " + socket.id);
    console.log("Current number of players: " + Object.keys(playerData).length);
    console.log("players dictionary: ", playerData);
    io.emit("updatePlayers", playerData);
  });

  socket.on("userCommands", (data) => {
    console.log(serverBalls[socket.id]);
    console.log(data);
    serverBalls[socket.id].left = data.left;
    serverBalls[socket.id].up = data.up;
    serverBalls[socket.id].right = data.right;
    serverBalls[socket.id].down = data.down;
    serverBalls[socket.id].action = data.action;

    serverBalls[socket.id].input();
  });

  socket.on("update", (data) => {
    console.log(`${data.x} -- ${data.y}`);
  });

  // socket.on("ClientClientHello", (data) => {
  //   socket.broadcast.emit("ClientServerHello", data);
  // });

  socket.on("clientName", (data) => {
    serverBalls[socket.id].name = data;
    console.log(`${data} joined`);
  });
}

function serverLoop() {
  // userInteraction();
  // physicsLoop();

  for (let id in serverBalls) {
    serverBalls[id].update();
  }

  for (let id in serverBalls) {
    playerData[id].x = serverBalls[id].pos.x;
    playerData[id].y = serverBalls[id].pos.y;
  }
  // console.log(playerData);
  io.emit("positionUpdate", playerData);
}
