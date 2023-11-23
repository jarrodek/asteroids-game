import { loadAsteroids } from "./Assets.js";
import type { GameObject } from "./GameObject.js";
import { Asteroid, Kind as AsteroidKind } from "./Asteroid.js";
import { Bullet, Kind as BulletKind } from "./Bullet.js";
import { Player, Kind as PlayerKind } from "./Player.js";
import { Star, Kind as StarKind } from "./Star.js";
import { Keys } from "./Keyboard.js";
import { random, toRadians } from "./Math.js";
import { Vector } from "./lib/Vector.js";

export interface GameInit {
  /**
   * A reference to the canvas element.
   */
  canvas: HTMLCanvasElement;
}

export enum GameEvents {
  Crash = 'crash',
  AsteroidDestroyed = 'asteroiddestroyed',
}

/**
 * @fires crash - when the player crashed
 */
export class Game extends EventTarget {
  /**
   * Array with currently pressed keyboard keys
   */
  keysPressed: string[] = [];

  player: Player[] = [];

  bullets: Bullet[] = [];

  asteroids: Asteroid[] = [];

  stars: Star[] = [];

  drawAsteroids = true;

  drawStars = true;

  asteroidsCount = 5;

  starsCount = 55;

  /**
   * A reference to the game canvas HTML element.
   */
  gameCanvas: HTMLCanvasElement;

  context: CanvasRenderingContext2D;

  canvasSize = [0, 0];

  loopAnimation = false;

  /**
   * A flag determining that the game is paused.
   * When this is true then the player cannot move
   * and asteroids are inactive.
   */
  paused = true;

  asteroidImages: HTMLImageElement[] = [];

  constructor(gameInit: GameInit) {
    super();
    this.gameCanvas = gameInit.canvas;
    const ctx = gameInit.canvas.getContext('2d');
    if (!ctx) {
      throw new Error(`Run this code in the main thread.`);
    }
    this.context = ctx;
  }

  resize(): void {
    this.calculateSize();
    this.setCanvasSize();
  }

  async init(): Promise<void> {
    this.asteroidImages = await loadAsteroids();
    this.calculateSize();
    this.setCanvasSize();
    this.createStars();
    this.createPlayerObject();
    this.createAsteroids();
    this.startLoop();
  }

  reset(): void {
    this.player = [];
    this.bullets = [];
    this.asteroids = [];
    this.stars = [];

    this.createStars();
    this.createPlayerObject();
    this.createAsteroids();
  }

  start(): void {
    this.paused = false;
  }

  setCanvasSize(): void {
    this.gameCanvas.setAttribute('width', `${this.canvasSize[0]}`);
    this.gameCanvas.setAttribute('height', `${this.canvasSize[1]}`);
  }

  calculateSize(): void {
    this.canvasSize = [this.gameCanvas.clientWidth, this.gameCanvas.clientHeight];
  }

  /**
   * A function that handles the keyboard key up event.
   */
  handleKeyUp(e: KeyboardEvent): void {
    const { code } = e;
    if (Keys.codes.includes(code)) {
      e.preventDefault();
      const index = this.keysPressed.indexOf(code);
      if (index >= 0) {
        this.keysPressed.splice(index, 1);
      }
    }
  }

  /**
   * A function that handles the keyboard key down event.
   */
  handleKeyDown(e: KeyboardEvent): void {
    const { code } = e;
    
    if (code === Keys.P) {
      e.preventDefault();
      if (!this.loopAnimation) {
        this.startLoop();
      } else {
        this.stopLoop();
      }
      return;
    }
    
    if (Keys.codes.includes(code)) {
      e.preventDefault();
      if (!this.keysPressed.includes(code)) {
        this.keysPressed.push(code);
      }
    }
  }

  /**
   * Draws game's background.
   */
  createBackground(): void {
    const { context } = this;
    const linGrad = context.createLinearGradient(0, 0, 0, this.canvasSize[1]);
    linGrad.addColorStop(0, '#15003d');
    linGrad.addColorStop(1, '#001775');
    context.save();
    context.clearRect(0, 0, this.canvasSize[0], this.canvasSize[1]);
    context.fillStyle = linGrad;
    context.fillRect(0, 0, this.canvasSize[0], this.canvasSize[1]);
    context.restore();
  }

  /**
   * Draws stars in the background when configured.
   */
  createStars(): void {
    if (!this.drawStars || this.stars.length) {
      return;
    }
    const dir = 2 * Math.PI - Math.PI / 2;
    for (let i = 0, len = this.starsCount; i < len; i++) {
      const star = this.appendRandomStar(dir);
      star.draw(this.context);
    }
  }

  /**
   * Creates the Player object and adds it to the stage.
   */
  createPlayerObject(): void {
    if (this.player.length) {
      return;
    }
    const x = this.canvasSize[0] / 2 - 20; 
    const y = 3 * this.canvasSize[1] / 4;
    const p = new Player(this, new Vector(x, y));
    this.player = [p];
    p.draw(this.context);
  }

  startLoop(): void {
    this.loopAnimation = true;
    window.requestAnimationFrame(this.loop.bind(this));
  }

