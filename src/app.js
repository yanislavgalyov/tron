const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Game = require('./entities/Game');

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/static/index.html');
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

const game = new Game(io);

io.on('connection', (client) => {
  console.log(`client connected : ${client.id}`)
  game.addPlayer(client.id);

  client.on('key', (key) => {
    game.handleInput(client.id, key);
  });

  client.on('disconnect', () => {
    console.log(`client disconnected : ${client.id}`)
    game.removePlayer(client.id);
  });
});
