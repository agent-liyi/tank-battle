/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { Game } from '../../src/js/game.js';
import {
  GAME_STATES,
  GAME_RESULTS,
  DIRECTIONS,
  PLAYER_SPAWN_X,
  PLAYER_SPAWN_Y,
  BASE_X,
  BASE_Y,
  SCORE_PER_ENEMY,
  PLAYER_SPEED,
  INITIAL_LIVES,
  TOTAL_ENEMIES,
  TILE_SIZE,
  SHOOTING_COOLDOWN,
  ENEMY_SPAWN_POINTS,
  MAX_ACTIVE_ENEMIES,
  CANVAS_SIZE,
  TANK_SIZE,
} from '../../src/js/constants.js';
import { createBullet } from '../../src/js/bullet.js';
import { createEnemy, spawnEnemyQueue } from '../../src/js/enemy.js';
import { tankVsTile, tankVsTank, bulletVsBullet } from '../../src/js/collision.js';

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
    canvas: { width: 1024, height: 1024 },
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

function createGame() {
  const scheduler = createMockScheduler();
  const renderer = createMockRenderer();
  const input = createMockInput();
  const game = new Game(scheduler, renderer, input);
  return { game, scheduler, renderer, input };
}

describe('E2E-01: Game Initialization', () => {
  test('canvas is created, map loaded, player spawned, HUD shows initial values', () => {
    const { game } = createGame();
    game.init();

    // map
    expect(game.mapData).toBeDefined();
    expect(game.mapData.length).toBe(32);
    expect(game.mapData[0].length).toBe(32);

    // player
    expect(game.player).toBeDefined();
    expect(game.player.x).toBe(PLAYER_SPAWN_X);
    expect(game.player.y).toBe(PLAYER_SPAWN_Y);
    expect(game.player.lives).toBe(INITIAL_LIVES);
    expect(game.player.destroyed).toBe(false);

    // base
    expect(game.base).toBeDefined();
    expect(game.base.x).toBe(BASE_X);
    expect(game.base.y).toBe(BASE_Y);
    expect(game.base.destroyed).toBe(false);

    // score
    expect(game.score).toBe(0);

    // state
    expect(game.state.status).toBe(GAME_STATES.PLAYING);
    expect(game.state.result).toBeNull();

    // enemies queued
    expect(game.enemyQueue.length).toBeGreaterThan(0);
    expect(game.enemyQueue.length + game.enemies.filter(e => e.active).length)
      .toBe(TOTAL_ENEMIES);

    // renderer has canvas
    expect(game.renderer.canvas.width).toBe(1024);
    expect(game.renderer.canvas.height).toBe(1024);
  });
});

describe('E2E-02: Player Movement and Shooting', () => {
  test('arrow key input moves player in the correct direction', () => {
    const { game, input } = createGame();
    game.init();
    
    // Use empty map to test pure movement without terrain obstruction
    game.mapData = Array.from({ length: 32 }, () => Array(32).fill('empty'));

    const initialX = game.player.x;
    const initialY = game.player.y;

    // Move up (away from bottom boundary)
    input.getDirection.mockReturnValue({ x: 0, y: -1 });
    game.update();
    expect(game.player.y).toBeLessThan(initialY);
    expect(game.player.x).toBe(initialX);

    // Move right
    const yAfterUp = game.player.y;
    input.getDirection.mockReturnValue({ x: 1, y: 0 });
    game.update();
    expect(game.player.x).toBeGreaterThan(initialX);
    expect(game.player.y).toBe(yAfterUp);

    // Move down
    const xAfterRight = game.player.x;
    input.getDirection.mockReturnValue({ x: 0, y: 1 });
    game.update();
    expect(game.player.y).toBeGreaterThan(yAfterUp);
    expect(game.player.x).toBe(xAfterRight);

    // Move left
    const yAfterDown = game.player.y;
    input.getDirection.mockReturnValue({ x: -1, y: 0 });
    game.update();
    expect(game.player.x).toBeLessThan(xAfterRight);
    expect(game.player.y).toBe(yAfterDown);
  });

  test('player movement speed is 1 tile per 8 frames', () => {
    const { game, input } = createGame();
    game.init();
    
    // Use empty map to test pure movement speed without terrain obstruction
    game.mapData = Array.from({ length: 32 }, () => Array(32).fill('empty'));

    input.getDirection.mockReturnValue({ x: 1, y: 0 });
    const startX = game.player.x;

    game.update();
    expect(game.player.x).toBe(startX + PLAYER_SPEED);
    expect(game.player.x - startX).toBe(TILE_SIZE / 8);
  });

  test('player does not move when no direction input', () => {
    const { game, input } = createGame();
    game.init();

    input.getDirection.mockReturnValue({ x: 0, y: 0 });
    const startX = game.player.x;
    const startY = game.player.y;

    game.update();
    expect(game.player.x).toBe(startX);
    expect(game.player.y).toBe(startY);
  });

  test('space fires a bullet after cooldown', () => {
    const { game, input } = createGame();
    game.init();

    game.frameCount = 19;
    input.getDirection.mockReturnValue({ x: 0, y: -1 });
    input.isShoot.mockReturnValue(true);

    game.update();

    expect(game.bullets.length).toBe(1);
    const bullet = game.bullets[0];
    expect(bullet.owner).toBe('player');
    expect(bullet.direction).toEqual({ x: 0, y: -1 });
    expect(game.player.activeBullet).not.toBeNull();
    expect(game.player.lastShotFrame).toBe(20);
  });

  test('player cannot fire when active bullet already exists', () => {
    const { game, input } = createGame();
    game.init();

    game.frameCount = 20;
    input.isShoot.mockReturnValue(true);

    // First shot
    game.update();
    expect(game.bullets.length).toBe(1);

    // Second shot attempt while bullet still active
    game.frameCount = 40;
    game.update();
    expect(game.bullets.length).toBe(1);
  });

  test('player cannot fire within cooldown period', () => {
    const { game, input } = createGame();
    game.init();

    game.frameCount = 20;
    input.isShoot.mockReturnValue(true);

    game.update();
    expect(game.bullets.length).toBe(1);

    // Remove the bullet to allow re-firing
    game.bullets = [];
    game.player.activeBullet = null;

    // Try to fire immediately (frameCount unchanged from lastShotFrame 20)
    game.frameCount = 21;
    game.update();
    expect(game.bullets.length).toBe(0);
  });
});

