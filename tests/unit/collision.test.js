import {
  aabbCollision,
  bulletVsTile,
  bulletVsTank,
  bulletVsBullet,
  bulletVsBase,
  tankVsTile,
  tankVsTank,
} from '../../src/js/collision.js';
import {
  DIRECTIONS,
  TILE_SIZE,
  TILE_TYPES,
  BULLET_SIZE,
  TANK_SIZE,
  PLAYER_SPEED,
  BULLET_SPEED,
  SCORE_PER_ENEMY,
} from '../../src/js/constants.js';
import { createBullet } from '../../src/js/bullet.js';
import { getBulletBoundingBox } from '../../src/js/bullet.js';
import { getTankBoundingBox } from '../../src/js/tank.js';

describe('collision - aabbCollision', () => {
  test('two overlapping boxes collide', () => {
    expect(aabbCollision(
      { x: 0, y: 0, w: 10, h: 10 },
      { x: 5, y: 5, w: 10, h: 10 }
    )).toBe(true);
  });

  test('two separate boxes do not collide', () => {
    expect(aabbCollision(
      { x: 0, y: 0, w: 10, h: 10 },
      { x: 20, y: 20, w: 10, h: 10 }
    )).toBe(false);
  });

  test('adjacent boxes do not collide (no overlap)', () => {
    expect(aabbCollision(
      { x: 0, y: 0, w: 10, h: 10 },
      { x: 10, y: 0, w: 10, h: 10 }
    )).toBe(false);
  });

  test('one box inside another collides', () => {
    expect(aabbCollision(
      { x: 5, y: 5, w: 5, h: 5 },
      { x: 0, y: 0, w: 20, h: 20 }
    )).toBe(true);
  });
});

describe('collision - bulletVsTile', () => {
  test('AC-v0.1.0-001-tank-battle-021 / AC-026 bullet destroys brick tile', () => {
    const map = [['brick']];
    const bullet = createBullet(15, 15, DIRECTIONS.RIGHT, 'player');
    const result = bulletVsTile(bullet, 0, 0, map);
    expect(result.bulletDestroyed).toBe(true);
    expect(result.tileChanged).toBe(true);
    expect(result.newTileType).toBe('empty');
  });

  test('AC-v0.1.0-001-tank-battle-022 / AC-027 bullet destroyed by steel, tile unchanged', () => {
    const map = [['steel']];
    const bullet = createBullet(15, 15, DIRECTIONS.RIGHT, 'player');
    const result = bulletVsTile(bullet, 0, 0, map);
    expect(result.bulletDestroyed).toBe(true);
    expect(result.tileChanged).toBe(false);
  });

  test('AC-v0.1.0-001-tank-battle-023 bullet passes over water', () => {
    const map = [['water']];
    const bullet = createBullet(15, 15, DIRECTIONS.RIGHT, 'player');
    const result = bulletVsTile(bullet, 0, 0, map);
    expect(result.bulletDestroyed).toBe(false);
    expect(result.tileChanged).toBe(false);
  });

  test('bullet passes through forest', () => {
    const map = [['forest']];
    const bullet = createBullet(15, 15, DIRECTIONS.RIGHT, 'player');
    const result = bulletVsTile(bullet, 0, 0, map);
    expect(result.bulletDestroyed).toBe(false);
    expect(result.tileChanged).toBe(false);
  });

  test('bullet passes through empty tile', () => {
    const map = [['empty']];
    const bullet = createBullet(15, 15, DIRECTIONS.RIGHT, 'player');
    const result = bulletVsTile(bullet, 0, 0, map);
    expect(result.bulletDestroyed).toBe(false);
    expect(result.tileChanged).toBe(false);
  });

  test('bullet vs tile with no overlap does nothing', () => {
    const map = [['brick']];
    const bullet = createBullet(100, 100, DIRECTIONS.RIGHT, 'player');
    const result = bulletVsTile(bullet, 0, 0, map);
    expect(result.bulletDestroyed).toBe(false);
    expect(result.tileChanged).toBe(false);
  });
});

describe('collision - bulletVsTank', () => {
  test('AC-v0.1.0-001-tank-battle-030 bullet destroys enemy tank', () => {
    const bullet = createBullet(100, 100, DIRECTIONS.RIGHT, 'player');
    const tank = { x: 100, y: 100 };
    const result = bulletVsTank(bullet, tank, false);
    expect(result.bulletDestroyed).toBe(true);
    expect(result.tankDestroyed).toBe(true);
  });

  test('AC-v0.1.0-001-tank-battle-031 enemy bullet destroys player tank', () => {
    const bullet = createBullet(100, 100, DIRECTIONS.LEFT, 'enemy');
    const tank = { x: 100, y: 100 };
    const result = bulletVsTank(bullet, tank, false);
    expect(result.bulletDestroyed).toBe(true);
    expect(result.tankDestroyed).toBe(true);
  });

  test('invulnerable tank is not destroyed by bullet', () => {
    const bullet = createBullet(100, 100, DIRECTIONS.RIGHT, 'enemy');
    const tank = { x: 100, y: 100 };
    const result = bulletVsTank(bullet, tank, true);
    expect(result.bulletDestroyed).toBe(false);
    expect(result.tankDestroyed).toBe(false);
  });

  test('bullet misses tank', () => {
    const bullet = createBullet(0, 0, DIRECTIONS.RIGHT, 'player');
    const tank = { x: 200, y: 200 };
    const result = bulletVsTank(bullet, tank, false);
    expect(result.bulletDestroyed).toBe(false);
    expect(result.tankDestroyed).toBe(false);
  });
});

