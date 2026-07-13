/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { Game } from '../../src/js/game.js';
import {
  GAME_STATES,
  GAME_RESULTS,
  CANVAS_SIZE,
  DIRECTIONS,
  PLAYER_SPAWN_X,
  PLAYER_SPAWN_Y,
  BASE_X,
  BASE_Y,
  TILE_SIZE,
  SCORE_PER_ENEMY,
} from '../../src/js/constants.js';
import { createBullet } from '../../src/js/bullet.js';
import { createEnemy } from '../../src/js/enemy.js';
import { getDefaultLevel } from '../../src/js/map.js';
import { createBase } from '../../src/js/base.js';

function createMockScheduler() {
  let callback = null;
  let id = 0;
  return {
    requestAnimationFrame: (cb) => {
      callback = cb;
      return ++id;
    },
    cancelAnimationFrame: () => {
      callback = null;
    },
    trigger: (timestamp) => {
      if (callback) callback(timestamp);
    },
  };
}

function createMockRenderer() {
  return {
    clear: jest.fn(),
    drawTile: jest.fn(),
    drawTank: jest.fn(),
    drawBullet: jest.fn(),
    drawBase: jest.fn(),
    drawUI: jest.fn(),
    drawGameOver: jest.fn(),
    canvas: { width: CANVAS_SIZE, height: CANVAS_SIZE },
  };
}

function createMockInput() {
  return {
    getDirection: jest.fn(() => ({ x: 0, y: 0 })),
    isShoot: jest.fn(() => false),
    isRestart: jest.fn(() => false),
    init: jest.fn(),
    destroy: jest.fn(),
    consumeShoot: jest.fn(),
  };
}

describe('gameover integration - AC-035, AC-036, AC-040', () => {
  test('AC-v0.1.0-001-tank-battle-035 base destroyed → defeat with overlay', () => {
    const scheduler = createMockScheduler();
    const renderer = createMockRenderer();
    const input = createMockInput();

    const game = new Game(scheduler, renderer, input);
    game.init();

    // Simulate bullet hitting base
    const bullet = createBullet(BASE_X + 10, BASE_Y + 10, { x: 0, y: 0 }, 'player');
    game.bullets.push(bullet);
    game.resolveCollisions();

    expect(game.base.destroyed).toBe(true);
    expect(game.state.status).toBe(GAME_STATES.GAMEOVER);
    expect(game.state.result).toBe(GAME_RESULTS.DEFEAT);
  });

  test('AC-v0.1.0-001-tank-battle-036 player bullet can destroy own base', () => {
    const scheduler = createMockScheduler();
    const renderer = createMockRenderer();
    const input = createMockInput();

    const game = new Game(scheduler, renderer, input);
    game.init();

    const bullet = createBullet(BASE_X + 10, BASE_Y + 10, { x: 0, y: 0 }, 'player');
    game.bullets.push(bullet);
    game.resolveCollisions();

    expect(game.base.destroyed).toBe(true);
    expect(game.state.result).toBe(GAME_RESULTS.DEFEAT);
  });

  test('AC-v0.1.0-001-tank-battle-040 zero lives → defeat', () => {
    const scheduler = createMockScheduler();
    const renderer = createMockRenderer();
    const input = createMockInput();

    const game = new Game(scheduler, renderer, input);
    game.init();

    game.player.lives = 0;
    game.player.destroyed = true;
    game.checkGameOver();

    expect(game.state.status).toBe(GAME_STATES.GAMEOVER);
    expect(game.state.result).toBe(GAME_RESULTS.DEFEAT);
  });

  test('AC-v0.1.0-001-tank-battle-045 all enemies destroyed → victory', () => {
    const scheduler = createMockScheduler();
    const renderer = createMockRenderer();
    const input = createMockInput();

    const game = new Game(scheduler, renderer, input);
    game.init();

    game.enemies = [];
    game.enemyQueue = [];
    game.checkGameOver();

    expect(game.state.status).toBe(GAME_STATES.GAMEOVER);
    expect(game.state.result).toBe(GAME_RESULTS.VICTORY);
  });

  test('score increments when enemy destroyed by player bullet', () => {
    const scheduler = createMockScheduler();
    const renderer = createMockRenderer();
    const input = createMockInput();

    const game = new Game(scheduler, renderer, input);
    game.init();

    const enemy = createEnemy({ x: 100, y: 256 }, 'basic');
    game.enemies = [enemy];
    game.score = 0;

    const bullet = createBullet(enemy.x + 10, enemy.y + 10, { x: 0, y: 0 }, 'player');
    game.bullets.push(bullet);
    game.resolveCollisions();

    expect(game.score).toBe(SCORE_PER_ENEMY);
    expect(game.enemies.length).toBe(0);
  });
});
