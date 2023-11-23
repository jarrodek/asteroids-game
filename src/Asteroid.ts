import { GameObject } from "./GameObject.js";
import { toAbsDegrees, toDegrees, toRadians } from "./Math.js";
import type { Game } from "./Game.js";
import { Vector } from "./lib/Vector.js";

export const Kind = 'Asteroid';

export class Asteroid extends GameObject {
  kind = Kind;

  /**
   * Asteroid's minimum radius.
   * This is used to calculate whether the asteroid should 
   * be divided into smaller parts or removed from the scene.
   */
  minR = 18;

  /**
   * A flag describing whether the asteroid is out-of-bounds
   * of the canvas in the y-axis.
   */
  outOfBoundsY = false;

  /**
   * A flag describing whether the asteroid is out-of-bounds
   * of the canvas in the x-axis.
   */
  outOfBoundsX = false;

  isTop: boolean;

  isRight: boolean;

  isBottom: boolean;

  isLeft: boolean;

  image: HTMLImageElement;

  wasInWorld = false;

  debug = {
    worldCenter: false,
    debugLabel: false,
  };

  /**
   * @param center The vector of the object's center
   * @param game A reference to the game object.
   * @param r The radius of the asteroid
   * @param v The velocity of the asteroid.
   * @param angle The asteroid's angle, in radians.
   * @param image An image to be used
   */
  constructor(game: Game, center: Vector, r: number, public v: number, public angle: number, image: HTMLImageElement) {
    super(game, center, r);

    const degree = toAbsDegrees(angle);
    this.isTop = (degree > 180 && degree < 360);
    this.isRight = (degree > 270 || degree < 90);
    this.isBottom = (degree > 0 && degree < 180);
    this.isLeft = (degree < 270 && degree > 90);

    this.image = image;
  }

  override draw(ctx: CanvasRenderingContext2D): void {
    if (!this.image) {
      return;
    }

    ctx.save();
    ctx.drawImage(this.image, this.center.x - this.radius, this.center.y - this.radius, this.radius * 2, this.radius * 2);
    // ctx.translate(this.center.x, this.center.y);
    // ctx.fillText(`${this.r}`, 0, 0);
    // ctx.strokeStyle = "#D40000";
    //  ctx.fillStyle = '#fff';
    // ctx.beginPath();
    // ctx.arc(0, 0, this.r, 0, 2 * Math.PI, true);
    // ctx.stroke();
    //  ctx.fill();
    ctx.restore();

    if (this.debug.worldCenter) {
      this.drawDebugWorldCenter(ctx);
    }

  }

  drawDebugWorldCenter(ctx: CanvasRenderingContext2D): void {
    const { center, game } = this;
    const cx = game.canvasSize[0] / 2;
    const cy = game.canvasSize[1] / 2;
    ctx.moveTo(cx, cy);
    ctx.lineTo(center.x, center.y);
    ctx.strokeStyle = "#D40000";
    ctx.stroke();
    
    if (this.debug.debugLabel) {
      const p1 = new Vector(cx, cy);
      const p2 = center.clone();
      this.drawDebugLabel(ctx, p1, p2);
    }
  }

  drawDebugLabel(ctx: CanvasRenderingContext2D, p1: Vector, p2: Vector): void {
    const d = this.center.distanceTo(p1);
    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;
    // Keep text upright
    let angle = Math.atan2(dy, dx);
    if (angle < -Math.PI / 2 || angle > Math.PI / 2) {
      const p = p1;
      // eslint-disable-next-line no-param-reassign
      p1 = p2;
      // eslint-disable-next-line no-param-reassign
      p2 = p;
      dx *= -1;
      dy *= -1;
      angle -= Math.PI;
    }

    const p = p1;
    const pad = 1 / 2;
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = 'center';
    ctx.font = "normal 16px verdana, sans-serif ";
    ctx.translate(p.x + dx * pad, p.y + dy * pad);
    ctx.rotate(angle);
    let angleDegrees = Math.round(toDegrees(this.angle)) + 90;
    if (angleDegrees > 360) {
      angleDegrees -= 360;
    }
    if (angleDegrees < 0) {
      angleDegrees = 360 + angleDegrees;
    }
    const txt = `d: ${d}dp, a: ${angleDegrees}`; // , in world: ${this.wasInWorld}
    ctx.fillText(txt, 0, 0);

    ctx.restore();
  }