  stopLoop(): void {
    this.loopAnimation = false;
  }

  /**
   * The game's main loop function. It is responsible
   * for calculating changes in each object and then
   * drawing object on the canvas.
   */
  loop(): void {
    const { paused, context: ctx } = this;
    
    this.createBackground();

    this.stars.forEach((star) => {
      star.step();
      star.draw(ctx);
    });

    if (!paused) {
      this.player.forEach((playerObj) => {
        playerObj.loopEvent(this.keysPressed);
        playerObj.step();
      });

      this.bullets.forEach((bullet) => {
        bullet.step();
      });

      for (const asteroid of this.asteroids) {
        asteroid.step();
        // if (!asteroid.isInWorld()) {
        //   this.removeAsteroid(asteroid);
        // }
      }
  
      this.bullets.forEach((bullet) => {
        if (bullet.lifeTime <= 0) {
          this.removeBullet(bullet);
        }
      });
    }

    this.player.forEach((playerObj) => {
      playerObj.draw(ctx);
    });

    this.bullets.forEach((bullet) => {
      bullet.draw(ctx);
    });

    this.asteroids.forEach((asteroid) => {
      asteroid.draw(ctx);
    });

    this.drawStats(ctx);

    if (this.loopAnimation) {
      window.requestAnimationFrame(this.loop.bind(this));
    }
  }

