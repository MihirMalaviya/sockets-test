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

class Player {
  constructor(x, y, r) {
    this.pos = new Vector(x, y);
    this.vel = new Vector(0, 0);
    this.r = r;

    this.container = new PIXI.Container();

    const graphics = new PIXI.Graphics();

    graphics.beginFill(0x7c5d4f);
    graphics.drawCircle(0, 0, this.r);
    graphics.endFill();

    graphics.lineStyle(5, 0x35354d);
    graphics.drawCircle(0, 0, this.r);

    this.container.addChild(graphics);
  }

  setPosition(x, y) {
    this.pos.x = x;
    this.pos.y = y;
  }

  draw() {
    // graphics.drawCircle(this.pos.x, this.pos.y, this.r);

    this.container.x = this.pos.x;
    this.container.y = this.pos.y;

    app.stage.addChild(this.container);

    this.debug();
  }

  debug() {
    const bounds = this.container.getBounds();

    const graphics = new PIXI.Graphics();
    graphics.lineStyle(2, 0xff0000);
    graphics.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
    // app.stage.addChild(graphics);

    graphics.lineStyle(2, 0x0000ff);
    graphics.drawRect(this.pos.x, this.pos.y, 1, 1);

    app.stage.addChild(graphics);
  }
}
