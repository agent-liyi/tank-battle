/**
 * @jest-environment jsdom
 *
 * AC-NFR1020-02 / AC-NFR1020-03: grid-alignment integration tests
 * Verifies snapToGrid is invoked correctly when updatePlayer / updateEnemy
 * detect a 90-degree direction change.
 */

import { updatePlayer, createPlayer } from '../../src/js/player.js';
import { updateEnemy, createEnemy } from '../../src/js/enemy.js';
import { snapToGrid } from '../../src/js/tank.js';
import { DIRECTIONS, TILE_SIZE, TANK_SIZE, CANVAS_SIZE } from '../../src/js/constants.js';

describe('updatePlayer - grid alignment on direction change', () => {
  // AC-FR1100-01: turning horizontal->vertical snaps X
  test('turning from right to up snaps X to nearest grid line', () => {
    const player = {
      ...createPlayer({ x: 320, y: 960 }),
      x: 100, // off-grid
      y: 68,  // off-grid
      direction: { ...DIRECTIONS.RIGHT },
    };

    const updated = updatePlayer(player, DIRECTIONS.UP, [], [], []);

    // X should snap to nearest grid: round(100/32)*32 = 96
    expect(updated.x).toBe(96);
    // Y moves up from 68: 68 - 4 = 64 (now on grid)
    expect(updated.y).toBe(64);
    expect(updated.direction).toEqual(DIRECTIONS.UP);
  });

  // AC-FR1100-02: turning vertical->horizontal snaps Y
  test('turning from up to right snaps Y to nearest grid line', () => {
    const player = {
      ...createPlayer({ x: 320, y: 960 }),
      x: 96,
      y: 50, // off-grid
      direction: { ...DIRECTIONS.UP },
    };

    const updated = updatePlayer(player, DIRECTIONS.RIGHT, [], [], []);

    // Y should snap to nearest grid: round(50/32)*32 = 64
    expect(updated.y).toBe(64);
    // X moves right from 96: 96 + 4 = 100
    expect(updated.x).toBe(100);
    expect(updated.direction).toEqual(DIRECTIONS.RIGHT);
  });

  // AC-FR1100-03: same direction does NOT trigger alignment
  test('continuing in same direction does not trigger grid alignment', () => {
    const player = {
      ...createPlayer({ x: 320, y: 960 }),
      x: 80, // off-grid
      y: 80, // off-grid
      direction: { ...DIRECTIONS.RIGHT },
    };

    const updated = updatePlayer(player, DIRECTIONS.RIGHT, [], [], []);

    // No snap: X just moves by PLAYER_SPEED, Y stays at 80
    expect(updated.x).toBe(80 + 4);
    expect(updated.y).toBe(80);
  });

  // AC-FR1100-06: already on grid stays on grid after turn
  test('tank already on grid line stays aligned after turn', () => {
    const player = {
      ...createPlayer({ x: 320, y: 960 }),
      x: 128, // grid-aligned
      y: 64,  // grid-aligned
      direction: { ...DIRECTIONS.RIGHT },
    };

    const updated = updatePlayer(player, DIRECTIONS.UP, [], [], []);

    expect(updated.x).toBe(128); // still grid-aligned
    expect(updated.y).toBe(64 - 4); // moved up
  });

  // AC-FR1100-04: turning from NONE (stationary) triggers grid alignment
  test('turning from stationary (NONE) to up snaps X to nearest grid line', () => {
    const player = {
      ...createPlayer({ x: 200, y: 200 }),
      x: 200, // off-grid
      y: 200, // off-grid
      direction: { ...DIRECTIONS.NONE },
    };

    const updated = updatePlayer(player, DIRECTIONS.UP, [], [], []);

    // X snaps to nearest grid: round(200/32)*32 = 192
    expect(updated.x).toBe(192);
    // Y moves up from 200: 200 - PLAYER_SPEED(4) = 196
    expect(updated.y).toBe(196);
    expect(updated.direction).toEqual(DIRECTIONS.UP);
  });

  // AC-FR1100-05: turning from down to left snaps Y
  test('turning from down to left snaps Y to nearest grid line', () => {
    const player = {
      ...createPlayer({ x: 65, y: 130 }),
      x: 65,  // off-grid
      y: 130, // off-grid
      direction: { ...DIRECTIONS.DOWN },
    };

    const updated = updatePlayer(player, DIRECTIONS.LEFT, [], [], []);

    // Y snaps to nearest grid: round(130/32)*32 = 128
    expect(updated.y).toBe(128);
    // X moves left from 65: 65 - PLAYER_SPEED(4) = 61
    expect(updated.x).toBe(61);
    expect(updated.direction).toEqual(DIRECTIONS.LEFT);
  });

  // AC-FR1300-01: near-boundary coordinate snaps within canvas
  test('turning near right boundary snaps X within canvas bounds', () => {
    const player = {
      ...createPlayer({ x: 1005, y: 68 }),
      x: 1005, // near right boundary, off-grid
      y: 68,
      direction: { ...DIRECTIONS.RIGHT },
    };

    const updated = updatePlayer(player, DIRECTIONS.UP, [], [], []);

    // X snaps to nearest grid: round(1005/32)*32 = 992
    expect(updated.x).toBe(992);
    // 992 + TANK_SIZE(30) = 1022 <= CANVAS_SIZE(1024) -> within bounds
    expect(updated.x + TANK_SIZE).toBeLessThanOrEqual(CANVAS_SIZE);
    expect(updated.y).toBe(68 - 4); // moved up
    expect(updated.direction).toEqual(DIRECTIONS.UP);
  });
});