describe('collision - bulletVsBullet', () => {
  test('AC-v0.1.0-001-tank-battle-033 two bullets collide and both destroyed', () => {
    const bulletA = createBullet(100, 100, DIRECTIONS.RIGHT, 'player');
    const bulletB = createBullet(102, 100, DIRECTIONS.LEFT, 'enemy');
    const result = bulletVsBullet(bulletA, bulletB);
    expect(result.bothDestroyed).toBe(true);
  });

  test('two distant bullets do not collide', () => {
    const bulletA = createBullet(0, 0, DIRECTIONS.RIGHT, 'player');
    const bulletB = createBullet(300, 300, DIRECTIONS.LEFT, 'enemy');
    const result = bulletVsBullet(bulletA, bulletB);
    expect(result.bothDestroyed).toBe(false);
  });
});

describe('collision - bulletVsBase', () => {
  test('AC-v0.1.0-001-tank-battle-035 / AC-036 player bullet destroys base', () => {
    const bullet = createBullet(200, 390, DIRECTIONS.RIGHT, 'player');
    const base = { x: 6 * 32, y: 12 * 32, destroyed: false };
    const result = bulletVsBase(bullet, base, false);
    expect(result.bulletDestroyed).toBe(true);
    expect(result.baseDestroyed).toBe(true);
  });

  test('AC-v0.1.0-001-tank-battle-059 enemy bullet does NOT destroy base', () => {
    const bullet = createBullet(200, 390, DIRECTIONS.RIGHT, 'enemy');
    const base = { x: 6 * 32, y: 12 * 32, destroyed: false };
    const result = bulletVsBase(bullet, base, true);
    expect(result.bulletDestroyed).toBe(true);
    expect(result.baseDestroyed).toBe(false);
  });

  test('bullet misses base', () => {
    const bullet = createBullet(0, 0, DIRECTIONS.RIGHT, 'player');
    const base = { x: 200, y: 200, destroyed: false };
    const result = bulletVsBase(bullet, base, false);
    expect(result.bulletDestroyed).toBe(false);
    expect(result.baseDestroyed).toBe(false);
  });

  test('already destroyed base does not trigger again', () => {
    const bullet = createBullet(200, 390, DIRECTIONS.RIGHT, 'player');
    const base = { x: 6 * 32, y: 12 * 32, destroyed: true };
    const result = bulletVsBase(bullet, base, false);
    // Bullet should still be destroyed (hits base), but base stays destroyed
    expect(result.bulletDestroyed).toBe(true);
    expect(result.baseDestroyed).toBe(false); // already destroyed
  });
});

describe('collision - tankVsTile', () => {
  test('AC-v0.1.0-001-tank-battle-028 tank blocked by brick wall', () => {
    const map = Array.from({ length: 13 }, () => Array(13).fill('empty'));
    map[3][5] = 'brick';
    const tilePixelX = 5 * TILE_SIZE;
    const tilePixelY = 3 * TILE_SIZE;
    const result = tankVsTile(tilePixelX, tilePixelY, DIRECTIONS.RIGHT, map);
    expect(result.blocked).toBe(true);
  });

  test('AC-v0.1.0-001-tank-battle-028 tank blocked by steel wall', () => {
    const map = Array.from({ length: 13 }, () => Array(13).fill('empty'));
    map[3][5] = 'steel';
    const result = tankVsTile(5 * TILE_SIZE, 3 * TILE_SIZE, DIRECTIONS.RIGHT, map);
    expect(result.blocked).toBe(true);
  });

  test('AC-v0.1.0-001-tank-battle-029 tank blocked by water', () => {
    const map = Array.from({ length: 13 }, () => Array(13).fill('empty'));
    map[3][5] = 'water';
    const result = tankVsTile(5 * TILE_SIZE, 3 * TILE_SIZE, DIRECTIONS.RIGHT, map);
    expect(result.blocked).toBe(true);
  });

  test('AC-v0.1.0-001-tank-battle-024 tank passes through forest', () => {
    const map = Array.from({ length: 13 }, () => Array(13).fill('empty'));
    map[3][5] = 'forest';
    const result = tankVsTile(5 * TILE_SIZE, 3 * TILE_SIZE, DIRECTIONS.RIGHT, map);
    expect(result.blocked).toBe(false);
  });

  test('tank passes through empty tile', () => {
    const map = Array.from({ length: 13 }, () => Array(13).fill('empty'));
    const result = tankVsTile(5 * TILE_SIZE, 3 * TILE_SIZE, DIRECTIONS.RIGHT, map);
    expect(result.blocked).toBe(false);
  });
});

describe('collision - tankVsTank', () => {
  test('AC-v0.1.0-001-tank-battle-032 two tanks blocked from overlapping', () => {
    const tankA = { x: 100, y: 100 };
    const tankB = { x: 125, y: 125 };
    const result = tankVsTank(tankA, tankB, 120, 120);
    expect(result.blocked).toBe(true);
  });

  test('AC-v0.1.0-001-tank-battle-032 two tanks not overlapping are not blocked', () => {
    const tankA = { x: 0, y: 0 };
    const tankB = { x: 200, y: 200 };
    const result = tankVsTank(tankA, tankB, 10, 10);
    expect(result.blocked).toBe(false);
  });

  test('tank can move to empty area next to other tank', () => {
    const tankA = { x: 0, y: 0 };
    const tankB = { x: 200, y: 200 };
    const result = tankVsTank(tankA, tankB, 10, 10);
    expect(result.blocked).toBe(false);
  });
});
