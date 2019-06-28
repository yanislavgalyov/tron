const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const _ = require('lodash');

const Player = require('./Player');
const Obstacle = require('./Obstacle');
const Directions = require('./Directions');

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

const players = [];
const obstacles = [];
let gameState = 'idle';

// todo move to utils
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

io.on('connection', (client) => {

  const player = new Player({
    id: client.id,
    x: 1,
    y: 1,
    dir: Directions.right,
    color: getRandomColor()
  });

  players.push(player);

  if (players.length > 1) {
    gameState = 'busy';
  }

  client.on('key', (key) => {
    if (player) {
      player.changeDirection(key);
      // const obstacle = player.leaveTrail();
      // obstacles.push(obstacle);
      // player.move();
    }
  });

  client.on('disconnect', () => {
    _.remove(players, player);
    if (players.length < 2) {
      gameState = 'idle';
    }
  });
});

setInterval(() => {
  // todo update logic - move, check collisions

  if (gameState == 'busy') {
    console.log(gameState);
    players.forEach((p) => {
      const obstacle = p.leaveTrail();
      obstacles.push(obstacle);
      p.move();
    });
  }

  // todo state should be constant
  io.emit('state', {
    time: new Date(),
    // todo move mapping to player
    players: players.map((p) => ({
      id: p.id,
      x: p.x,
      y: p.y,
      dir: p.dir,
      color: p.color
    })),
    // todo move mapping to obstacle
    obstacles: obstacles.map((o) => ({
      x: o.x,
      y: o.y,
      color: o.color
    }))
  });
}, 1000);
