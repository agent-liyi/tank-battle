/**
 * @jest-environment jsdom
 *
 * AC-NFR1020-02 / AC-NFR1020-03: grid-alignment integration tests
 * Verifies snapToGrid is invoked correctly when updatePlayer / updateEnemy
 * detect a 90-degree direction change.
 */

import { updatePlayer, createPlayer } from '../../src/js/player.js';
import { updateEnemy, createEnemy } from '../../src/js/enemy.js';
import { DIRECTIONS, TILE_SIZE } from '../../src/js/constants.js';

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