describe('E2E-03: Destroy Enemy and Score', () => {
  test('player bullet hitting enemy destroys it and adds score', () => {
    const { game } = createGame();
    game.init();

    // Place enemy at a known position
    const enemyX = 100;
    const enemyY = 256;
    const enemy = createEnemy({ x: enemyX, y: enemyY }, 'basic');
    enemy.active = true;
    game.enemies = [enemy];
    game.enemyQueue = [];

    // Create a player bullet at enemy position
    const bullet = createBullet(enemyX + 15, enemyY + 15, DIRECTIONS.UP, 'player');
    game.bullets = [bullet];

    game.resolveCollisions();

    expect(game.enemies.length).toBe(0);
    expect(game.score).toBe(SCORE_PER_ENEMY);
  });

  test('score increments by 100 per enemy destroyed', () => {
    const { game } = createGame();
    game.init();

    // Use empty map to avoid terrain destroying bullets
    game.mapData = Array.from({ length: 32 }, () => Array(32).fill('empty'));

    expect(game.score).toBe(0);

    for (let i = 0; i < 3; i++) {
      const enemyX = 100 + i * 100;
      const enemyY = 256;
      const enemy = createEnemy({ x: enemyX, y: enemyY }, 'basic');
      enemy.active = true;
      game.enemies = [enemy];
      game.bullets = [createBullet(enemyX + 15, enemyY + 15, DIRECTIONS.UP, 'player')];

      game.resolveCollisions();

      expect(game.score).toBe(SCORE_PER_ENEMY * (i + 1));
      expect(game.enemies.length).toBe(0);
    }

    expect(game.score).toBe(300);
  });
});

describe('E2E-04: Base Destroyed → Defeat', () => {
  test('player bullet hitting base destroys it and triggers DEFEAT', () => {
    const { game } = createGame();
    game.init();

    const bullet = createBullet(BASE_X + 10, BASE_Y + 10, DIRECTIONS.DOWN, 'player');
    game.bullets = [bullet];

    game.resolveCollisions();

    expect(game.base.destroyed).toBe(true);
    expect(game.state.status).toBe(GAME_STATES.GAMEOVER);
    expect(game.state.result).toBe(GAME_RESULTS.DEFEAT);
  });

  test('enemy bullet destroys the base and triggers DEFEAT', () => {
    const { game } = createGame();
    game.init();

    const bullet = createBullet(BASE_X + 10, BASE_Y + 10, DIRECTIONS.DOWN, 'enemy');
    game.bullets = [bullet];

    game.resolveCollisions();

    expect(game.base.destroyed).toBe(true);
    expect(game.state.status).toBe(GAME_STATES.GAMEOVER);
    expect(game.state.result).toBe(GAME_RESULTS.DEFEAT);
  });

  test('game over overlay is rendered on defeat', () => {
    const { game, renderer } = createGame();
    game.init();

    game.state = { status: GAME_STATES.GAMEOVER, result: GAME_RESULTS.DEFEAT };
    game.render();

    expect(renderer.drawGameOver).toHaveBeenCalledWith(GAME_RESULTS.DEFEAT);
  });
});

