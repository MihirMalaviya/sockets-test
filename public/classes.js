function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

function lerpWithWrap(start, end, t) {
  const pi2 = Math.PI * 2;
  const difference = ((((end - start) % pi2) + pi2) % pi2) - Math.PI;
  return start + difference * t;
}

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

  static lerp(v1, v2, t) {
    return new Vector(lerp(v1.x, v2.x, t), lerp(v1.y, v2.y, t));
  }
}

const HALF_PI = Math.PI / 2;
// const ANGLE_PRECISION = (2 * Math.PI) / (360 / 5);
const ANGLE_PRECISION = 5;

function rad2Deg(radians) {
  return radians * (180 / Math.PI);
}

function deg2Rad(degrees) {
  return degrees * (Math.PI / 180);
}

class Player {
  constructor(x, y, r) {
    this.pos = new Vector(x, y);
    this.vel = new Vector(0, 0);
    this.angle = 0;
    this.r = r;

    this.player = false;

    this.container = new PIXI.Container();

    const graphics = new PIXI.Graphics();

    const handSize = this.r * 0.375;
    const handOffset = this.r * 0.75;

    graphics.lineStyle(5, 0x35354d);

    graphics.beginFill(0x7c5d4f);
    graphics.drawCircle(handOffset, handOffset, handSize);
    graphics.endFill();

    graphics.beginFill(0x7c5d4f);
    graphics.drawCircle(-handOffset, handOffset, handSize);
    graphics.endFill();

    graphics.beginFill(0x7c5d4f);
    graphics.drawCircle(0, 0, this.r);
    graphics.endFill();

    this.container.addChild(graphics);
  }

  setPosition(x, y) {
    this.pos.x = x;
    this.pos.y = y;
  }

  setRotation(theta) {
    this.angle = theta;
  }

  getRoundedRotation() {
    // return this.angle - (this.angle % ANGLE_PRECISION);
    return (
      Math.floor((this.angle * (180 / Math.PI)) / ANGLE_PRECISION) +
      180 / ANGLE_PRECISION
    );
  }

  draw() {
    // graphics.drawCircle(this.pos.x, this.pos.y, this.r);

    // this.container.x = this.pos.x;
    // this.container.y = this.pos.y;

    this.container.x = lerp(this.container.x, this.pos.x, 0.15);
    this.container.y = lerp(this.container.y, this.pos.y, 0.15);

    if (!this.player)
      this.container.rotation =
        lerpWithWrap(this.container.rotation - HALF_PI, this.angle, 0.33) +
        HALF_PI;
    else this.container.rotation = this.angle - HALF_PI;

    mainContainer.addChild(this.container);

    this.debug();
  }

  debug() {
    const graphics = new PIXI.Graphics();

    graphics.lineStyle(2, 0x0000ff);
    graphics.drawRect(this.pos.x, this.pos.y, 1, 1);

    mainContainer.addChild(graphics);
  }
}

class Camera {
  constructor() {
    this.pos = new Vector(0, 0);
    this.targetPos = new Vector(0, 0);
    this.lerpFactor = 0.05;
  }

  updateCamera() {
    this.pos = Vector.lerp(this.pos, this.targetPos, this.lerpFactor);

    // console.log(`camera position: x=${this.pos.x}, y=${this.pos.y}`);
  }

  setTargetPosition(pos) {
    this.targetPos = pos;
  }
}
