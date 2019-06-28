"use strict";

const Directions = require('./Directions');
const Obstacle = require('./Obstacle');

const KEYS = {
  up: 38,
  right: 39,
  down: 40,
  left: 37
};

class Player {
  constructor(options) {
    this.id = options.id;
    this.x = options.x;
    this.y = options.y;
    this.dir = options.dir;
    this.color = options.color;
    this.score = 0;
  }

  leaveTrail() {
    return new Obstacle({
      x: this.x,
      y: this.y,
      color: this.color
    })
  }

  changeDirection(key) {
    switch (key) {
      case KEYS.up:
        if (this.dir !== Directions.down)
          this.dir = Directions.up;
        break;
      case KEYS.right:
        if (this.dir !== Directions.left)
          this.dir = Directions.right;
        break;
      case KEYS.down:
        if (this.dir !== Directions.up)
          this.dir = Directions.down;
        break;
      case KEYS.left:
        if (this.dir !== Directions.right)
          this.dir = Directions.left;
        break;
    }
  }

  move() {
    switch (this.dir) {
      case Directions.right:
        this.x++; break;
      case Directions.left:
        this.x--; break;
      case Directions.up:
        this.y--; break;
      case Directions.down:
        this.y++; break;
    }
  }
}

module.exports = Player;