describe('E2E-05: All Enemies Destroyed → Victory', () => {
  test('destroying all 15 enemies triggers VICTORY', () => {
    const { game } = createGame();
    game.init();

    game.enemies = [];
    game.enemyQueue = [];

    game.checkGameOver();

    expect(game.state.status).toBe(GAME_STATES.GAMEOVER);
    expect(game.state.result).toBe(GAME_RESULTS.VICTORY);
  });

  test('victory is not triggered when enemies remain', () => {
    const { game } = createGame();
    game.init();

    const enemy = createEnemy({ x: 0, y: 0 }, 'basic');
    enemy.active = true;
    game.enemies = [enemy];
    game.enemyQueue = [];
    game.checkGameOver();

    expect(game.state.status).toBe(GAME_STATES.PLAYING);
  });

  test('victory overlay is rendered', () => {
    const { game, renderer } = createGame();
    game.init();

    game.state = { status: GAME_STATES.GAMEOVER, result: GAME_RESULTS.VICTORY };
    game.render();

    expect(renderer.drawGameOver).toHaveBeenCalledWith(GAME_RESULTS.VICTORY);
  });
});

describe('E2E-06: Player Loses All Lives → Defeat', () => {
  test('player with 1 life is destroyed by enemy bullet and triggers DEFEAT', () => {
    const { game } = createGame();
    game.init();

    game.player.lives = 1;
    expect(game.player.lives).toBe(1);
    expect(game.player.destroyed).toBe(false);

    const bullet = createBullet(
      game.player.x + 15,
      game.player.y + 15,
      DIRECTIONS.DOWN,
      'enemy'
    );
    game.bullets = [bullet];

    game.resolveCollisions();

    expect(game.player.lives).toBe(0);
    expect(game.player.destroyed).toBe(true);
    expect(game.state.status).toBe(GAME_STATES.GAMEOVER);
    expect(game.state.result).toBe(GAME_RESULTS.DEFEAT);
  });

  test('player with 2 lives loses one and respawns, not defeated yet', () => {
    const { game } = createGame();
    game.init();

    game.player.lives = 2;

    const bullet = createBullet(
      game.player.x + 15,
      game.player.y + 15,
      DIRECTIONS.DOWN,
      'enemy'
    );
    game.bullets = [bullet];

    game.resolveCollisions();

    expect(game.player.lives).toBe(1);
    expect(game.player.destroyed).toBe(false);
    expect(game.player.respawnTimer).toBeGreaterThan(0);
    expect(game.state.status).toBe(GAME_STATES.PLAYING);
  });

  test('invulnerable player is not damaged by enemy bullet', () => {
    const { game } = createGame();
    game.init();

    game.player.invulnerabilityTimer = 30;
    const originalLives = game.player.lives;

    const bullet = createBullet(
      game.player.x + 15,
      game.player.y + 15,
      DIRECTIONS.DOWN,
      'enemy'
    );
    game.bullets = [bullet];

    game.resolveCollisions();

    expect(game.player.lives).toBe(originalLives);
    expect(game.player.destroyed).toBe(false);
  });

  test('respawn places player at spawn position with invulnerability', () => {
    const { game } = createGame();
    game.init();

    game.player = {
      ...game.player,
      lives: 2,
      respawnTimer: 1,
      destroyed: false,
      x: 999,
      y: 999,
    };

    game.update();

    expect(game.player.x).toBe(PLAYER_SPAWN_X);
    expect(game.player.y).toBe(PLAYER_SPAWN_Y);
    expect(game.player.destroyed).toBe(false);
    expect(game.player.invulnerabilityTimer).toBeGreaterThan(0);
  });
});

// ============================================================
// Additional E2E scenarios from Prism review
// ============================================================