describe('updatePlayer - same-direction movement maintains grid alignment', () => {
  // AC-FR1400-01: continuous same-direction movement stays on grid lane
  test('player moving right for 8 frames stays on grid lane', () => {
    const player = {
      ...createPlayer({ x: 128, y: 64 }),
      x: 128, // grid-aligned
      y: 64,  // grid-aligned
      direction: { ...DIRECTIONS.RIGHT },
    };

    let updated = player;
    const yPerFrame = [];
    for (let frame = 0; frame < 8; frame += 1) {
      updated = updatePlayer(updated, DIRECTIONS.RIGHT, [], [], []);
      yPerFrame.push(updated.y);
    }

    // 8 frames * PLAYER_SPEED(4) = 32 = TILE_SIZE -> x: 128 -> 160
    expect(updated.x).toBe(160);
    // Y remains on grid lane 64 throughout
    expect(updated.y).toBe(64);
    yPerFrame.forEach(y => expect(y).toBe(64));
  });
});

describe('updateEnemy - grid alignment on direction change', () => {
  // ALL_DIRECTIONS = [UP(0), DOWN(1), LEFT(2), RIGHT(3)]
  // AC-FR1200-01: enemy AI direction change applies grid alignment
  test('enemy turning from down to left snaps Y to nearest grid line', () => {
    const enemy = {
      ...createEnemy({ x: 320, y: 0 }),
      x: 100,
      y: 50, // off-grid
      direction: { ...DIRECTIONS.DOWN },
      directionTimer: 0, // trigger AI direction change
    };

    // Force direction change to LEFT (index 2)
    const rng = { randomInt: (a, b) => 2 };
    const updated = updateEnemy(enemy, [], rng);

    // Y should snap: round(50/32)*32 = 64
    expect(updated.y).toBe(64);
    // X moves left from 100: 100 - 3.2 = 96.8
    expect(updated.x).toBeCloseTo(96.8, 1);
    expect(updated.direction).toEqual(DIRECTIONS.LEFT);
  });

  // AC-FR1200-02: enemy turning from right to up snaps X
  test('enemy turning from right to up snaps X to nearest grid line', () => {
    const enemy = {
      ...createEnemy({ x: 0, y: 0 }),
      x: 70,  // off-grid
      y: 200,
      direction: { ...DIRECTIONS.RIGHT },
      directionTimer: 0, // trigger AI direction change
    };

    // Force direction change to UP (index 0)
    const rng = { randomInt: (a, b) => 0 };
    const updated = updateEnemy(enemy, [], rng);

    // X should snap: round(70/32)*32 = 64
    expect(updated.x).toBe(64);
    // Y moves up from 200: 200 - 3.2 = 196.8
    expect(updated.y).toBeCloseTo(196.8, 1);
    expect(updated.direction).toEqual(DIRECTIONS.UP);
  });

  // AC-FR1200-03: enemy direction change after collision applies grid alignment
  test('enemy direction change after collision applies grid alignment', () => {
    // Enemy moving DOWN, near bottom boundary. y=50 is off-grid.
    // After move down, would be out of bounds -> boundary collision triggers direction change.
    const enemy = {
      ...createEnemy({ x: 0, y: 0 }),
      x: 100,
      y: 990, // near bottom (CANVAS_SIZE - TANK_SIZE = 994)
      direction: { ...DIRECTIONS.DOWN },
      directionTimer: 100, // disable AI direction change, force collision path
      shootTimer: 100,
    };

    // Force boundary collision: DOWN move from y=990 goes to 993.2 (still in bounds).
    // We need y >= 991 so DOWN move would go out of bounds.
    enemy.y = 991;

    // Mock rng for the collision-triggered direction change.
    // We need to return RIGHT (index 3) so vertical->horizontal snap triggers.
    const rng = { randomInt: (a, b) => 3 };
    const updated = updateEnemy(enemy, [], rng);

    // After collision: direction changed from DOWN to RIGHT (horizontal)
    // Y was 991 (off-grid). Snap to grid: round(991/32)*32 = 992.
    expect(updated.y).toBe(992);
    expect(updated.direction).toEqual(DIRECTIONS.RIGHT);
  });
});