  override step(): void {
    // const a = -0.00005;
    // this.v += a;
    this.v = Math.abs(this.v);

    if (this.v > 10) {
      this.v = 10;
    }
    const { game } = this;
    this.center.move(this.angle, this.v);

    const inWorld = this.isInWorld();
    
    if (!inWorld && this.wasInWorld) {
      game.removeObject(this);
      const asteroid = game.createAsteroid();
      asteroid.step();
      game.appendObject(asteroid);
    } else if (inWorld && !this.wasInWorld) {
      this.wasInWorld = true;
    }    
    
    // const newY = this.center.y;
    // const newX = this.center.x;
    // const padding = this.radius;

    // const boundsX = ((newX < padding) || (newX > game.canvasSize[0] - padding));
    // const boundsY = ((newY < padding) || (newY > game.canvasSize[1] - padding));

    // if (boundsX && boundsY) {
    //   if (!this.outOfBoundsY && !this.outOfBoundsX) {
    //     let _nx = 0;
    //     let _ny = 0;

    //     if ((newX - padding) <= 0) {
    //       _nx = game.canvasSize[0] + newX;
    //     } else {
    //       _nx = newX - game.canvasSize[0];
    //     }

    //     if ((newY - padding) <= 0) {
    //       _ny = game.canvasSize[1] + newY;
    //     } else {
    //       _ny = newY - game.canvasSize[1];
    //     }

    //     let aXY = null;
    //     aXY = new Asteroid(this.game, new Vector(_nx, _ny), this.radius, this.v, this.angle, image);
    //     aXY.outOfBoundsY = true;
    //     aXY.outOfBoundsX = true;
    //     this.game.appendObject(aXY);
    //     this.outOfBoundsY = true;
    //     this.outOfBoundsX = true;
    //   } else if (!this.isFullyInWorld()) {
    //     game.removeObject(this);
    //   }
    // } else if (boundsY) {
    //   if (!this.outOfBoundsY && !this.outOfBoundsX) {
    //     let aY = null;
    //     if (newY > game.canvasSize[1] - padding) {
    //       aY = new Asteroid(this.game, new Vector(newX, -(game.canvasSize[1] - newY)), this.radius, this.v, this.angle, image);
    //       aY.outOfBoundsY = true;
    //       this.game.appendObject(aY);
    //       this.outOfBoundsY = true;
    //     } else {
    //       aY = new Asteroid(this.game, new Vector(newX, game.canvasSize[1] + newY), this.radius, this.v, this.angle, image);
    //       aY.outOfBoundsY = true;
    //       this.game.appendObject(aY);
    //       this.outOfBoundsY = true;
    //     }
    //   } else if (this.outOfBoundsY) {
    //     if ((this.isTop && newY < -padding) || (this.isBottom && newY > game.canvasSize[1] + padding)) {
    //       game.removeObject(this);
    //     } else if (this.isTop && newY > padding && newY < game.canvasSize[1] - padding) {
    //       this.outOfBoundsY = false;
    //     } else if (this.isBottom && newY < game.canvasSize[1] - padding && newY > padding) {
    //       this.outOfBoundsY = false;
    //     }
    //   }
    // } else if (boundsX) {
    //   if (!this.outOfBoundsY && !this.outOfBoundsX) {
    //     let aX = null;
    //     if (this.isLeft) {
    //       aX = new Asteroid(this.game, new Vector(game.canvasSize[0] + newX, newY), this.radius, this.v, this.angle, image);
    //     } else {
    //       aX = new Asteroid(this.game, new Vector(game.canvasSize[0] - newX, newY), this.radius, this.v, this.angle, image);
    //     }
    //     aX.outOfBoundsX = true;
    //     this.game.appendObject(aX);
    //     this.outOfBoundsX = true;
    //   } else if (this.outOfBoundsX) {
    //     if ((this.isLeft && newX < -20) || (this.isRight && newX > game.canvasSize[0] + padding)) {
    //       game.removeObject(this);
    //     } else if (this.isLeft && newX > padding && newX < game.canvasSize[0] - padding) {
    //       this.outOfBoundsX = false;
    //     } else if (this.isRight && newX < game.canvasSize[0] - padding && newX > padding) {
    //       this.outOfBoundsX = false;
    //     }
    //   }
    // } else {
    //   if (this.outOfBoundsY) {
    //     if (this.isTop && newY > padding && newY < game.canvasSize[1] - padding) {
    //       this.outOfBoundsY = false;
    //     } else if (this.isBottom && newY < game.canvasSize[1] - padding && newY > padding) {
    //       this.outOfBoundsY = false;
    //     }
    //   }
    //   if (this.outOfBoundsX) {
    //     if (this.isLeft && newX > padding && newX < game.canvasSize[0] - padding) {
    //       this.outOfBoundsX = false;
    //     } else if (this.isRight && newX < game.canvasSize[0] - padding && newX > padding) {
    //       this.outOfBoundsX = false;
    //     }
    //   }
    // }
  }

  divide(): void {
    const { image, game } = this;
    if (!image) {
      throw new Error(`Invalid state. The asteroid has no image.`);
    }

    if (this.radius <= this.minR) {
      game.removeObject(this);
      game.notifyAsteroidDestroyed();
      return;
    }

    const angle1 = toRadians(toDegrees(this.angle) - 30);
    const angle2 = -angle1;

    const asteroid1 = new Asteroid(this.game, this.center.clone(), this.radius / 2, this.v * 1.5, angle1, image);
    const asteroid2 = new Asteroid(this.game, this.center.clone(), this.radius / 2, this.v * 1.5, angle2, image);

    asteroid1.outOfBoundsY = this.outOfBoundsY;
    asteroid2.outOfBoundsY = this.outOfBoundsY;
    asteroid1.outOfBoundsX = this.outOfBoundsX;
    asteroid2.outOfBoundsX = this.outOfBoundsX;

    this.game.appendObject(asteroid1);
    this.game.appendObject(asteroid2);

    game.removeObject(this);
  }
}
