import { Asteroid } from "./Asteroid.js";
import { Bullet } from "./Bullet.js";
import { GameObject } from "./GameObject.js";
import { Keys } from "./Keyboard.js";
import { toAbsDegrees } from "./Math.js";
import type { Game } from "./Game.js";
import { Vector } from "./lib/Vector.js";

export const Kind = 'Player';

export class Player extends GameObject {
  kind = Kind;

  moveTop = false;

  moveRight = false;

  moveBottom = false;

  moveLeft = false;

  fire = false;

  lastFireTime = 0;

  fireInterval = 200;

  crashed = false;

  outOfBoundsY = false;

  outOfBoundsX = false;

  outOfBounds = false;

  /**
   * Gun position relative to the center of scheme
   */
  gunPositionRelative = 15;

  /**
   * A depression angle in radians.
   */
  angle = 0;

  /**
   * How fast the player turns left-right
   */
  angleSpeed = 75;

  /**
   * The velocity of the player.
   */
  velocity = 0;

  cacheIsTop?: number;

  cacheIsBottom?: number;

  cacheIsLeft?: number;

  cacheIsRight?: number;

  cacheCenter?: number;

  constructor(game: Game, center: Vector) {
    super(game, center, 18);
  }

  /**
   * Refreshes the Player state. 
   * This function to be called from the main loop.
   * 
   * @param keysPressed An array of all pressed keys.
   */
  loopEvent(keysPressed: string[]): void {
    if (keysPressed.indexOf(Keys.UP) !== -1) {
      this.moveTop = true;
    } else {
      this.moveTop = false;
    }

    if (keysPressed.indexOf(Keys.DOWN) !== -1) {
      this.moveBottom = true;
    } else {
      this.moveBottom = false;
    }

    if (keysPressed.indexOf(Keys.LEFT) !== -1) {
      this.moveLeft = true;
    } else {
      this.moveLeft = false;
    }

    if (keysPressed.indexOf(Keys.RIGHT) !== -1) {
      this.moveRight = true;
    } else {
      this.moveRight = false;
    }

    if (keysPressed.indexOf(Keys.SPACE) !== -1) {
      this.fire = true;
    } else {
      this.fire = false;
    }
  }

  clearLoopCache(): void {
    this.cacheIsTop = undefined;
    this.cacheIsBottom = undefined;
    this.cacheIsLeft = undefined;
    this.cacheIsRight = undefined;
    this.cacheCenter = undefined;
  }

  isTop(): boolean {
    if (this.cacheIsTop === undefined) {
      this.cacheIsTop = toAbsDegrees(this.angle);
    }
    return (this.cacheIsTop > 270 || this.cacheIsTop < 90);
  }

  isBottom(): boolean {
    if (this.cacheIsBottom === undefined) {
      this.cacheIsBottom = toAbsDegrees(this.angle);
    }
    return (this.cacheIsBottom < 270 && this.cacheIsBottom > 90);
  }

  isRight(): boolean {
    if (this.cacheIsRight === undefined) {
      this.cacheIsRight = toAbsDegrees(this.angle);
    }
    return (this.cacheIsRight > 0 && this.cacheIsRight < 180);
  }

  isLeft(): boolean {
    if (this.cacheIsLeft === undefined) {
      this.cacheIsLeft = toAbsDegrees(this.angle);
    }
    return (this.cacheIsLeft > 180 && this.cacheIsLeft < 360);
  }

