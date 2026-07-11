import { KEYS, DIRECTIONS } from './constants.js';

export class Input {
  constructor() {
    this._keysPressed = new Set();
    this._shootPressed = false;
    this._shootConsumed = false;
    this._restartPressed = false;
    this._handlers = null;
    this._lastDirection = DIRECTIONS.NONE;
  }

  init() {
    this._onKeyDown = (e) => {
      this._keysPressed.add(e.code);

      if (e.code === KEYS.SPACE) {
        this._shootPressed = true;
        this._shootConsumed = false;
      }

      if (e.code === KEYS.ENTER) {
        this._restartPressed = true;
      }

      // Prevent default for game keys
      if ([
        KEYS.ARROW_UP, KEYS.ARROW_DOWN, KEYS.ARROW_LEFT, KEYS.ARROW_RIGHT,
        KEYS.W, KEYS.S, KEYS.A, KEYS.D, KEYS.SPACE, KEYS.ENTER,
      ].includes(e.code)) {
        e.preventDefault();
      }
    };

    this._onKeyUp = (e) => {
      this._keysPressed.delete(e.code);
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  destroy() {
    if (this._onKeyDown) {
      window.removeEventListener('keydown', this._onKeyDown);
    }
    if (this._onKeyUp) {
      window.removeEventListener('keyup', this._onKeyUp);
    }
  }

  getDirection() {
    const keys = this._keysPressed;

    // Priority: last pressed direction wins (we check WASD then ARROWS)
    // Arrow keys take priority for last-pressed behavior
    // We return the direction based on which keys are currently pressed

    if (keys.has(KEYS.W) || keys.has(KEYS.ARROW_UP)) {
      this._lastDirection = DIRECTIONS.UP;
      return { ...DIRECTIONS.UP };
    }
    if (keys.has(KEYS.S) || keys.has(KEYS.ARROW_DOWN)) {
      this._lastDirection = DIRECTIONS.DOWN;
      return { ...DIRECTIONS.DOWN };
    }
    if (keys.has(KEYS.A) || keys.has(KEYS.ARROW_LEFT)) {
      this._lastDirection = DIRECTIONS.LEFT;
      return { ...DIRECTIONS.LEFT };
    }
    if (keys.has(KEYS.D) || keys.has(KEYS.ARROW_RIGHT)) {
      this._lastDirection = DIRECTIONS.RIGHT;
      return { ...DIRECTIONS.RIGHT };
    }

    return { ...DIRECTIONS.NONE };
  }

  isShoot() {
    if (this._shootPressed && !this._shootConsumed) {
      this._shootConsumed = true;
      return true;
    }
    return false;
  }

  isRestart() {
    if (this._restartPressed) {
      this._restartPressed = false;
      return true;
    }
    return false;
  }

  consumeShoot() {
    this._shootConsumed = true;
    this._shootPressed = false;
  }
}
