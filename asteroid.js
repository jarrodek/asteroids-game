/* global GameObject */

/**
 * @param {Number} x Asteroid's start x posiotion
 * @param {Number} y Asteroid's start y posiotion
 * @param {Game} game Reference to the game object.
 * @param {Number} r The radius of the asteroid
 * @param {Number} v prędkość
 * @param {Number} angle
 * @param {Object} image An image to be used
 */
function Asteroid(x, y, r, game, v, angle, image) {
  GameObject.call(this, x, y, r, game);

  //    angle = Math.toRadians(90);
  //    this.v = 10;
  this.v = v;
  this.angle = angle;
  this.minR = 10;
  this.outOfBoundsY = false;
  this.outOfBoundsX = false;
  var degree = Math.toAbsDegrees(angle);
  this.isTop = (degree > 180 && degree < 360);
  this.isRight = (degree > 270 || degree < 90);
  this.isBottom = (degree > 0 && degree < 180);
  this.isLeft = (degree < 270 && degree > 90);

  if (image instanceof HTMLImageElement) {
    this.image = image;
  } else {
    this.image = null;
    this.imageSize = [image.width, image.height];
    var img = new Image(image.width, image.height);
    img.onload = function () {
      this.image = img;
    }.bind(this);
    img.src = image.src;
  }

}

Asteroid.prototype = Object.create(GameObject.prototype);

Asteroid.prototype.step = function () {

  var a = -0.00005;
  this.v += a;
  this.v = Math.abs(this.v);

  if (this.v > 10) {
    this.v = 10;
  }

  this.x = this.x + Math.cos(this.angle) * this.v;
  this.y = this.y + Math.sin(this.angle) * this.v;
  var newY = this.y;
  var newX = this.x;
  var padding = this.r;

  var boundsX = ((newX < padding) || (newX > this.canvasSize[0] - padding));
  var boundsY = ((newY < padding) || (newY > this.canvasSize[1] - padding));

  if (boundsX && boundsY) {
    if (!this.outOfBoundsY && !this.outOfBoundsX) {
      var _nx = 0;
      var _ny = 0;

      if ((newX - padding) <= 0) {
        _nx = this.canvasSize[0] + newX;
      } else {
        _nx = newX - this.canvasSize[0];
      }

      if ((newY - padding) <= 0) {
        _ny = this.canvasSize[1] + newY;
      } else {
        _ny = newY - this.canvasSize[1];
      }

      var aXY = null;
      aXY = new Asteroid(_nx, _ny, this.r, this.game, this.v, this.angle, this.image);
      aXY.outOfBoundsY = true;
      aXY.outOfBoundsX = true;
      //TODO: create a method in the Game
      this.game.asteroids[this.game.asteroids.length] = aXY;
      this.outOfBoundsY = true;
      this.outOfBoundsX = true;
    } else {
      if (!this.isObiectFullInLevel(this)) {
        this.removeObject(this);
      }
    }
  } else if (boundsY) {
    if (!this.outOfBoundsY && !this.outOfBoundsX) {
      var aY = null;
      if (newY > this.canvasSize[1] - padding) {
        aY = new Asteroid(newX, -(this.canvasSize[1] - newY), this.r, this.game, this.v, this.angle, this.image);
        aY.outOfBoundsY = true;
        //TODO: create a method in the Game
        this.game.asteroids[this.game.asteroids.length] = aY;
        this.outOfBoundsY = true;
      } else {
        aY = new Asteroid(newX, this.canvasSize[1] + newY, this.r, this.game, this.v, this.angle, this.image);
        aY.outOfBoundsY = true;
        //TODO: create a method in the Game
        this.game.asteroids[this.game.asteroids.length] = aY;
        this.outOfBoundsY = true;
      }
    } else if (this.outOfBoundsY) {
      if ((this.isTop && newY < -padding) || (this.isBottom && newY > this.canvasSize[1] + padding)) {
        this.removeObject(this);
      } else {
        if (this.isTop && newY > padding && newY < this.canvasSize[1] - padding) {
          this.outOfBoundsY = false;
        } else if (this.isBottom && newY < this.canvasSize[1] - padding && newY > padding) {
          this.outOfBoundsY = false;
        }
      }
    }
  } else if (boundsX) {
    if (!this.outOfBoundsY && !this.outOfBoundsX) {
      var aX = null;
      if (this.isLeft) {
        aX = new Asteroid(this.canvasSize[0] + newX, newY, this.r, this.game, this.v, this.angle, this.image);
      } else {
        aX = new Asteroid(this.canvasSize[0] - newX, newY, this.r, this.game, this.v, this.angle, this.image);
      }
      aX.outOfBoundsX = true;
      //TODO: create a method in the Game
      this.game.asteroids[this.game.asteroids.length] = aX;
      this.outOfBoundsX = true;
    } else if (this.outOfBoundsX) {
      if ((this.isLeft && newX < -20) || (this.isRight && newX > this.canvasSize[0] + padding)) {
        this.removeObject(this);
      } else {
        if (this.isLeft && newX > padding && newX < this.canvasSize[0] - padding) {
          this.outOfBoundsX = false;
        } else if (this.isRight && newX < this.canvasSize[0] - padding && newX > padding) {
          this.outOfBoundsX = false;
        }
      }
    }
  } else {
    if (this.outOfBoundsY) {
      if (this.isTop && newY > padding && newY < this.canvasSize[1] - padding) {
        this.outOfBoundsY = false;
      } else if (this.isBottom && newY < this.canvasSize[1] - padding && newY > padding) {
        this.outOfBoundsY = false;
      }
    }
    if (this.outOfBoundsX) {
      if (this.isLeft && newX > padding && newX < this.canvasSize[0] - padding) {
        this.outOfBoundsX = false;
      } else if (this.isRight && newX < this.canvasSize[0] - padding && newX > padding) {
        this.outOfBoundsX = false;
      }
    }
  }

//  var crashObj = this.game.isCollision(this, false);
//  if (crashObj) {
//    if (crashObj instanceof Asteroid) {
//      this.divide();
//      crashObj.divide();
//    }
//  }

};
Asteroid.prototype.draw = function (ctx) {
  if (!this.image)
    return;
  ctx.save();

  ctx.drawImage(this.image, this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);

  ctx.translate(this.x, this.y);
  ctx.strokeStyle = "#D40000";
//  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(0, 0, this.r, 0, 2 * Math.PI, true);
  ctx.stroke();
//  ctx.fill();
  ctx.restore();
};

Asteroid.prototype.divide = function () {
  if (this.r <= this.minR) {
    this.removeObject(this);
    return;
  }
  var angle1 = Math.toRadians(Math.toDegrees(this.angle) - 30);
  var angle2 = -angle1;

  var asteroid1 = new Asteroid(this.x, this.y, this.r / 2, this.game, this.v * 1.5, angle1, this.image);
  var asteroid2 = new Asteroid(this.x, this.y, this.r / 2, this.game, this.v * 1.5, angle2, this.image);

  asteroid1.outOfBoundsY = asteroid2.outOfBoundsY = this.outOfBoundsY;
  asteroid1.outOfBoundsX = asteroid2.outOfBoundsX = this.outOfBoundsX;

  //TODO: create a method in the Game
  this.game.asteroids[this.game.asteroids.length] = asteroid1;
  //TODO: create a method in the Game
  this.game.asteroids[this.game.asteroids.length] = asteroid2;

  this.removeObject(this);
};