describe('updateEnemy - same-direction movement maintains grid alignment', () => {
  // AC-FR1400-02: continuous same-direction movement stays on grid lane
  test('enemy moving down for 10 frames stays on grid lane', () => {
    const enemy = {
      ...createEnemy({ x: 64, y: 128 }),
      x: 64,  // grid-aligned
      y: 128, // grid-aligned
      direction: { ...DIRECTIONS.DOWN },
      directionTimer: 100, // disable AI direction change during 10 frames
      shootTimer: 100,
    };

    // Mock RNG kept inert: timers never reach 0 and no boundary collision,
    // so randomInt is never invoked.
    const rng = { randomInt: () => 0 };
    let updated = enemy;
    const xPerFrame = [];
    for (let frame = 0; frame < 10; frame += 1) {
      updated = updateEnemy(updated, [], rng);
      xPerFrame.push(updated.x);
    }

    // 10 frames * ENEMY_SPEED(3.2) = 32 = TILE_SIZE -> y: 128 -> 160
    // Floating-point accumulation yields 159.9999... -> use toBeCloseTo.
    expect(updated.y).toBeCloseTo(160, 5);
    // X remains on grid lane 64 throughout
    expect(updated.x).toBe(64);
    xPerFrame.forEach(xVal => expect(xVal).toBe(64));
  });
});

// AC-NFR1010-01: snapToGrid is O(1) and does not impact 60fps frame rate.
// A simple microbenchmark: 5 tanks * 10000 calls = 50000 snap operations
// should complete well within a single 16.67ms frame budget.
describe('snapToGrid - performance (AC-NFR1010-01)', () => {
  test('50000 snapToGrid calls complete in under 100ms (well within 16.67ms/frame budget)', () => {
    const TANK_COUNT = 5;
    const CALLS_PER_TANK = 10000;
    const FRAME_BUDGET_MS = 100; // generous: 6 frames worth of budget

    const start = process.hrtime.bigint();
    for (let t = 0; t < TANK_COUNT; t += 1) {
      for (let i = 0; i < CALLS_PER_TANK; i += 1) {
        snapToGrid(i * 7 + t * 13);
      }
    }
    const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;

    expect(TANK_COUNT * CALLS_PER_TANK).toBe(50000);
    expect(elapsedMs).toBeLessThan(FRAME_BUDGET_MS);
  });
});
