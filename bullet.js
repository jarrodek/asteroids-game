/* global Asteroid, GameObject */

/**
 * A bullet launched by the player.
 *
 * @param {Number} x Bullet's x position
 * @param {Number} y Bullet's y position
 * @param {Game} game Reference to the game object.
 * @param {Number} dir Direction of the bullet in rad.
 */
function Bullet(x, y, game, dir) {
  GameObject.call(this, x, y, 5, game);
  this.stepSpeed = 15;
  this.lifeTime = 50;
  this.dir = dir;
}

Bullet.prototype = Object.create(GameObject.prototype);

Bullet.prototype.draw = function (ctx) {
  ctx.save();
  ctx.translate(this.x, this.y);
  if (this.lifeTime >= 10)
    ctx.fillStyle = 'rgba(255,255,255,1)';
  else
    ctx.fillStyle = 'rgba(255,255,255,0.' + this.lifeTime + ')';
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 2;
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.moveTo(0, 0);
  ctx.fillRect(0, 0, 3, 3);

  ctx.restore();
};


Bullet.prototype.step = function () {
  this.lifeTime--;
  this.x = this.x + Math.cos(this.dir) * this.stepSpeed;
  this.y = this.y + Math.sin(this.dir) * this.stepSpeed;
  var obj = this.game.isCollision(this, false);
  if (obj !== false) {
    this.lifeTime = 0;

    if (obj instanceof Asteroid) {
      obj.divide();
    }

    return;
  }
};
