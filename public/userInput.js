let justPressed = false;

let lastUserCommands = {};

function userInput(obj) {
  canvas.addEventListener("keydown", function (e) {
    if (e.code === "ArrowLeft" || e.code === "KeyA") obj.left = true;
    if (e.code === "ArrowUp" || e.code === "KeyW") obj.up = true;
    if (e.code === "ArrowRight" || e.code === "KeyD") obj.right = true;
    if (e.code === "ArrowDown" || e.code === "KeyS") obj.down = true;
    if (e.code === "Space") obj.action = true;
    emitChangedUserCommands(obj);
  });

  canvas.addEventListener("keyup", function (e) {
    if (e.code === "ArrowLeft" || e.code === "KeyA") obj.left = false;
    if (e.code === "ArrowUp" || e.code === "KeyW") obj.up = false;
    if (e.code === "ArrowRight" || e.code === "KeyD") obj.right = false;
    if (e.code === "ArrowDown" || e.code === "KeyS") obj.down = false;
    if (e.code === "Space") obj.action = false;
    emitChangedUserCommands(obj);
  });
}

function emitChangedUserCommands(obj) {
  let changedUserCommands = {};
  for (const key in obj) {
    if (obj[key] !== lastUserCommands[key]) {
      changedUserCommands[key] = obj[key];
    }
  }
  lastUserCommands = { ...obj };
  if (changedUserCommands) socket.emit("userCommands", changedUserCommands);
}
