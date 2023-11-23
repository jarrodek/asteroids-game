import { GameObject } from "./GameObject.js";
import type { Game } from "./Game.js";
import { Vector } from "./lib/Vector.js";

export const Kind = 'Bullet';

export class Bullet extends GameObject {
  kind = Kind;

  /**
   * Bullet's velocity.
   */
  velocity = 15;

  /**
   * The lifetime of the bullet
   */
  lifeTime = 50;

  /**
   * A bullet launched by the player.
   *
   * @param The vector of the object's center
   * @param game Reference to the game object.
   * @param angle Direction of the bullet in rad.
   */
  constructor(game: Game, center: Vector, public angle: number) {
    super(game, center, 5);
  }

  override draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.center.x, this.center.y);
    if (this.lifeTime >= 10) {
      ctx.fillStyle = 'rgba(255,255,255,1)';
    } else {
      ctx.fillStyle = `rgba(255,255,255,0.${this.lifeTime})`;
    }
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 2;
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.moveTo(0, 0);
    ctx.fillRect(0, 0, 3, 3);

    ctx.restore();
  }

  override step(): void {
    this.lifeTime--;
    this.center.move(this.angle, this.velocity);
    const asteroid = this.game.collidesWithAsteroid(this);
    if (asteroid) {
      this.lifeTime = 0;
      asteroid.divide();
    }
  }
}