  override step(): void {
    if (this.crashed) {
      return;
    }
    this.clearLoopCache();

    const { game, angleSpeed } = this;

    let a = -0.08;
    if (this.moveTop) {
      a = 0.3;
    } else if (this.moveBottom) {
      a = -0.15;
    }

    if (this.moveLeft) {
      this.angle -= Math.PI / angleSpeed;
    } else if (this.moveRight) {
      this.angle += Math.PI / angleSpeed;
    }

    this.velocity += a;
    if (this.velocity < 0) {
      this.velocity = 0;
    }
    if (this.velocity > 10) {
      this.velocity = 10;
    }
    this.center.move(this.angle - Math.PI / 2, this.velocity);

    const newX = this.center.x;
    const newY = this.center.y;

    let yPlayer = null;
    let xPlayer = null;

    // Drawing crossing over the canvas on the Y axis
    if (!this.outOfBoundsY && !this.outOfBoundsX && newY < 25) { // create new player object in the bottom of canvas
      yPlayer = new Player(this.game, new Vector(newX, game.canvasSize[1] + newY));
      yPlayer.velocity = this.velocity;
      yPlayer.angle = this.angle;
      yPlayer.lastFireTime = this.lastFireTime;
      yPlayer.outOfBoundsY = true;
      this.game.appendObject(yPlayer);
      this.outOfBoundsY = true;
    } else if (this.outOfBoundsY && this.isTop() && newY < -20) {
      this.game.removePlayer(this);
    } else if (!this.outOfBoundsY && !this.outOfBoundsX && newY > game.canvasSize[1] - 20) {
      yPlayer = new Player(this.game, new Vector(newX, -(game.canvasSize[1] - newY)));
      yPlayer.velocity = this.velocity;
      yPlayer.angle = this.angle;
      yPlayer.lastFireTime = this.lastFireTime;
      yPlayer.outOfBoundsY = true;
      this.game.appendObject(yPlayer);
      this.outOfBoundsY = true;
    } else if (this.outOfBoundsY && this.isBottom() && newY > game.canvasSize[1] + 20) {
      this.game.removePlayer(this);
    } else if (this.outOfBoundsY) {
      // The object is entire on the board - remove the flag.
      if (this.isTop() && newY > 40 && newY < game.canvasSize[1] - 20) {
        this.outOfBoundsY = false;
      } else if (this.isBottom() && newY < game.canvasSize[1] - 20 && newY > 25) {
        this.outOfBoundsY = false;
      }
    }
    // Drawing crossing over the canvas on the X axis
    if (!this.outOfBoundsX && !this.outOfBoundsY && newX < 20) {
      xPlayer = new Player(this.game, new Vector(game.canvasSize[0] + newX, newY));
      xPlayer.velocity = this.velocity;
      xPlayer.angle = this.angle;
      xPlayer.lastFireTime = this.lastFireTime;
      xPlayer.outOfBoundsX = true;
      this.game.appendObject(xPlayer);
      this.outOfBoundsX = true;
    } else if (this.outOfBoundsX && this.isLeft() && newX < -20) {
      this.game.removePlayer(this);
    } else if (!this.outOfBoundsX && !this.outOfBoundsY && newX > game.canvasSize[0] - 20) {
      xPlayer = new Player(this.game, new Vector(-(game.canvasSize[0] - newX), newY));
      xPlayer.velocity = this.velocity;
      xPlayer.angle = this.angle;
      xPlayer.lastFireTime = this.lastFireTime;
      xPlayer.outOfBoundsX = true;
      this.game.appendObject(xPlayer);
      this.outOfBoundsX = true;
    } else if (this.outOfBoundsX && this.isRight() && newX > game.canvasSize[0] + 20) {
      this.game.removePlayer(this);
    } else if (this.outOfBoundsX) {
      if (this.isLeft() && newX > 40 && newX < game.canvasSize[0] - 20) {
        this.outOfBoundsX = false;
      } else if (this.isRight() && newX < game.canvasSize[0] - 20 && newX > 25) {
        this.outOfBoundsX = false;
      }
    }
    const crashObj = this.game.collidesWithAsteroid(this);
    if (crashObj) {
      this.crashed = true;
      if (crashObj instanceof Asteroid) {
        crashObj.divide();
      }
      this.game.playerCrashedHandler();
      return;
    }

    if ( /*! this.outOfBoundsY && !this.outOfBoundsY && */ this.fire) {
      const now = new Date().getTime();
      if (this.lastFireTime !== 0 && (now - this.lastFireTime) < this.fireInterval) {
        return;
      }
      this.lastFireTime = now;

      const posX = (this.gunPositionRelative * Math.cos(this.angle - Math.PI / 2) + this.center.x);
      const posY = (this.gunPositionRelative * Math.sin(this.angle - Math.PI / 2) + this.center.y);
      const bullet = new Bullet(this.game, new Vector(posX, posY), this.angle - Math.PI / 2);
      this.game.appendObject(bullet);
    }
  }

  override draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(this.angle);

    const left = new Path2D();
    left.moveTo(0, 20);
    left.lineTo(-10, 20);
    left.lineTo(-20, 0);
    left.lineTo(0, -40);
    left.closePath();

    ctx.fillStyle = "#bebebe";
    ctx.fill(left, "evenodd");

    const right = new Path2D();
    right.moveTo(0, 20);
    right.lineTo(10, 20);
    right.lineTo(20, 0);
    right.lineTo(0, -40);
    right.closePath();
    ctx.fillStyle = "#909090";
    ctx.fill(right, "evenodd");

    const booster = new Path2D();
    booster.moveTo(-10, 20);
    booster.lineTo(-10, 30);
    booster.lineTo(10, 30);
    booster.lineTo(10, 20);
    booster.closePath();
    ctx.fillStyle = "#676767";
    ctx.fill(booster, "evenodd");
    // this.renderRadius(ctx);
    ctx.restore();
  }

  renderRadius(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = "#D40000";
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI, true);
    ctx.stroke();
  }

  // override draw(ctx: CanvasRenderingContext2D): void {
  //   ctx.save();
  //   ctx.translate(this.center.x, this.center.y);
  //   ctx.rotate(this.angle);

  //   const color = this.crashed ? 'red' : '#fff';

  //   const left = new Path2D();

  //   // shape
  //   ctx.beginPath();
  //   ctx.fillStyle = color;
  //   //    ctx.strokeStyle = "#D40000";
  //   //    ctx.fillStyle = '#fff';
  //   ctx.shadowOffsetX = 2;
  //   ctx.shadowOffsetY = 2;
  //   ctx.shadowBlur = 2;
  //   ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  //   ctx.moveTo(0, -20);
  //   ctx.lineTo(-20, 20);
  //   ctx.lineTo(20, 20);
  //   ctx.fill();

  //   // gun
  //   // this.ctx.save();
  //   ctx.fillStyle = '#c00';
  //   ctx.shadowOffsetX = 0;
  //   ctx.shadowOffsetY = 0;
  //   ctx.shadowBlur = 0;
  //   ctx.fillRect(-1, -15, 2, -8);


  //   // this.ctx.restore();

  //   //    ctx.fillStyle = '#000000';
  //   //    if( this.isRight() ){
  //   //        ctx.fillText('right',-9,15);
  //   //    } else if( this.isLeft() ) {
  //   //        ctx.fillText('left',-9,15);
  //   //    }


  //   ctx.restore();
  //   ctx.save();
  //   ctx.translate(this.center.x, this.center.y);
  //   ctx.strokeStyle = "#D40000";
  //   //  ctx.fillStyle = '#fff';
  //   ctx.beginPath();
  //   ctx.arc(0, 0, this.radius, 0, 2 * Math.PI, true);
  //   ctx.stroke();
  //   ctx.restore();
  // }
}
