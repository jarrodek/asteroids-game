/*
 * Copyright (c) 2015 jarro_000. All rights reserved.
 */


/* global Player, Bullet, Asteroid, Star */

/**
 * It's a basic game object.
 * Game objects like player, asteroids and bullets should inherit from this object.
 *
 * @param {Number} x initial X position
 * @param {Number} y initial Y position
 * @param {Number} r The radius of the object
 * @param {Game} game Reference to the game object.
 * @returns {GameObject}
 */
function GameObject(x, y, r, game) {
  this.x = x;
  this.y = y;
  this.r = r;
  this.game = game;
}

GameObject.prototype.removeObject = function (obj) {
  this.game.removeObject(obj);
//  if (obj instanceof Player) {
//    this.game.removePlayer(obj);
//  } else if (obj instanceof Bullet) {
//    this.game.removeBullet(obj);
//  } else if (obj instanceof Asteroid) {
//    this.game.removeAsteroid(obj);
//  } else if (obj instanceof Star){
//    this.game.removeStar(obj);
//  }
};

/**
 * Test if GameObject obj is in bounds of the board.
 *
 * @param {GameObject} obj Object to be tested
 */
GameObject.prototype.isObjectInLevel = function (obj) {
  if (!(obj.x > -obj.r || obj.x < this.canvasSize[0] + obj.r)) { //it's on OX axis
    return false;
  }
  if (!(obj.y > -obj.r || obj.y < this.canvasSize[1] + obj.r)) {//it's on OY axis
    return false;
  }
  return true;
};

/**
 * Similar to isObjectInLevel but the obj must be completely inside the board.
 *
 * @param {GameObject} obj Object to be tested
 */
GameObject.prototype.isObiectFullInLevel = function (obj) {
  //check 0X axis
  if(obj.x < 0) return false; //axis start
  if(obj.x + obj.r > this.canvasSize[0]) return false; //axis end
  //check 0Y axis
  if(obj.y < 0) return false; //axis start
  if(obj.y + obj.r > this.canvasSize[1]) return false; //axis end
  
  return true;
};
Object.defineProperty(GameObject.prototype, "canvasSize", {
  get: function () {
    return this.game.canvasSize;
  }
});