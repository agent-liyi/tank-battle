import {
  createBullet,
  updateBullet,
  isBulletOutOfBounds,
  canShoot,
  getBulletBoundingBox,
} from '../../src/js/bullet.js';
import {
  DIRECTIONS,
  BULLET_SPEED,
  BULLET_SIZE,
  CANVAS_SIZE,
  SHOOTING_COOLDOWN,
  TILE_SIZE,
} from '../../src/js/constants.js';

describe('bullet - createBullet', () => {
  test('AC-v0.1.0-001-tank-battle-011 creates bullet at tank position facing up', () => {
    const bullet = createBullet(100, 200, DIRECTIONS.UP, 'player');
    expect(bullet.x).toBe(100);
    expect(bullet.y).toBe(200);
    expect(bullet.direction).toEqual(DIRECTIONS.UP);
    expect(bullet.owner).toBe('player');
    expect(bullet.speed).toBe(BULLET_SPEED);
    expect(bullet.active).toBe(true);
  });

  test('creates bullet for enemy', () => {
    const bullet = createBullet(50, 60, DIRECTIONS.DOWN, 'enemy');
    expect(bullet.owner).toBe('enemy');
  });
});

describe('bullet - updateBullet', () => {
  test('bullet moves up by speed per frame', () => {
    const bullet = createBullet(100, 200, DIRECTIONS.UP, 'player');
    const updated = updateBullet(bullet);
    expect(updated.y).toBe(200 - BULLET_SPEED);
    expect(updated.x).toBe(100);
  });

  test('bullet moves down by speed per frame', () => {
    const bullet = createBullet(100, 200, DIRECTIONS.DOWN, 'player');
    const updated = updateBullet(bullet);
    expect(updated.y).toBe(200 + BULLET_SPEED);
  });

  test('bullet moves left by speed per frame', () => {
    const bullet = createBullet(100, 200, DIRECTIONS.LEFT, 'player');
    const updated = updateBullet(bullet);
    expect(updated.x).toBe(100 - BULLET_SPEED);
  });

  test('bullet moves right by speed per frame', () => {
    const bullet = createBullet(100, 200, DIRECTIONS.RIGHT, 'player');
    const updated = updateBullet(bullet);
    expect(updated.x).toBe(100 + BULLET_SPEED);
  });

  test('multiple updates accumulate', () => {
    const bullet = createBullet(100, 200, DIRECTIONS.UP, 'player');
    let b = updateBullet(bullet);
    b = updateBullet(b);
    b = updateBullet(b);
    b = updateBullet(b);
    // 4 frames, bullet speed 8px per frame = 32px total (1 tile)
    expect(b.y).toBe(200 - 32);
  });
});

describe('bullet - isBulletOutOfBounds', () => {
  test('AC-v0.1.0-001-tank-battle-014 bullet out of top boundary', () => {
    const bullet = createBullet(100, -5, DIRECTIONS.UP, 'player');
    expect(isBulletOutOfBounds(bullet)).toBe(true);
  });

  test('AC-v0.1.0-001-tank-battle-014 bullet out of left boundary', () => {
    const bullet = createBullet(-5, 100, DIRECTIONS.LEFT, 'player');
    expect(isBulletOutOfBounds(bullet)).toBe(true);
  });

  test('AC-v0.1.0-001-tank-battle-014 bullet out of right boundary', () => {
    const bullet = createBullet(CANVAS_SIZE + 5, 100, DIRECTIONS.RIGHT, 'player');
    expect(isBulletOutOfBounds(bullet)).toBe(true);
  });

  test('AC-v0.1.0-001-tank-battle-014 bullet out of bottom boundary', () => {
    const bullet = createBullet(100, CANVAS_SIZE + 5, DIRECTIONS.DOWN, 'player');
    expect(isBulletOutOfBounds(bullet)).toBe(true);
  });

  test('bullet within bounds is not out of bounds', () => {
    const bullet = createBullet(100, 200, DIRECTIONS.RIGHT, 'player');
    expect(isBulletOutOfBounds(bullet)).toBe(false);
  });

  test('bullet exactly on edge is within bounds', () => {
    const bullet = createBullet(0, 0, DIRECTIONS.RIGHT, 'player');
    expect(isBulletOutOfBounds(bullet)).toBe(false);
    const bullet2 = createBullet(CANVAS_SIZE - BULLET_SIZE, CANVAS_SIZE - BULLET_SIZE, DIRECTIONS.RIGHT, 'player');
    expect(isBulletOutOfBounds(bullet2)).toBe(false);
  });
});

describe('bullet - canShoot', () => {
  test('AC-v0.1.0-001-tank-battle-012 can shoot when no active bullet and cooldown elapsed', () => {
    expect(canShoot(null, 0, 30, SHOOTING_COOLDOWN)).toBe(true);
  });

  test('AC-v0.1.0-001-tank-battle-012 cannot shoot when active bullet exists', () => {
    const activeBullet = createBullet(100, 200, DIRECTIONS.UP, 'player');
    expect(canShoot(activeBullet, 0, 30, SHOOTING_COOLDOWN)).toBe(false);
  });

  test('AC-v0.1.0-001-tank-battle-013 cannot shoot during cooldown', () => {
    // lastShotFrame=10, currentFrame=15, cooldown=20 -> only 5 frames elapsed
    expect(canShoot(null, 10, 15, SHOOTING_COOLDOWN)).toBe(false);
  });

  test('AC-v0.1.0-001-tank-battle-013 can shoot after cooldown', () => {
    // lastShotFrame=10, currentFrame=30, cooldown=20 -> cooldown elapsed
    expect(canShoot(null, 10, 30, SHOOTING_COOLDOWN)).toBe(true);
  });

  test('can shoot exactly at cooldown boundary', () => {
    expect(canShoot(null, 0, 20, SHOOTING_COOLDOWN)).toBe(true);
  });

  test('AC-v0.1.0-001-tank-battle-061 cannot shoot when bullet exists during respawn', () => {
    const activeBullet = createBullet(100, 200, DIRECTIONS.UP, 'player');
    expect(canShoot(activeBullet, 0, 30, SHOOTING_COOLDOWN)).toBe(false);
  });
});

describe('bullet - getBulletBoundingBox', () => {
  test('returns correct bounding box for bullet', () => {
    const bullet = createBullet(100, 200, DIRECTIONS.RIGHT, 'player');
    const bb = getBulletBoundingBox(bullet);
    expect(bb.x).toBe(100);
    expect(bb.y).toBe(200);
    expect(bb.w).toBe(BULLET_SIZE);
    expect(bb.h).toBe(BULLET_SIZE);
  });
});
