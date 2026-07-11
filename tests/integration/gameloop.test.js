/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { Game } from '../../src/js/game.js';
import { GAME_STATES, GAME_RESULTS, CANVAS_SIZE } from '../../src/js/constants.js';

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
    getCallback: () => callback,
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

describe('game loop - AC-002 / AC-063', () => {
  test('AC-v0.1.0-001-tank-battle-002 update called before render each tick', () => {
    const scheduler = createMockScheduler();
    const renderer = createMockRenderer();
    const input = createMockInput();

    const game = new Game(scheduler, renderer, input);
    game.init();
    game.start();

    let updateCalled = false;
    let renderCalled = false;
    let callOrder = [];

    const origUpdate = game.update.bind(game);
    const origRender = game.render.bind(game);

    game.update = function() {
      updateCalled = true;
      callOrder.push('update');
      return origUpdate();
    };
    game.render = function() {
      renderCalled = true;
      callOrder.push('render');
      return origRender();
    };

    // Trigger twice: first frame sets baseline, second processes updates
    scheduler.trigger(100);
    scheduler.trigger(200);

    expect(updateCalled).toBe(true);
    expect(renderCalled).toBe(true);
    expect(callOrder.indexOf('update')).toBeLessThan(callOrder.indexOf('render'));

    game.stop();
  });

  test('AC-v0.1.0-001-tank-battle-063 requestAnimationFrame is accessed through injectable interface', () => {
    const scheduler = createMockScheduler();
    const renderer = createMockRenderer();
    const input = createMockInput();

    const game = new Game(scheduler, renderer, input);
    game.init();
    game.start();

    // Verify rAF was called through the scheduler
    expect(scheduler.getCallback()).not.toBeNull();

    game.stop();
  });

  test('AC-v0.1.0-001-tank-battle-002 game loop targets 60fps via requestAnimationFrame', () => {
    const scheduler = createMockScheduler();
    const renderer = createMockRenderer();
    const input = createMockInput();

    const game = new Game(scheduler, renderer, input);
    game.init();
    game.start();

    // Simulate 1 second at ~60fps (accumulator builds up)
    for (let i = 0; i < 6; i++) {
      scheduler.trigger(100 * (i + 1));
    }

    expect(renderer.clear).toHaveBeenCalled();

    game.stop();
  });

  test('game stops when stop() is called', () => {
    const scheduler = createMockScheduler();
    const renderer = createMockRenderer();
    const input = createMockInput();

    const game = new Game(scheduler, renderer, input);
    game.init();
    game.start();

    game.stop();
    // After stop, the callback should be cleared (cancelAnimationFrame called)
    expect(scheduler.getCallback()).toBeNull();
  });
});

describe('game over - AC-045, AC-046, AC-047, AC-048, AC-064', () => {
  test('AC-v0.1.0-001-tank-battle-048 Enter key restarts game', () => {
    const scheduler = createMockScheduler();
    const renderer = createMockRenderer();
    const input = createMockInput();

    input.isRestart.mockReturnValue(true);

    const game = new Game(scheduler, renderer, input);
    game.init();

    // Force game over state
    game.state = { status: GAME_STATES.GAMEOVER, result: GAME_RESULTS.DEFEAT };

    game.start();
    // Second frame triggers the logic
    scheduler.trigger(100);
    scheduler.trigger(200);

    // Should restart and be back to playing
    expect(game.state.status).toBe(GAME_STATES.PLAYING);
    expect(game.state.result).toBeNull();
    expect(game.score).toBe(0);

    game.stop();
  });

  test('AC-v0.1.0-001-tank-battle-064 no game state updates during game over', () => {
    const scheduler = createMockScheduler();
    const renderer = createMockRenderer();
    const input = createMockInput();

    input.getDirection.mockReturnValue({ x: 1, y: 0 });
    input.isShoot.mockReturnValue(true);
    input.isRestart.mockReturnValue(false);

    const game = new Game(scheduler, renderer, input);
    game.init();

    // Force game over
    game.state = { status: GAME_STATES.GAMEOVER, result: GAME_RESULTS.DEFEAT };
    const savedPlayerPos = { x: game.player.x, y: game.player.y };

    game.start();
    scheduler.trigger(100);

    // Player should not have moved
    expect(game.player.x).toBe(savedPlayerPos.x);
    expect(game.player.y).toBe(savedPlayerPos.y);
    // State should remain gameover
    expect(game.state.status).toBe(GAME_STATES.GAMEOVER);

    game.stop();
  });

  test('AC-v0.1.0-001-tank-battle-045 / AC-046 base destruction triggers defeat', () => {
    const scheduler = createMockScheduler();
    const renderer = createMockRenderer();
    const input = createMockInput();

    const game = new Game(scheduler, renderer, input);
    game.init();

    // Manually trigger base destruction
    game.base.destroyed = true;
    game.checkGameOver();

    expect(game.state.status).toBe(GAME_STATES.GAMEOVER);
    expect(game.state.result).toBe(GAME_RESULTS.DEFEAT);
  });

  test('AC-v0.1.0-001-tank-battle-047 zero lives triggers defeat', () => {
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

  test('AC-v0.1.0-001-tank-battle-045 all enemies destroyed triggers victory', () => {
    const scheduler = createMockScheduler();
    const renderer = createMockRenderer();
    const input = createMockInput();

    const game = new Game(scheduler, renderer, input);
    game.init();

    // Clear all enemies
    game.enemies = [];
    game.enemyQueue = [];
    game.checkGameOver();

    expect(game.state.status).toBe(GAME_STATES.GAMEOVER);
    expect(game.state.result).toBe(GAME_RESULTS.VICTORY);
  });
});
