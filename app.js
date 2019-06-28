const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Game = require('./Game');

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

const game = new Game(io);

io.on('connection', (client) => {
  game.addPlayer(client.id);

  client.on('key', (key) => {
    game.handleInput(client.id, key);
  });

  client.on('disconnect', () => {
    game.removePlayer(client.id);
  });
});
