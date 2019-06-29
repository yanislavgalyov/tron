const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const Game = require('./entities/Game');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

app.use('/static', express.static(__dirname + '/static'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(3000, () => {
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