describe('E2E-07: Terrain Interaction', () => {
  test('bullet destroys brick wall', () => {
    const { game } = createGame();
    game.init();

    game.mapData[3][3] = 'brick';
    const bullet = createBullet(3 * TILE_SIZE + 15, 3 * TILE_SIZE + 15, DIRECTIONS.UP, 'player');
    game.bullets = [bullet];

    game.resolveCollisions();

    expect(game.mapData[3][3]).toBe('empty');
    expect(game.bullets.length).toBe(0);
  });

  test('bullet hits steel wall - bullet destroyed, steel remains', () => {
    const { game } = createGame();
    game.init();

    game.mapData[3][3] = 'steel';
    const bullet = createBullet(3 * TILE_SIZE + 15, 3 * TILE_SIZE + 15, DIRECTIONS.UP, 'player');
    game.bullets = [bullet];

    game.resolveCollisions();

    expect(game.mapData[3][3]).toBe('steel');
    expect(game.bullets.length).toBe(0);
  });

  test('tank cannot pass through water', () => {
    const map = Array.from({ length: 32 }, () => Array(32).fill('empty'));
    map[3][3] = 'water';

    const result = tankVsTile(3 * TILE_SIZE + 5, 3 * TILE_SIZE + 5, DIRECTIONS.DOWN, map);

    expect(result.blocked).toBe(true);
  });

  test('tank can pass through forest', () => {
    const map = Array.from({ length: 32 }, () => Array(32).fill('empty'));
    map[3][3] = 'forest';

    const result = tankVsTile(3 * TILE_SIZE + 5, 3 * TILE_SIZE + 5, DIRECTIONS.DOWN, map);

    expect(result.blocked).toBe(false);
  });
});

describe('E2E-08: Tank/Bullet Collision', () => {
  test('tank cannot pass through brick wall', () => {
    const map = Array.from({ length: 32 }, () => Array(32).fill('empty'));
    map[3][3] = 'brick';

    const result = tankVsTile(3 * TILE_SIZE + 5, 3 * TILE_SIZE + 5, DIRECTIONS.UP, map);

    expect(result.blocked).toBe(true);
  });

  test('tank-tank collision blocks movement', () => {
    const tankA = { x: 100, y: 100 };
    const tankB = { x: 110, y: 110 };

    const result = tankVsTank(tankA, tankB, 105, 105);

    expect(result.blocked).toBe(true);
    expect(result.newX).toBe(tankA.x);
    expect(result.newY).toBe(tankA.y);
  });

  test('bullet-bullet collision destroys both', () => {
    const { game } = createGame();
    game.init();

    const bullet1 = createBullet(100, 100, DIRECTIONS.RIGHT, 'player');
    const bullet2 = createBullet(102, 102, DIRECTIONS.LEFT, 'enemy');
    game.bullets = [bullet1, bullet2];

    game.resolveCollisions();

    expect(game.bullets.length).toBe(0);
  });
});

describe('E2E-09: Edge Cases', () => {
  test('movement blocked at grid boundary', () => {
    const { game, input } = createGame();
    game.init();

    game.player.x = 0;
    game.player.y = 200;

    input.getDirection.mockReturnValue({ x: -1, y: 0 });
    game.update();

    expect(game.player.x).toBe(0);
  });

  test('Enter restarts game after Game Over', () => {
    const { game, input } = createGame();
    game.init();

    game.state = { status: GAME_STATES.GAMEOVER, result: GAME_RESULTS.DEFEAT };
    game.score = 500;

    input.isRestart.mockReturnValue(true);
    game.update();

    expect(game.state.status).toBe(GAME_STATES.PLAYING);
    expect(game.state.result).toBeNull();
    expect(game.score).toBe(0);
  });

  test('Space ignored during respawn timer', () => {
    const { game, input } = createGame();
    game.init();

    game.player.respawnTimer = 10;
    game.player.destroyed = false;
    game.player.activeBullet = null;
    game.player.lastShotFrame = 0;
    game.frameCount = 100;

    input.isShoot.mockReturnValue(true);
    game.update();

    expect(game.bullets.length).toBe(0);
  });

  test('Space ignored when player is destroyed', () => {
    const { game, input } = createGame();
    game.init();

    game.player.destroyed = true;
    game.player.activeBullet = null;
    game.player.lastShotFrame = 0;
    game.frameCount = 100;

    input.isShoot.mockReturnValue(true);
    game.update();

    expect(game.bullets.length).toBe(0);
  });

  test('shooting ignored during Game Over state', () => {
    const { game, input } = createGame();
    game.init();

    game.state = { status: GAME_STATES.GAMEOVER, result: GAME_RESULTS.DEFEAT };
    game.frameCount = 100;

    input.isShoot.mockReturnValue(true);
    game.update();

    expect(game.bullets.length).toBe(0);
  });

  test('enemy spawn deferred when all spawn points occupied', () => {
    const enemies = ENEMY_SPAWN_POINTS.map(p => createEnemy({ x: p.x, y: p.y }, 'basic'));
    const queue = [createEnemy({ x: 0, y: 0 }, 'basic')];

    const result = spawnEnemyQueue(
      enemies,
      queue,
      ENEMY_SPAWN_POINTS,
      { x: 999, y: 999 },
      { random: () => 0.5, randomInt: (min, max) => min }
    );

    expect(result.enemies.length).toBe(ENEMY_SPAWN_POINTS.length);
    expect(result.updatedQueue.length).toBe(1);
  });
});
