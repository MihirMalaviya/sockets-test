let justPressed = false;
let lastUserCommands = {};

function userInput(obj) {
  canvas.addEventListener("keydown", function (e) {
    handleKeyEvent(e, obj, true);
  });

  canvas.addEventListener("keyup", function (e) {
    handleKeyEvent(e, obj, false);
  });

  canvas.addEventListener("mousedown", function (e) {
    handleMouseEvent(e, obj, true);
  });

  canvas.addEventListener("mouseup", function (e) {
    handleMouseEvent(e, obj, false);
  });
}

function handleKeyEvent(e, obj, isKeyDown) {
  if (e.key === "Shift") obj.dash = isKeyDown;

  if (e.code === "ArrowLeft" || e.code === "KeyA") obj.left = isKeyDown;
  if (e.code === "ArrowUp" || e.code === "KeyW") obj.up = isKeyDown;
  if (e.code === "ArrowRight" || e.code === "KeyD") obj.right = isKeyDown;
  if (e.code === "ArrowDown" || e.code === "KeyS") obj.down = isKeyDown;
  if (e.code === "Space") obj.action = isKeyDown;
  if (e.code === "Digit1" && isKeyDown) obj.num = 1;
  if (e.code === "Digit2" && isKeyDown) obj.num = 2;
  if (e.code === "Digit3" && isKeyDown) obj.num = 3;
  // console.log(obj);
  emitChangedUserCommands(obj);
}

function handleMouseEvent(e, obj, isMouseDown) {
  if (e.button === 0) {
    obj.mouseLeft = isMouseDown;
  } else if (e.button === 2) {
    obj.mouseRight = isMouseDown;
  }
  emitChangedUserCommands(obj);
}

function emitChangedUserCommands(obj) {
  let changedUserCommands = {};
  for (const key in obj) {
    if (obj[key] !== lastUserCommands[key]) {
      changedUserCommands[key] = obj[key];
    }
  }
  lastUserCommands = { ...obj };
  if (Object.keys(changedUserCommands).length > 0) {
    if (changedUserCommands.num) {
      clientBalls[socket.id].hotbarIndex = changedUserCommands.num - 1;
      clientBalls[socket.id].redraw();
      console.log(changedUserCommands.num - 1);
    }
    // console.log(changedUserCommands.num);

    socket.emit("userCommands", changedUserCommands);
  }
}
