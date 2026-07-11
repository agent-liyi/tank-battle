import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { Input } from './input.js';
import { CANVAS_SIZE } from './constants.js';
import { getDefaultLevel } from './map.js';

function main() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) {
    throw new Error('Canvas element #game-canvas not found');
  }

  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  const scheduler = {
    requestAnimationFrame: (cb) => window.requestAnimationFrame(cb),
    cancelAnimationFrame: (id) => window.cancelAnimationFrame(id),
  };

  const renderer = new Renderer(canvas);
  const input = new Input();
  input.init();

  const game = new Game(scheduler, renderer, input, getDefaultLevel);
  game.init();
  game.start();
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', main);
}

export { main };
