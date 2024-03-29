const DEPLOY = 1;

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

  static fromAngle(angle) {
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    return new Vector(x, y);
  }
}

const FRICTION = 0.75;

class Weapon {
  constructor(damage, knockback, cooldown, scaling, collider, colliderdist) {
    this.scaling = scaling;
    this.damage = damage;
    this.knockback = knockback;
    this.cooldown = cooldown;
    this.collider = collider;
    this.colliderdist = colliderdist;
  }

  updateCollider(pos) {
    this.collider.center = pos;
  }

  cooldownOver(lht) {
    if (lht + this.cooldown < time) return true;
    return false;
  }

  // checkHit(pos, angle) {
  //   return (
  //     Vector.dot(this.collider.center, angle) > 0 &&
  //     this.collider.isPointInside(pos)
  //   );
  // }

  checkHit(pos, angle) {
    // const direction = Vector.fromAngle(angle);
    const centerToPos = Vector.distance(this.collider.center, pos);
    const angleBetween = Math.acos(Vector.dot(centerToPos.unit(), angle));
    return angleBetween < Math.PI / 2 && this.collider.isPointInside(pos);
  }
}

class CircleArea {
  constructor(center, radius) {
    this.center = center;
    this.radius = radius;
  }

  isPointInside(point) {
    const distance = Vector.distance(this.center, point);

    return distance.mag() <= this.radius;
  }
}

function deg2rad(degrees) {
  return degrees * (Math.PI / 180);
}

class Player {
  constructor(x, y, r, speed) {
    this.pos = new Vector(x, y);
    this.vel = new Vector(0, 0);
    this.acc = new Vector(0, 0);
    this.a = 0;
    this.r = r;
    this.speed = speed;

    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
    this.action = false;

    this.lht = 0;

    this.health = 100;

    this.weapon = new Weapon(
      20,
      40,
      0.33,
      1,
      new CircleArea(null, this.r * 4),
      this.r * 2
    );
  }

  setPosition(x, y) {
    this.pos.x = x;
    this.pos.y = y;
  }

  applyForce(f, dir) {
    const force = dir.mult(f);
    this.vel = this.vel.add(force);
  }

  collide(pos, r) {
    let distanceVec = Vector.distance(pos, this.pos);

    if (distanceVec.mag() <= r * 2) {
      const dir = distanceVec.unit();
      this.vel.x += dir.x * 0.75;
      this.vel.y += dir.y * 0.75;
    }
  }

  handleHitEvent() {
    return (
      (this.mouseLeft || this.mouseRight || this.action) &&
      this.weapon.cooldownOver(this.lht)
    );
  }

  damage(hp) {
    this.health -= hp;
  }

  update() {
    this.vel.x += this.acc.x;
    this.vel.y += this.acc.y;

    this.vel.x *= FRICTION;
    this.vel.y *= FRICTION;

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    this.weapon.updateCollider(this.pos);

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

    serverBalls[socket.id] = new Player(data.x, data.y, 32, 1.5);
    data = { x: Math.round(data.x), y: Math.round(data.y) };

    playerData[socket.id] = data;
    console.log(
      "Starting position: " +
        playerData[socket.id].x +
        " - " +
        playerData[socket.id].y
    );

    playerData[socket.id].health = serverBalls[socket.id].health;
    console.log("Current number of players: " + Object.keys(playerData).length);
    console.log("players dictionary: ", playerData);

    io.emit("updatePlayers", playerData);
    // console.log(
    //   `Size of data: ${Buffer.byteLength(
    //     JSON.stringify(playerData),
    //     "utf8"
    //   )} bytes`
    // );
  });

  socket.on("disconnect", function () {
    delete serverBalls[socket.id];
    delete playerData[socket.id];
    console.log("Goodbye client with id " + socket.id);
    console.log("Current number of players: " + Object.keys(playerData).length);
    console.log("players dictionary: ", playerData);

    io.emit("updatePlayers", playerData);
    // console.log(
    //   `Size of data: ${Buffer.byteLength(
    //     JSON.stringify(playerData),
    //     "utf8"
    //   )} bytes`
    // );
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

  socket.on("userCommands", (data) => {
    if (!serverBalls[socket.id]) {
      serverBalls[socket.id] = {};
    }

    for (const key in data) {
      serverBalls[socket.id][key] = data[key];
    }

    serverBalls[socket.id].input();

    // console.log(data);
    // console.log(serverBalls[socket.id]);
  });

  socket.on("userRotation", (angle) => {
    if (serverBalls[socket.id]) serverBalls[socket.id].a = angle || 0;
    // console.log(angle);
  });

  // socket.on("userAttack", (lht) => {
  //   if (serverBalls[socket.id])
  //     serverBalls[socket.id].lht = lht || 0;
  //   console.log(lht);
  // });

  // socket.on("clientName", (data) => {
  //   serverBalls[socket.id].name = data;
  //   console.log(`${data} joined`);
  // });
}

let time = 0;
const POSITION_PRECISION = 2;

function serverLoop() {
  let needSendHit = [];
  for (let id in serverBalls) {
    if (serverBalls[id].dash) {
      serverBalls[id].applyForce(
        30,
        serverBalls[id].acc.add(serverBalls[id].vel).unit()
      );
      serverBalls[id].dash = false;
    }

    if (serverBalls[id].handleHitEvent()) {
      serverBalls[id].lht = time;
      needSendHit.push(id);
      // console.log(time);
      // console.log(serverBalls[id].lht);

      for (let otherid in serverBalls) {
        if (
          id != otherid &&
          serverBalls[id].weapon.checkHit(
            serverBalls[otherid].pos,
            Vector.fromAngle(deg2rad(serverBalls[id].a * 5 - 180))
          )
        ) {
          serverBalls[otherid].damage(serverBalls[id].weapon.damage);
          serverBalls[otherid].applyForce(
            serverBalls[id].weapon.knockback,
            Vector.distance(
              serverBalls[id].pos,
              serverBalls[otherid].pos
            ).unit()
          );

          console.log(serverBalls[otherid].health);
        }
      }
    }

    serverBalls[id].update();
  }

  // console.log(needSendHit);

  let newData = {};
  for (let id in serverBalls) {
    newData[id] = {};

    // console.log(serverBalls[id].a);

    const roundX =
      serverBalls[id].pos.x - (serverBalls[id].pos.x % POSITION_PRECISION);
    const roundY =
      serverBalls[id].pos.y - (serverBalls[id].pos.y % POSITION_PRECISION);

    if (roundX !== playerData[id].x) newData[id].x = playerData[id].x = roundX;

    if (roundY !== playerData[id].y) newData[id].y = playerData[id].y = roundY;

    if (serverBalls[id].a !== playerData[id].a)
      newData[id].a = playerData[id].a = serverBalls[id].a;

    if (serverBalls[id].health !== playerData[id].health)
      newData[id].health = playerData[id].health = serverBalls[id].health;

    if (needSendHit.includes(id)) newData[id].lh = true;

    if (Object.keys(newData[id]).length === 0) {
      delete newData[id];
    }
  }

  if (
    !Object.values(newData).every((value) => Object.keys(value).length === 0)
  ) {
    // console.log(newData);
    io.emit("positionUpdate", newData);
  }

  time += 1.0 / 60;
}
