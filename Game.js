"use strict";

const Player = require('./Player');
const Directions = require('./Directions');
const StateMachine = require('javascript-state-machine');

const KEYS = {
  up: 38,
  right: 39,
  down: 40,
  left: 37
};

class Game {
  constructor(io) {
    this.io = io;
    this.gridSize = 100;
    this.shouldSendUpdate = false;

    this.players = {};
    this.obstacles = [];

    this.innerState = new StateMachine({
      init: 'idle',
      transitions: [
        { name: 'start', from: 'idle', to: 'preparing' },
        { name: 'play', from: 'preparing', to: 'busy' },
        { name: 'reset', from: 'busy', to: 'preparing' },
        { name: 'stop', from: '*', to: 'idle' }
      ],
      methods: {
        onStart: () => {
          this.reset();
          this.lastUpdateTime = Date.now();
        },
        onPlay: () => { console.log('onPlay'); },
        onReset: () => {
          this.reset();
          console.log('onReset');
        },
        onStop: () => {
          this.reset();
          console.log('onStop');
        }
      }
    });

    setInterval(this.update.bind(this), 200);
  }

  generateColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  addPlayer(id) {
    if (this.innerState.state == 'idle') {
      this.players[id] = new Player({
        id: id,
        x: this.random(10, 90),
        y: this.random(10, 90),
        dir: Directions.right,
        color: this.generateColor()
      });

      if (Object.keys(this.players).length > 1) {
        this.innerState.start();
      }
    }
  }

  removePlayer(id) {
    delete this.players[id];

    if (Object.keys(this.players).length < 2) {
      this.innerState.stop();
    }
  }

  handleInput(playerId, key) {
    if (this.players[playerId]) {
      this.players[playerId].changeDirection(key);
    }
  }

  checkWin() {
    const winners = [];
    for (const k1 in this.players) {
      const player = this.players[k1];
      if (player.isAlive) {
        winners.push(k1);
      }
    }

    if (winners.length == 1) {
      this.players[winners[0]].win();
      this.innerState.reset();
    }
    else if (winners.length == 0) {
      this.innerState.reset();
    }
  }

  checkCollision() {
    for (const k1 in this.players) {
      const player = this.players[k1];

      if (player.x < 0 || player.x >= this.gridSize || player.y < 0 || player.y >= this.gridSize) {
        player.crash();
      }
      else if (this.obstacles.some(e => e.x == player.x && e.y == player.y)) {
        player.crash();
      }
      else {
        for (const k2 in this.players) {
          if (k2 == k1) {
            continue;
          }

          const anotherPlayer = this.players[k2];

          if (player.x == anotherPlayer.x && player.y == anotherPlayer.y) {
            player.crash();
          }
        }
      }
    }
  }

  reset() {
    for (const k1 in this.players) {
      const player = this.players[k1];
      player.respawn();
    }

    this.obstacles = [];
  }

  update() {
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    if (this.innerState.state == 'preparing') {
      this.temp = (this.temp || 0) + dt;
      console.log(this.temp);
      if (this.temp > 3) {
        this.temp = 0;
        this.innerState.play();
      }
    }
    else if (this.innerState.state == 'busy') {

      Object.keys(this.players).forEach(k => {
        if (this.players[k].isAlive) {
          const obstacle = this.players[k].leaveTrail();
          this.obstacles.push(obstacle);
          this.players[k].move();
        }
      });

      this.checkCollision();
      this.checkWin();
    }

    // if (this.shouldSendUpdate) {
    this.io.emit('state', {
      state: this.innerState.state,
      players: Object.keys(this.players).map(k => ({
        id: this.players[k].id,
        x: this.players[k].x,
        y: this.players[k].y,
        dir: this.players[k].dir,
        color: this.players[k].color,
        score: this.players[k].score,
        isAlive: this.players[k].isAlive
      })),
      obstacles: this.obstacles.map((o) => ({
        x: o.x,
        y: o.y,
        color: o.color
      }))
    });

    //   this.shouldSendUpdate = false;
    // } else {
    //   this.shouldSendUpdate = true;
    // }
  }
}

module.exports = Game;
