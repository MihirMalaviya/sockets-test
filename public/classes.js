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

class Weapon {
  constructor(filename, damage, knockback, cooldown, offset, scaling, size) {
    this.canHit = true;

    this.scaling = scaling;
    this.offset = offset.mult(this.scaling);
    this.scale = 0.5 * this.size;
    this.dir = "assets/" + filename;
    this.damage = damage;
    this.knockback = knockback;
    this.cooldown = cooldown;

    this.container = new PIXI.Container();
    const texture = PIXI.Texture.from(this.dir);
    const sprite = new PIXI.Sprite(texture);

    sprite.rotation = HALF_PI;

    sprite.scale.set(0.5);

    sprite.anchor.set(0.5, 0.5);

    sprite.x -= this.scaling * offset.x;
    sprite.y += this.scaling * offset.y;

    this.container.addChild(sprite);
  }

  cooldownOver(lastHitTime) {
    // return true;

    if (lastHitTime + this.cooldown < time) return true;
    console.log(lastHitTime + this.cooldown + " - " + time);
    return false;
  }
}

class Food {
  constructor(filename, cost, healamount, offset, scaling, size) {
    this.canHit = false;

    this.scaling = scaling;
    this.offset = offset.mult(this.scaling);
    this.scale = 0.5 * this.size;
    this.dir = "assets/" + filename;
    this.cost = cost;
    this.heal = healamount;

    this.container = new PIXI.Container();
    const texture = PIXI.Texture.from(this.dir);
    const sprite = new PIXI.Sprite(texture);

    sprite.rotation = HALF_PI;

    sprite.scale.set(size);

    sprite.anchor.set(0.5, 0.5);

    sprite.x -= this.scaling * offset.x;
    sprite.y += this.scaling * offset.y;

    this.container.addChild(sprite);
  }
}

class Player {
  constructor(x, y, r) {
    this.pos = new Vector(x, y);
    this.vel = new Vector(0, 0);
    this.angle = 0;
    this.r = r;

    this.health = 100;
    this.healthbar = new HealthBar(new Vector(0, 64), 64 + 32, 100);

    this.player = false;

    this.hotbar = [
      new Weapon(
        "sword_1.png",
        30,
        5,
        0.33,
        new Vector(1.4, 0.75),
        this.r,
        this.r
      ),
      new Weapon(
        "sword_1.png",
        30,
        5,
        0.33,
        new Vector(1.4, 0.75),
        this.r,
        this.r
      ),
      // TODO change to png
      new Food("Cookie.webp", 15, 40, new Vector(0, 1), this.r, 0.1),
    ];

    this.hotbarIndex = 0;
    // this.hotbarIndex = 2;

    // this.borderColor = 0x35354d;
    this.borderColor = 0x3f354d;
    this.skinColor = 0x7c5d4f;

    this.redraw();
  }

  redraw() {
    const graphics = new PIXI.Graphics();

    this.container = new PIXI.Container();

    this.container.addChild(this.holding().container);

    const handSize = this.r * 0.375;
    const handOffset = this.r * 0.75;

    graphics.lineStyle(5, this.borderColor);

    graphics.beginFill(this.skinColor);
    graphics.drawCircle(handOffset, handOffset, handSize);
    graphics.endFill();

    graphics.beginFill(this.skinColor);
    graphics.drawCircle(-handOffset, handOffset, handSize);
    graphics.endFill();

    graphics.beginFill(this.skinColor);
    graphics.drawCircle(0, 0, this.r);
    graphics.endFill();

    this.container.addChild(graphics);
  }

  holding() {
    return this.hotbar[this.hotbarIndex];
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

    this.container.x = this.healthbar.container.x = lerp(
      this.container.x,
      this.pos.x,
      0.33
    );
    this.container.y = this.healthbar.container.y = lerp(
      this.container.y,
      this.pos.y,
      0.33
    );

    this.healthbar.update();

    if (!this.player) {
      this.container.rotation =
        lerpWithWrap((this.lastRotation || 0) - HALF_PI, this.angle, 0.33) +
        HALF_PI;
      this.lastRotation = this.container.rotation;
    } else {
      this.container.rotation = this.angle - HALF_PI;
    }

    if (this.lastHitTime && this.holding().canHit) {
      // console.log(this.lastHitTime);
      // console.log(getRotationOffsetFromTime(this.lastHitTime, Math.PI));
      this.container.rotation -= getRotationOffsetFromTime(
        this.lastHitTime,
        Math.PI,
        this.holding().cooldown,
        easeOutBack
      );
      // console.log(this.lastHitTime);
    }

    mainContainer.addChild(this.container);
    mainContainer.addChild(this.healthbar.container);

    this.debug();
  }

