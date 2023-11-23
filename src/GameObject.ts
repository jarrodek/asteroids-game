import type { Game } from "./Game.js";
import { Vector } from "./lib/Vector.js";

/**
 * A basic game object.
 * 
 * Game objects like player, asteroids and bullets should inherit from this object.
 */
export abstract class GameObject {
  abstract readonly kind: string;

  /**
   * @param The vector of the object's center.
   * @param radius The radius of the object.
   * @param game Reference to the game object.
   */
  constructor(public game: Game, public center: Vector, public radius: number) {
    // nothing.
  }

  /**
   * Renders the current state of the object.
   * 
   * This is a lifecycle method that is called when the object is ready to be rendered.
   * 
   * @param ctx The canvas context
   */
  abstract draw(ctx: CanvasRenderingContext2D): void;

  /**
   * This is a lifecycle method that is called before the object should be rendered.
   * 
   * The step function calculates the changes to the object state. 
   * Each object in the stage performs a step before rendering.
   */
  abstract step(): void;

  /**
   * Test if GameObject obj is within the bounds of the world.
   *
   * @param obj The GameObject to be tested. Default to self.
   */
  isInWorld(obj: GameObject = this): boolean {
    const { game } = this;

    // check between left and right
    //          |   (radius)    | -> true
    //          (rad | ius)     | -> true
    //          |          (rad | ius) -> true
    //          |               | (radius) -> false
    // (radius) |               | -> false

    const { center, radius } = obj;
    if (center.x + radius < 0) {
      return false; // fully outside the left border
    }
    if (center.x - radius > game.canvasSize[0]) {
      return false; // fully outside the right border
    }

    // check between top and bottom
    if (center.y + radius < 0) {
      return false; // fully outside the top border
    }
    if (center.y - radius > game.canvasSize[1]) {
      return false; // fully outside the bottom border
    }

    return true;
  }

  /**
   * Similar to `isInWorld()` but the obj must be completely inside the board.
   *
   * @param obj Object to be tested. If not set it is default to this object.
   */
  isFullyInWorld(obj: GameObject = this): boolean {
    const { game } = this;
    // check the X-axis
    if (obj.center.x < 0) return false; // axis start
    if (obj.center.x + obj.radius > game.canvasSize[0]) return false; // axis end
    // check the Y-axis
    if (obj.center.y < 0) return false; // axis start
    if (obj.center.y + obj.radius > game.canvasSize[1]) return false; // axis end

    return true;
  }
}
