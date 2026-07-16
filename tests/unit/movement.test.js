import {
  calculateMovement,
  getTankBoundingBox,
  isWithinBounds,
  pixelToTile,
  tileToPixel,
  snapToGrid,
} from '../../src/js/tank.js';
import {
  DIRECTIONS,
  TILE_SIZE,
  CANVAS_SIZE,
  TANK_SIZE,
  PLAYER_SPEED,
} from '../../src/js/constants.js';

describe('tank - calculateMovement', () => {
  test('AC-v0.1.0-001-tank-battle-004 moves up with correct delta', () => {
    const { dx, dy } = calculateMovement(DIRECTIONS.UP, PLAYER_SPEED);
    expect(dx).toBe(0);
    expect(dy).toBe(-PLAYER_SPEED);
  });

  test('AC-v0.1.0-001-tank-battle-005 moves down with correct delta', () => {
    const { dx, dy } = calculateMovement(DIRECTIONS.DOWN, PLAYER_SPEED);
    expect(dx).toBe(0);
    expect(dy).toBe(PLAYER_SPEED);
  });

  test('AC-v0.1.0-001-tank-battle-006 moves left with correct delta', () => {
    const { dx, dy } = calculateMovement(DIRECTIONS.LEFT, PLAYER_SPEED);
    expect(dx).toBe(-PLAYER_SPEED);
    expect(dy).toBe(0);
  });

  test('AC-v0.1.0-001-tank-battle-007 moves right with correct delta', () => {
    const { dx, dy } = calculateMovement(DIRECTIONS.RIGHT, PLAYER_SPEED);
    expect(dx).toBe(PLAYER_SPEED);
    expect(dy).toBe(0);
  });

  test('AC-v0.1.0-001-tank-battle-008 NONE direction produces zero delta', () => {
    const { dx, dy } = calculateMovement(DIRECTIONS.NONE, PLAYER_SPEED);
    expect(dx).toBe(0);
    expect(dy).toBe(0);
  });

  test('speed applies correctly', () => {
    const speed = 10;
    const { dx, dy } = calculateMovement(DIRECTIONS.RIGHT, speed);
    expect(dx).toBe(speed);
    expect(dy).toBe(0);
  });
});

describe('tank - getTankBoundingBox', () => {
  test('returns correct bounding box for tank', () => {
    const tank = { x: 100, y: 50 };
    const bb = getTankBoundingBox(tank);
    expect(bb.x).toBe(100);
    expect(bb.y).toBe(50);
    expect(bb.w).toBe(TANK_SIZE);
    expect(bb.h).toBe(TANK_SIZE);
  });
});

describe('tank - isWithinBounds', () => {
  test('AC-v0.1.0-001-tank-battle-010 returns true for valid positions', () => {
    expect(isWithinBounds(0, 0)).toBe(true);
    expect(isWithinBounds(CANVAS_SIZE - TANK_SIZE, CANVAS_SIZE - TANK_SIZE)).toBe(true);
    expect(isWithinBounds(200, 200)).toBe(true);
  });

  test('AC-v0.1.0-001-tank-battle-010 returns false outside boundaries', () => {
    expect(isWithinBounds(-1, 0)).toBe(false);
    expect(isWithinBounds(0, -1)).toBe(false);
    expect(isWithinBounds(CANVAS_SIZE, 0)).toBe(false);
    expect(isWithinBounds(0, CANVAS_SIZE)).toBe(false);
  });
});

describe('tank - coordinate conversion', () => {
  test('pixelToTile converts pixel coordinates to tile indices', () => {
    expect(pixelToTile(0)).toBe(0);
    expect(pixelToTile(TILE_SIZE - 1)).toBe(0);
    expect(pixelToTile(TILE_SIZE)).toBe(1);
    expect(pixelToTile(TILE_SIZE * 5 + 15)).toBe(5);
  });

  test('tileToPixel converts tile indices to pixel coordinates', () => {
    expect(tileToPixel(0)).toBe(0);
    expect(tileToPixel(1)).toBe(TILE_SIZE);
    expect(tileToPixel(5)).toBe(TILE_SIZE * 5);
  });
});

describe('tank - snapToGrid', () => {
  // AC-NFR1020-01: pure function grid-alignment
  test('snapToGrid(0) === 0', () => {
    expect(snapToGrid(0)).toBe(0);
  });

  test('snapToGrid(15) === 0 (rounds down to nearest grid)', () => {
    expect(snapToGrid(15)).toBe(0);
  });

  test('snapToGrid(17) === 32 (rounds up to nearest grid)', () => {
    expect(snapToGrid(17)).toBe(TILE_SIZE);
  });

  test('snapToGrid(32) === 32 (already on grid)', () => {
    expect(snapToGrid(TILE_SIZE)).toBe(TILE_SIZE);
  });

  test('snapToGrid(100) === 96', () => {
    expect(snapToGrid(100)).toBe(96);
  });

  test('snapToGrid(130) === 128', () => {
    expect(snapToGrid(130)).toBe(128);
  });

  // AC-FR1300-02: boundary safety - result must keep tank within canvas
  test('snapToGrid always returns value that keeps tank within canvas', () => {
    for (let p = 0; p <= CANVAS_SIZE; p += 7) {
      const snapped = snapToGrid(p);
      expect(snapped % TILE_SIZE).toBe(0);
      expect(snapped).toBeGreaterThanOrEqual(0);
      expect(snapped + TANK_SIZE).toBeLessThanOrEqual(CANVAS_SIZE);
    }
  });

  test('snapToGrid clamps negative input to 0', () => {
    expect(snapToGrid(-10)).toBe(0);
    expect(snapToGrid(-1)).toBe(0);
  });

  test('snapToGrid clamps to max valid aligned position', () => {
    // Max valid position: 31 * 32 = 992 (992 + 30 = 1022 < 1024)
    expect(snapToGrid(CANVAS_SIZE)).toBeLessThanOrEqual(CANVAS_SIZE - TANK_SIZE);
  });
});
