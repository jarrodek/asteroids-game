import { Game, GameEvents } from "./Game.js";

// const init: GameInit = {
//   canvas: document.getElementById('game') as HTMLCanvasElement,
//   startButton: document.querySelector("#begin-button") as HTMLElement,
//   resetButton: document.querySelector("#again-button") as HTMLElement,
//   gameOverlay: document.querySelector(".game-overlay") as HTMLElement,
// }

// const game = new Game(init);
// //  game.drawAsteroids = false;
// game.asteroidsCount = 15;
// game.starsCount = 100;
// game.init();

// window.addEventListener('resize', () => {
//   game.resize();
// });

enum GameState {
  Initializing,
  Initialized,
  Staring,
  Started,
  Ending,
}

/**
 * Is responsible for handling user events and controlling the game.
 */
class World {
  get startButton(): HTMLElement {
    return this.$('#begin-button');
  }

  get retryButton(): HTMLElement {
    return this.$('#again-button');
  }

  get overlay(): HTMLElement {
    return this.$('.game-overlay');
  }

  get canvas(): HTMLCanvasElement {
    return this.$('#game') as HTMLCanvasElement;
  }

  game: Game;

  state = GameState.Initializing;

  constructor() {
    const { canvas } = this;
    this.game = new Game({ canvas });
  }

  async initializeGame(): Promise<void> {
    const { startButton, retryButton, overlay, game } = this;
    startButton.addEventListener('click', this.startGame.bind(this));
    retryButton.addEventListener('click', this.retryGame.bind(this));
    overlay.addEventListener('transitionend', this.handleOverlayTransitionEnd.bind(this));
    window.addEventListener('resize', this.resizeHandler.bind(this));
    document.body.addEventListener('keyup', this.handleKeyUp.bind(this), true);
    document.body.addEventListener('keydown', this.handleKeyDown.bind(this), true);
    game.addEventListener(GameEvents.Crash, this.handlePlayerCrash.bind(this))
    game.asteroidsCount = 5;
    game.starsCount = 40;
    // game.drawAsteroids = false;
    await game.init();
    this.state = GameState.Initialized;
  }

  startGame(): void {
    this.state = GameState.Staring;
    this.overlay.classList.add('hidden');
  }

  retryGame(): void {
    this.game.reset();
    this.startGame();
  }

  resizeHandler(): void {
    this.game.resize();
  }

  handleOverlayTransitionEnd(e: TransitionEvent): void {
    const { propertyName } = e;
    if (propertyName !== 'opacity') {
      return;
    }
    if (this.state === GameState.Staring) {
      this.continueStartGame();
    } else if (this.state === GameState.Ending) {
      this.continueEndGame();
    }
  }

  private continueStartGame(): void {
    const { startButton, retryButton, overlay } = this;
    overlay.classList.add("closed");
    startButton.classList.add('closed');
    retryButton.classList.remove('closed');
    this.game.start();
    this.state = GameState.Started;
  }

  private continueEndGame(): void {
    this.state = GameState.Initialized;
  }

  protected handlePlayerCrash(): void {
    const { overlay, retryButton } = this;
    this.state = GameState.Ending;
    overlay.classList.remove('closed');
    setTimeout(() => {
      overlay.classList.remove('hidden');
      retryButton.focus();
    });
  }

  $(selector: string): HTMLElement {
    const elm = document.querySelector(selector) as HTMLElement | null;
    if (!elm) {
      throw new Error(`The "${selector}" is not in the DOM.`);
    }
    return elm;
  }

  handleKeyDown(e: KeyboardEvent): void {
    this.game.handleKeyDown(e);
  }

  handleKeyUp(e: KeyboardEvent): void {
    this.game.handleKeyUp(e);
  }
}

const stage = new World();
stage.initializeGame();
window.game = stage.game;

declare global {
  interface Window {
    game: Game;
  }
}
