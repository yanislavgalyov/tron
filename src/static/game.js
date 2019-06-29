function Renderer(canvas) {
  var ratio = window.innerWidth < window.innerHeight ?
    window.innerWidth - 20 :
    window.innerHeight - 20;

  this.canvas = canvas;
  this.canvas.width = this.canvas.height = ratio;
  this.context = this.canvas.getContext('2d');
  this.gridSize = 100;
  this.cellSize = ratio / this.gridSize;
}

Renderer.prototype.drawText = function (text, x, y, options) {
  var context = this.context;
  options = options || {};

  context.font = `${options.size || 30}px ${options.font || 'Arial'}`;
  context.fillStyle = options.color || 'Black';
  context.textAlign = options.alignment || 'start';
  context.fillText(text, x, y);
}

Renderer.prototype.draw = function (id, state) {
  var context = this.context;
  var cellSize = this.cellSize;

  this.context.fillStyle = "#fff";
  this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

  if (state.state === 'idle') {
    this.drawText("Waiting...", this.canvas.width / 2, this.canvas.height / 2, { alignment: 'center' });
  }
  else if (state.state === 'preparing') {
    this.drawText("Get ready!", this.canvas.width / 2, this.canvas.height / 2, { alignment: 'center' });
  }

  state.players.forEach((p) => {
    context.fillStyle = p.color;
    context.fillRect(p.x * cellSize, p.y * cellSize, cellSize, cellSize);

    if (p.id === id) {
      this.drawText(`Score: ${p.score}`, 5, 15, { size: 15 });

      context.beginPath();
      context.arc(
        p.x * cellSize + this.cellSize / 2,
        p.y * cellSize + this.cellSize / 2,
        (this.cellSize / 2) + 2,
        0,
        2 * Math.PI);
      context.stroke();

      var start, stop;

      switch (p.dir) {
        case 'right':
          start = 1.5 * Math.PI;
          stop = 0.5 * Math.PI;
          break;
        case 'down':
          start = 0;
          stop = Math.PI;
          break;
        case 'left':
          start = 0.5 * Math.PI;
          stop = 1.5 * Math.PI;
          break;
        case 'up':
          start = Math.PI;
          stop = 0;
          break;
      }

      context.beginPath();
      context.arc(
        p.x * cellSize + this.cellSize / 2,
        p.y * cellSize + this.cellSize / 2,
        (this.cellSize / 2) + 2,
        start,
        stop);
      context.closePath();
      context.fillStyle = 'Black';
      context.fill();
    }
  });

  state.obstacles.forEach((o) => {
    context.fillStyle = o.color;
    context.fillRect(o.x * cellSize, o.y * cellSize, cellSize, cellSize);
  });
}

var socket = io();
var id;

socket.on('connect', function () {
  id = socket.id;
  console.log(`connected as user ${id}`);
})

var canvas = document.createElement("canvas");
document.body.appendChild(canvas);

var renderer = new Renderer(canvas);

document.onkeydown = (ev) => {
  socket.emit('key', ev.keyCode);
};

socket.on('state', (state) => {
  if (id) {
    renderer.draw(id, state);
  }
});
