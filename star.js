/* global Asteroid, GameObject */

/**
 * A star in the background.
 *
 * @param {Number} x Star's x position
 * @param {Number} y Star's y position
 * @param {Game} game Reference to the game object.
 * @param {Number} dir Direction of the star.
 * @param {Number} speed The speed of the star.
 * @param {String} color Color of the star.
 */
function Star(x, y, game, dir, speed, color) {
  var r = (Math.floor(Math.random() * 4) + 2);
  GameObject.call(this, x, y, r, game);
  this.stepSpeed = speed || 0.3;
  this.dir = dir;
  color = color || '#fff';
  this.color = color;
}

Star.prototype = Object.create(GameObject.prototype);

Star.prototype.draw = function (ctx) {
  ctx.save();
  ctx.fillStyle = this.color;
  ctx.translate(this.x, this.y);
  ctx.beginPath();
  ctx.moveTo(this.r, 0);
  for (var i = 0; i < 9; i++) {
    ctx.rotate(Math.PI / 5);
    if (i % 2 === 0) {
      ctx.lineTo((this.r / 0.525731) * 0.200811, 0);
    } else {
      ctx.lineTo(this.r, 0);
    }
  }
  ctx.closePath();
  ctx.fill();

  ctx.restore();
};


Star.prototype.step = function () {

  if (!this.isObiectFullInLevel(this)) {
    this.removeObject(this);
    window.setTimeout(function(){
      var dir = dir * Math.rand(1, 360);
      this.game.appendRandomStar(dir);
    }.bind(this),0);
    return;
  }

  this.x = this.x + Math.cos(this.dir) * this.stepSpeed;
  this.y = this.y + Math.sin(this.dir) * this.stepSpeed;

};