  drawStats(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(20, 20);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Asteroids: ${this.asteroids.length}`, 0, 0);
    ctx.translate(0, 14);
    ctx.fillText(`Stars: ${this.stars.length}`, 0, 0);
    ctx.translate(0, 14);
    ctx.fillText(`Bullets: ${this.bullets.length}`, 0, 0);
    ctx.translate(0, 14);
    ctx.fillText(`Players: ${this.player.length}`, 0, 0);
    ctx.restore();
  }

  createAsteroids(): void {
    if (!this.drawAsteroids || this.asteroids.length) {
      return;
    }

    for (let i = 0, len = this.asteroidsCount; i < len; i++) {
      const asteroid = this.createAsteroid();
      asteroid.draw(this.context);
      this.appendObject(asteroid);
    }
  }

  createAsteroid(): Asteroid {
    const { canvasSize } = this;

    const outOfBoundsPadding = 100;
    const degreePadding = 10;
    const definitions = [
      // from left
      {
        x: [-outOfBoundsPadding, 0],
        y: [0, canvasSize[1]],
        a: [-90 + degreePadding, 90 - degreePadding],
      },
      // from right
      {
        x: [canvasSize[0], canvasSize[0] + outOfBoundsPadding],
        y: [0, canvasSize[1]],
        a: [90 + degreePadding, 270 - degreePadding],
      },
      // from top
      {
        x: [0, canvasSize[0]],
        y: [-outOfBoundsPadding, 0],
        a: [0 + degreePadding, 180 - degreePadding],
      },
      // from bottom
      {
        x: [0, canvasSize[0]],
        y: [canvasSize[1], canvasSize[1] + outOfBoundsPadding],
        a: [180 + degreePadding, 360 - degreePadding],
      },
    ];

    const index = random(0, definitions.length - 1);
    const definition = definitions[index];
    const image = this.asteroidImages[random(0, this.asteroidImages.length - 1)];
    const r = random(10, 50);
    const x = random(definition.x[0], definition.x[1]);
    const y = random(definition.y[0], definition.y[1]);
    let a = random(definition.a[0], definition.a[1]);
    if (a < 0) {
      a = 360 + a;
    }
    const angle = toRadians(a);
    let v = Math.random() * 1.8;
    if (v < 0.3) {
      v = 0.3;
    }
    const asteroid = new Asteroid(this, new Vector(x, y), r, v, angle, image);
    return asteroid;
  }

  // createAsteroid(): Asteroid {
  //   let asteroid: Asteroid | undefined;
  //   do {
  //     const image = this.asteroidImages[random(0, this.asteroidImages.length - 1)];
  //     const r = random(10, 50);
  //     const x = random(0, this.canvasSize[0]);
  //     const y = random(0, this.canvasSize[1]);
  //     // const x = 800 - Math.floor(Math.random() * this.canvasSize[0]);
  //     // const y = 400 - Math.floor(Math.random() * this.canvasSize[1]);
  //     const angle = random(1, 360) * (Math.PI / 180);
  //     let v = Math.random() * 1.8;
  //     if (v < 0.3) {
  //       v = 0.3;
  //     }
  //     asteroid = new Asteroid(this, new Vector(x, y), r, v, angle, image);
  //     if (this.collidesWithPlayer(asteroid, 800)) {
  //       asteroid = undefined
  //       continue;
  //     }
  //     // if (this.isCollision(asteroid, true, 100) !== false) {
  //     //   asteroid = undefined
  //     //   continue;
  //     // }
  //   } while (!asteroid);
  //   return asteroid;
  // }

  /**
   * Checks whether the passed object collides with an asteroid
   * 
   * @param obj The object to test for collision with an asteroid
   * @param addPadding When set it adds padding to the obj radius.
   * @returns The Asteroid the `obj` collided with or null if no collision is detected.
   */
  collidesWithAsteroid(obj: GameObject, addPadding = 0): Asteroid | null {
    const collided = this.asteroids.find((ast) => {
      if (ast === obj) {
        return false;
      }
      const radius = ast.radius + addPadding;
      if (ast.center.inCircumference(obj.center, radius)) {
        return true;
      }
      return false;
    });
    return collided || null;
  }

  /**
   * Checks whether the passed object collides with the player.
   * 
   * @param obj The game object to test
   * @param addPadding When set it adds padding to the obj radius.
   * @returns The Player the `obj` collided with or null if no collision is detected.
   */
  collidesWithPlayer(obj: GameObject, addPadding = 0): Player | null {
    const collided = this.player.find((player) => {
      const radius = obj.radius + addPadding;
      if (obj.center.inCircumference(player.center, radius)) {
        return true;
      }
      return false;
    });
    return collided || null;
  }

  // /**
  //  * Checks if the `GameObject` is in collision with another `GameObject`.
  //  *
  //  * The game assumes all objects are round. It will only check if the vector 
  //  * created from centers of both objects is less than sum of their radiuses.
  //  *
  //  * There is a great article about objects overlapping:
  //  * http://www.dyn4j.org/2010/01/sat/
  //  *
  //  * @param obj Checked GameObject
  //  * @param checkPlayer true if should check collision state with Player. Should be set to false if {obj} is a Player.
  //  * @param addPadding Add padding to obj radius.
  //  * @returns Returns GameObject which is in the collision with obj or false if is not in collision.
  //  * TODO: rewrite to `null`
  //  */
  // isCollision(obj: GameObject, checkPlayer: boolean, addPadding = 0): boolean | GameObject {
  //   let oR = obj.radius;
  //   oR += addPadding;

  //   // is collision with player?
  //   if (checkPlayer) {
  //     const pcnt = this.player.length;
  //     for (let j = 0; j < pcnt; j++) {
  //       const player = this.player[j];
  //       if (obj.center.inCircumference(player.center, player.radius + oR)) {
  //         return player;
  //       }
  //     }
  //   }

  //   // with asteroid
  //   const cnt = this.asteroids.length;
  //   for (let i = 0; i < cnt; i++) {
  //     const ast = this.asteroids[i];
  //     if (ast === obj) {
  //       continue;
  //     }
  //     if (obj.center.inCircumference(ast.center, ast.radius + oR)) {
  //       return ast;
  //     }
  //   }

  //   return false;
  // }

  /**
   * Remove a player from the game.
   * @param player The Player object to be removed.
   */
  removePlayer(player: Player): void {
    this.removeObject(player);
  }

  /**
   * Remove bullet from the game.
   * @param bullet A Bullet object to be removed.
   */
  removeBullet(bullet: Bullet): void {
    this.removeObject(bullet);
  }

  /**
   * Remove asteroid from the game.
   * @param asteroid An Asteroid object to be removed.
   */
  removeAsteroid(asteroid: Asteroid): void {
    this.removeObject(asteroid);
  }

  removeStar(star: Star): void {
    this.removeObject(star);
  }

  /**
   * Remove a GameObject from the board.
   * @param obj GameObject to be removed.
   */
  removeObject(obj: GameObject): void {
    let arr: GameObject[] | undefined;
    switch (obj.kind) {
      case PlayerKind: arr = this.player; break;
      case BulletKind: arr = this.bullets; break;
      case AsteroidKind: arr = this.asteroids; break;
      case StarKind: arr = this.stars; break;
      default:
        throw new Error(`Unknown object to remove: ${obj.kind}`);
    }
    const index = arr.indexOf(obj);
    if (index !== -1) {
      arr.splice(index, 1);
    }
  }

  /**
   * Append new GameObject to it's corresponding objects array.
   * @param obj A GameObject to be appended to the array.
   */
  appendObject(obj: GameObject): void {
    switch (obj.kind) {
      case PlayerKind: this.player.push(obj as Player); break;
      case BulletKind: this.bullets.push(obj as Bullet); break;
      case AsteroidKind: this.asteroids.push(obj as Asteroid); break;
      case StarKind: this.stars.push(obj as Star); break;
      default:
        throw new Error(`Unknown object to add: ${obj.kind}`);
    }
  }

  appendRandomStar(dir = Math.PI * 2, speed = random(0.01, 5, 0.01)): Star {
    const starsColors = ['#ededed', '#a3c5ff', '#fff8a6', '#ffb0a6'];
    const color = starsColors[random(0, starsColors.length - 1)];
    const x = random(0, this.canvasSize[0]);
    const y = random(0, this.canvasSize[1]);
    const star = new Star(this, new Vector(x, y) , dir, speed, color);
    this.stars[this.stars.length] = star;
    return star;
  }

  playerCrashedHandler(): void {
    this.dispatchEvent(new Event(GameEvents.Crash));
  }

  notifyAsteroidDestroyed(): void {
    this.dispatchEvent(new Event(GameEvents.AsteroidDestroyed));
  }
}
