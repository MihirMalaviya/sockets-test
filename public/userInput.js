let justPressed = false;

function userInput(obj) {
  canvas.addEventListener("keydown", function (e) {
    if (e.code === "ArrowLeft" || e.code === "KeyA") {
      if (!obj.left) justPressed = true;
      obj.left = true;
    }
    if (e.code === "ArrowUp" || e.code === "KeyW") {
      if (!obj.up) justPressed = true;
      obj.up = true;
    }
    if (e.code === "ArrowRight" || e.code === "KeyD") {
      if (!obj.right) justPressed = true;
      obj.right = true;
    }
    if (e.code === "ArrowDown" || e.code === "KeyS") {
      if (!obj.down) justPressed = true;
      obj.down = true;
    }
    if (e.code === "Space") {
      if (!obj.action) justPressed = true;
      obj.action = true;
    }
    if (justPressed) {
      emitUserCommands(obj);
      justPressed = false;
    }
  });

  canvas.addEventListener("keyup", function (e) {
    if (e.code === "ArrowLeft" || e.code === "KeyA") {
      obj.left = false;
    }
    if (e.code === "ArrowUp" || e.code === "KeyW") {
      obj.up = false;
    }
    if (e.code === "ArrowRight" || e.code === "KeyD") {
      obj.right = false;
    }
    if (e.code === "ArrowDown" || e.code === "KeyS") {
      obj.down = false;
    }
    if (e.code === "Space") {
      obj.action = false;
    }
    emitUserCommands(obj);
  });
}

function emitUserCommands(obj) {
  let userCommands = {
    left: obj.left || false,
    up: obj.up || false,
    right: obj.right || false,
    down: obj.down || false,
    action: obj.action || false,
  };
  socket.emit("userCommands", userCommands);
}
