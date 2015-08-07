/* global Bullet, Player, Asteroid, Star */

var logger = null;

/**
 * Kody klawiszy używane do gry
 */
var Keys = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  SPACE: 32,
  codes: [32, 37, 38, 39, 40]
};


function Game() {
  this.keysPressed = [];
  this.player = [];
  this.bullets = [];
  this.asteroids = [];
  this.stars = [];
  this.drawAsteroids = true;
  this.drawStars = true;
  this.asteroidsCount = 5;
  this.starsCount = 55;
  this.gameCanvas = document.getElementById('game');
  this.context = this.gameCanvas.getContext("2d");
  this.canvasSize = [0, 0];
  this.loopAnimation = false;
}
Game.prototype = {
  init: function () {
    document.querySelector("#begin-button").addEventListener('click', game.start.bind(game));
    document.querySelector("#again-button").addEventListener('click', game.reset.bind(game));

    this.calculateSize();
    this.setCanvasSize();
    this.observe();
    this.createBackground();
    this.createStars();
    this.createPlayerObject();
    this.createAsteroids();
  },
  reset: function () {
    this.player = [];
    this.bullets = [];
    this.asteroids = [];
    this.stars = [];

    this.createStars();
    this.createPlayerObject();

    document.querySelector(".game-overlay").classList.add("hidden");
    window.setTimeout(function () {
      document.querySelector(".game-overlay").classList.add("closed");

      document.querySelector("#begin-button").classList.add('closed');
      document.querySelector("#again-button").classList.remove('closed');

      this.createAsteroids();
    }.bind(this), 300);
  },
  setCanvasSize: function () {
    this.gameCanvas.setAttribute('width', this.canvasSize[0]);
    this.gameCanvas.setAttribute('height', this.canvasSize[1]);
  },
  calculateSize: function () {
    this.canvasSize = [this.gameCanvas.scrollWidth, this.gameCanvas.scrollHeight];
  },
  observe: function () {
    document.body.addEventListener('keyup', this.listenUp.bind(this), true);
    document.body.addEventListener('keydown', this.listenDown.bind(this), true);
  },
  start: function () {
    document.querySelector(".game-overlay").classList.add("hidden");
    window.setTimeout(function () {
      document.querySelector(".game-overlay").classList.add("closed");

      document.querySelector("#begin-button").classList.add('closed');
      document.querySelector("#again-button").classList.remove('closed');

      this.startLoop();
    }.bind(this), 300);
  },
  listenUp: function (e) {
    if (Keys.codes.indexOf(e.keyCode) !== -1) {
      var index = this.keysPressed.indexOf(e.keyCode);
      if (index !== -1) {
        this.keysPressed.remove(index, index + 1);
      }
      e.preventDefault();
    }
  },
  listenDown: function (e) {

    if (e.keyCode === 83) {

      if (!this.loopAnimation) {
        this.startLoop();
      } else {
        this.stopLoop();
      }

      return;
    }

    if (Keys.codes.indexOf(e.keyCode) !== -1) {
      if (this.keysPressed.indexOf(e.keyCode) === -1) {
        this.keysPressed[this.keysPressed.length] = e.keyCode;
      }
      e.preventDefault();
    }
  },
  random: function (min, max, interval) {
    if (min === undefined || max === undefined) {
      throw new "random require both 'min' and 'max' arguments.";
    }
    interval = interval || 1;
    var r = Math.floor(Math.random() * (max - min) / interval + interval);
    return r * interval + min;
  },
  /**
   * Draw games background
   */
  createBackground: function () {
    var lingrad = this.context.createLinearGradient(0, 0, 0, this.canvasSize[1]);
    lingrad.addColorStop(0, '#15003d');
    lingrad.addColorStop(1, '#001775');

    this.context.save();
    this.context.clearRect(0, 0, this.canvasSize[0], this.canvasSize[1]);

    this.context.fillStyle = lingrad;
    this.context.fillRect(0, 0, this.canvasSize[0], this.canvasSize[1]);

    this.context.restore();
  },
  createStars: function () {
    if (!this.drawStars)
      return;
    var dir = 2 * Math.PI - Math.PI / 2;
    for (var i = 0, len = this.starsCount; i < len; i++) {
      var star = this.appendRandomStar(dir);
      star.draw(this.context);
    }
  },
  createPlayerObject: function () {
    var x = this.canvasSize[0] / 2 - 20, y = 3 * this.canvasSize[1] / 4;
//    console.log('createPlayerObject. x: %d, y: %d', x, y);
    var p = new Player(x, y, this);
    this.player = [p];
    p.draw(this.context);
  },
  startLoop: function () {
    this.loopAnimation = true;
    window.requestAnimationFrame(this.loop.bind(this));
  },
  stopLoop: function () {
    this.loopAnimation = false;
  },
  loop: function () {
    var ctx = this.context;

    this.createBackground();

    this.stars.forEach(function (star) {
      star.step();
      star.draw(ctx);
    });

    this.player.forEach(function (playerObj) {
      playerObj.loopEvent(this.keysPressed);
      playerObj.step();
    }, this);


    this.bullets.forEach(function (bullet) {
      bullet.step();
    });
    this.asteroids.forEach(function (asteroid) {
      asteroid.step();
    });

    this.bullets.forEach(function (bullet) {
      if (bullet.lifeTime <= 0)
        this.removeBullet(bullet);
    }, this);
    this.player.forEach(function (playerObj) {
      playerObj.draw(ctx);
    }, this);
    this.bullets.forEach(function (bullet) {
      bullet.draw(ctx);
    });
    this.asteroids.forEach(function (asteroid) {
      asteroid.draw(ctx);
    });


    ctx.save();
    ctx.translate(20, 20);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Asteroids: ' + this.asteroids.length, 0, 0);
    ctx.translate(0, 14);
    ctx.fillText('Stars: ' + this.stars.length, 0, 0);
    ctx.translate(0, 14);
    ctx.fillText('Bullets: ' + this.bullets.length, 0, 0);
    ctx.translate(0, 14);
    ctx.fillText('Players: ' + this.player.length, 0, 0);
    ctx.restore();


    if (this.loopAnimation)
      window.requestAnimationFrame(this.loop.bind(this));
  },
  asteroidsSrc: [{
      'src': 'assets/a1.png',
      'width': 120,
      'height': 121
    }, {
      'src': 'assets/a2.png',
      'width': 120,
      'height': 121
    }, {
      'src': 'assets/a3.png',
      'width': 100,
      'height': 72
    }, {
      'src': 'assets/a4.png',
      'width': 120,
      'height': 104
    }],
  createAsteroids: function () {
    if (!this.drawAsteroids)
      return;

    for (var i = 0, len = this.asteroidsCount; i < len; i++) {
      var asteroid = this.createAsteroid();
      asteroid.draw(this.context);
      this.asteroids[this.asteroids.length] = asteroid;
    }
  },
  createAsteroid: function () {
    do {
      var image = this.asteroidsSrc[this.random(0, this.asteroidsSrc.length - 1)];

      if (!image)
        continue;

      var r = Math.rand(10, 50);
      var x = 800 - Math.floor(Math.random() * this.canvasSize[0]);
      var y = 400 - Math.floor(Math.random() * this.canvasSize[1]);
      var angle = Math.rand(1, 360) * (Math.PI / 180);
      var v = Math.random() * 1.8;
      if (v < 0.3) {
        v = 0.3;
      }

      var asteroid = new Asteroid(x, y, r, this, v, angle, image);
      if (this.isCollision(asteroid, true, 100) !== false) {
        asteroid = null;
        continue;
      }
      return asteroid;
    } while (true);
  },
  /**
   * Check if there is a collision with a player.
   * @returns {Boolean|GameObject} False if there is no collision or GameObject otherwise.
   */
  isCollisionWithPlayer: function () {
    for (var j = 0, pcnt = this.player.length; j < pcnt; j++) {
      var player = this.player[j];
      if (!player)
        continue;
      var r = player.r;
      var pos = [player.x, player.y];

      //with asteroid
      for (var i = 0, cnt = this.asteroids.length; i < cnt; i++) {
        var ast = this.asteroids[i];
        var distance = this.calculateDistance(pos, [ast.x, ast.y]);
        if (distance <= (r + ast.r)) {
          return ast;
        }
      }
      return false;
    }
  },
  /**
   * Check if the GameObject is in collision with another GameObject.
   *
   * This game assumes all objects are round. It will take only to calculate
   * if vector created from centers from both objects is less than sum of radius.
   *
   * There is a great article about objects overlaping:
   * http://www.dyn4j.org/2010/01/sat/
   *
   * @param {GameObject} obj Checked GameObject
   * @param {Boolean} checkPlayer true if should check collision state with Player. Should be set to false if {obj} is a Player.
   * @param {Number} addPadding Add padding to obj radius.
   * @returns {GameObject|Boolean} Returns GameObject which is in the collision with obj or false if is not in collision.
   */
  isCollision: function (obj, checkPlayer, addPadding) {
    addPadding = addPadding || 0;

    var oR = obj.r;
    oR += addPadding;


    //is collision with player?
    if (checkPlayer) {
      var pcnt = this.player.length;
      for (var j = 0; j < pcnt; j++) {
        var player = this.player[j];
        var distance = this.calculateDistance([obj.x, obj.y], [player.x, player.y]);
        if (distance <= (player.r + oR)) {
          return player;
        }
      }
    }

    //with asteroid
    var cnt = this.asteroids.length;
    for (var i = 0; i < cnt; i++) {
      var ast = this.asteroids[i];
      if(ast === obj) continue;
      distance = this.calculateDistance([obj.x, obj.y], [ast.x, ast.y]);
      if (distance <= (oR + ast.r)) {
        return ast;
      }
    }

    return false;
  },
  /**
   * Calculate distance between two objects - a vector between two points.
   * @param {Array} obj1coord coordinates {X,Y} of first GameObject
   * @param {Array} obj2coord coordinates {X,Y} of second GameObject
   * @returns {Number}
   */
  calculateDistance: function (obj1coord, obj2coord) {
    return Math.floor(Math.sqrt(Math.pow(Math.abs(obj2coord[0] - obj1coord[0]), 2) + Math.pow(Math.abs(obj2coord[1] - obj1coord[1]), 2)));
  },
  /**
   * Remove player from the game.
   * @param {Player} player A Player object to be removed.
   * @returns {undefined}
   */
  removePlayer: function (player) {
    this.removeObject(player);
  },
  /**
   * Remove bullet from the game.
   * @param {Bullet} bullet A Bullet object to be removed.
   * @returns {undefined}
   */
  removeBullet: function (bullet) {
    this.removeObject(bullet);
  },
  /**
   * Remove asteroid from the game.
   * @param {Asteroid} asteroid An Asteroid object to be removed.
   * @returns {undefined}
   */
  removeAsteroid: function (asteroid) {
    this.removeObject(asteroid);
  },
  removeStar: function (star) {
    this.removeObject(star);
  },
  /**
   * Remove a GameObject from the board.
   * @param {GameObject} obj GameObject to be removed.
   * @returns {undefined}
   */
  removeObject: function (obj) {
    var arr = null;
    if (obj instanceof Player) {
      arr = this.player;
    } else if (obj instanceof Bullet) {
      arr = this.bullets;
    } else if (obj instanceof Asteroid) {
      arr = this.asteroids;
    } else if (obj instanceof Star) {
      arr = this.stars;
    }
    if (!arr) {
      console.warn('Tried to remove unknown object', obj);
      return;
    }
    //arr is a pointer
    var index = arr.indexOf(obj);
    if (index !== -1) {
//      console.info('Removing object', obj);
      arr.splice(index, 1);
    }
  },
  /**
   * Append new GameObject to it's corresponding objects array.
   * @param {GameObject} obj GameObject to be appended to the array.
   * @returns {undefined}
   */
  appendObject: function (obj) {
    if (obj instanceof Player) {
      this.player[this.player.length] = obj;
    } else if (obj instanceof Bullet) {
      this.bullets[this.bullets.length] = obj;
    } else if (obj instanceof Asteroid) {
      this.asteroids[this.asteroids.length] = obj;
    } else if (obj instanceof Star) {
      this.stars[this.stars.length] = obj;
    }
  },
  appendRandomStar: function (dir, speed) {
    var starsColors = ['#ededed', '#a3c5ff', '#fff8a6', '#ffb0a6'];
    var color = starsColors[this.random(0, starsColors.length - 1)];
//    dir = dir || Math.PI;
    dir = Math.PI * 2;
    speed = speed || this.random(0.01, 5, 0.01);
    var star = new Star(this.random(0, this.canvasSize[0]), this.random(0, this.canvasSize[1]), this, dir, speed, color);
    this.stars[this.stars.length] = star;
    return star;
  },
  playerCrashedHandler: function () {
    document.querySelector(".game-overlay").classList.remove("closed");
    document.querySelector(".game-overlay").classList.remove("hidden");
    document.querySelector("#again-button").focus();
  }
};

var game = null;

window.addEventListener('load', function () {
  game = new Game();
//  game.drawAsteroids = false;
  game.asteroidsCount = 15;
  game.starsCount = 100;
  game.init();
  logger = document.getElementById("log");
});