  setHealth(hp) {
    this.health = hp;
    this.healthbar.setVal(hp);
  }

  debug() {
    const graphics = new PIXI.Graphics();

    graphics.lineStyle(2, 0x0000ff);
    graphics.drawRect(this.pos.x, this.pos.y, 1, 1);

    // debug

    graphics.lineStyle(1, 0x0000ff);
    graphics.drawCircle(this.pos.x, this.pos.y, this.r);

    graphics.lineStyle(1, 0xff0000);
    graphics.arc(
      this.pos.x,
      this.pos.y,
      this.r * (4 - 1),
      Math.PI + this.angle + Math.PI / 2,
      2 * Math.PI + this.angle + Math.PI / 2
    );
    graphics.closePath();

    mainContainer.addChild(graphics);
  }
}

class HealthBar {
  constructor(offset, width, max, color) {
    this.offset = offset;
    this.width = width;
    this.max = this.val = max;
    this.targetVal = max;
    this.lerpSpeed = 0.25;

    if (color != null) this.color = color;
    else this.color = 0xcc5151;

    this.container = new PIXI.Container();
    this.graphics = new PIXI.Graphics();
    this.container.addChild(this.graphics);

    this.redraw();
  }

  setVal(val) {
    this.targetVal = val;
  }

  update() {
    this.val += (this.targetVal - this.val) * this.lerpSpeed;

    this.redraw();
  }

  redraw() {
    this.graphics.clear();

    this.graphics.beginFill(0x3d3f42);
    this.graphics.drawCircle(
      this.offset.x - this.width / 2,
      this.offset.y + 4,
      8
    );
    this.graphics.drawCircle(
      this.offset.x + this.width / 2,
      this.offset.y + 4,
      8
    );

    this.graphics.drawRect(
      this.offset.x - this.width / 2,
      this.offset.y - 4,
      this.width,
      16
    );
    this.graphics.endFill();

    this.graphics.beginFill(this.color);
    this.graphics.drawRect(
      this.offset.x - this.width / 2,
      this.offset.y,
      this.width * (this.val / this.max),
      8
    );

    this.graphics.drawCircle(
      this.width * (this.val / this.max) - this.width / 2,
      this.offset.y + 4,
      4
    );

    this.graphics.drawCircle(-this.width / 2, this.offset.y + 4, 4);
    this.graphics.endFill();
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

let s;
function easeLinear(t, b, c, d) {
  return (c * t) / d + b;
}

function easeOutBack(t, b, c, d) {
  if (s == undefined) s = 1.70158;
  return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
}

function easeOutElastic(t, b, c, d) {
  var s = 1.70158;
  var p = 0;
  var a = c;
  if (t == 0) return b;
  if ((t /= d) == 1) return b + c;
  if (!p) p = d * 0.3;
  if (a < Math.abs(c)) {
    a = c;
    var s = p / 4;
  } else var s = (p / (2 * Math.PI)) * Math.asin(c / a);
  return (
    a * Math.pow(2, -10 * t) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) +
    c +
    b
  );
}

function getRotationOffsetFromTime(lastHitTime, max, duration, easing) {
  let timeSinceHit = time - lastHitTime;

  let p1 = 0.1 * duration;
  let p2 = p1 + duration;

  if (timeSinceHit >= 0 && timeSinceHit <= p1) {
    return easing(timeSinceHit, 0, max, p1);
  }

  if (timeSinceHit > p1 && timeSinceHit <= p2) {
    return max - easing(timeSinceHit - p1, 0, max, p2 - p1);
  }

  return 0;
}
