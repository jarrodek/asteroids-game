import type { Game } from "./Game.js";
import { GameObject } from "./GameObject.js";
import { random } from "./Math.js";
import { Vector } from "./lib/Vector.js";

export const Kind = 'Star';

export class Star extends GameObject {
  kind = Kind;

  /**
   * A star in the background.
   *
   * @param The vector of the object's center
   * @param game Reference to the game object.
   * @param angle Direction of the star.
   * @param velocity The speed of the star.
   * @param color Color of the star.
   */
  constructor(game: Game, center: Vector, public angle: number, public velocity = 0.3, public color = '#fff') {
    const r = (Math.floor(Math.random() * 4) + 2);
    super(game, center, r);
  }

  override draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.translate(this.center.x, this.center.y);
    ctx.beginPath();
    ctx.moveTo(this.radius, 0);
    for (let i = 0; i < 9; i++) {
      ctx.rotate(Math.PI / 5);
      if (i % 2 === 0) {
        ctx.lineTo((this.radius / 0.525731) * 0.200811, 0);
      } else {
        ctx.lineTo(this.radius, 0);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  override step(): void {
    if (!this.isFullyInWorld()) {
      this.game.removeObject(this);
      requestAnimationFrame(() => this.reAdd());
      return;
    }
    this.center.move(this.angle, this.velocity);
  }

  reAdd(): void {
    const dir = this.angle * random(1, 360);
    this.game.appendRandomStar(dir);
  }
}
