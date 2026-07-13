import {
  TILE_SIZE,
  GRID_SIZE,
  CANVAS_SIZE,
  FPS,
  FIXED_STEP,
  PLAYER_SPEED,
  ENEMY_SPEED,
  BULLET_SPEED,
  BULLET_SIZE,
  TANK_SIZE,
  SHOOTING_COOLDOWN,
  AI_DIRECTION_MIN,
  AI_DIRECTION_MAX,
  AI_SHOOT_MIN,
  AI_SHOOT_MAX,
  RESPAWN_DELAY,
  INVULNERABILITY_DURATION,
  MAX_ACTIVE_ENEMIES,
  TOTAL_ENEMIES,
  INITIAL_LIVES,
  SCORE_PER_ENEMY,
  PLAYER_SPAWN_X,
  PLAYER_SPAWN_Y,
  BASE_POSITION,
  BASE_X,
  BASE_Y,
  ENEMY_SPAWN_POINTS,
  TILE_TYPES,
  DIRECTIONS,
  KEYS,
  GAME_STATES,
  GAME_RESULTS,
} from '../../src/js/constants.js';

describe('constants', () => {
  test('AC-constants TILE_SIZE should be 32', () => {
    expect(TILE_SIZE).toBe(32);
  });

  test('AC-constants GRID_SIZE should be 25', () => {
    expect(GRID_SIZE).toBe(25);
  });

  test('AC-constants CANVAS_SIZE should be 800', () => {
    expect(CANVAS_SIZE).toBe(800);
  });

  test('AC-constants CANVAS_SIZE = GRID_SIZE * TILE_SIZE', () => {
    expect(CANVAS_SIZE).toBe(GRID_SIZE * TILE_SIZE);
  });

  test('AC-constants FPS should be 60', () => {
    expect(FPS).toBe(60);
  });

  test('AC-constants FIXED_STEP should be ~16.67ms', () => {
    expect(FIXED_STEP).toBeCloseTo(1000 / 60, 1);
  });

  test('AC-constants PLAYER_SPEED should be 4px per frame', () => {
    expect(PLAYER_SPEED).toBe(4);
  });

  test('AC-constants BULLET_SPEED should be 8px per frame', () => {
    expect(BULLET_SPEED).toBe(8);
  });

  test('AC-constants SHOOTING_COOLDOWN should be 20 frames', () => {
    expect(SHOOTING_COOLDOWN).toBe(20);
  });

  test('AC-constants MAX_ACTIVE_ENEMIES should be 4', () => {
    expect(MAX_ACTIVE_ENEMIES).toBe(4);
  });

  test('AC-constants TOTAL_ENEMIES should be 15', () => {
    expect(TOTAL_ENEMIES).toBe(15);
  });

  test('AC-constants INITIAL_LIVES should be 3', () => {
    expect(INITIAL_LIVES).toBe(3);
  });

  test('AC-constants SCORE_PER_ENEMY should be 100', () => {
    expect(SCORE_PER_ENEMY).toBe(100);
  });

  test('AC-constants PLAYER spawn position should be (8*32, 23*32)', () => {
    expect(PLAYER_SPAWN_X).toBe(8 * TILE_SIZE);
    expect(PLAYER_SPAWN_Y).toBe(23 * TILE_SIZE);
  });

  test('AC-constants BASE position should be at col 12, row 23', () => {
    expect(BASE_POSITION.col).toBe(12);
    expect(BASE_POSITION.row).toBe(23);
    expect(BASE_X).toBe(12 * TILE_SIZE);
    expect(BASE_Y).toBe(23 * TILE_SIZE);
  });

  test('AC-constants ENEMY_SPAWN_POINTS should have 3 entries at correct positions', () => {
    expect(ENEMY_SPAWN_POINTS).toHaveLength(3);
    expect(ENEMY_SPAWN_POINTS[0].x).toBe(0);
    expect(ENEMY_SPAWN_POINTS[0].y).toBe(0);
    expect(ENEMY_SPAWN_POINTS[1].x).toBe(12 * TILE_SIZE);
    expect(ENEMY_SPAWN_POINTS[1].y).toBe(0);
    expect(ENEMY_SPAWN_POINTS[2].x).toBe(24 * TILE_SIZE);
    expect(ENEMY_SPAWN_POINTS[2].y).toBe(0);
  });

  test('AC-constants TILE_TYPES should have all required types', () => {
    expect(TILE_TYPES.EMPTY).toBe('empty');
    expect(TILE_TYPES.BRICK).toBe('brick');
    expect(TILE_TYPES.STEEL).toBe('steel');
    expect(TILE_TYPES.WATER).toBe('water');
    expect(TILE_TYPES.FOREST).toBe('forest');
    expect(TILE_TYPES.BASE).toBe('base');
  });

  test('AC-constants DIRECTIONS should have correct vectors', () => {
    expect(DIRECTIONS.UP).toEqual({ x: 0, y: -1 });
    expect(DIRECTIONS.DOWN).toEqual({ x: 0, y: 1 });
    expect(DIRECTIONS.LEFT).toEqual({ x: -1, y: 0 });
    expect(DIRECTIONS.RIGHT).toEqual({ x: 1, y: 0 });
    expect(DIRECTIONS.NONE).toEqual({ x: 0, y: 0 });
  });

  test('AC-constants KEYS should have all key bindings', () => {
    expect(KEYS.ARROW_UP).toBe('ArrowUp');
    expect(KEYS.ARROW_DOWN).toBe('ArrowDown');
    expect(KEYS.ARROW_LEFT).toBe('ArrowLeft');
    expect(KEYS.ARROW_RIGHT).toBe('ArrowRight');
    expect(KEYS.W).toBe('KeyW');
    expect(KEYS.S).toBe('KeyS');
    expect(KEYS.A).toBe('KeyA');
    expect(KEYS.D).toBe('KeyD');
    expect(KEYS.SPACE).toBe('Space');
    expect(KEYS.ENTER).toBe('Enter');
  });

  test('AC-constants RESPAWN_DELAY and INVULNERABILITY_DURATION should be 60', () => {
    expect(RESPAWN_DELAY).toBe(60);
    expect(INVULNERABILITY_DURATION).toBe(60);
  });

  test('AC-constants BULLET_SIZE should be 6', () => {
    expect(BULLET_SIZE).toBe(6);
  });

  test('AC-constants TANK_SIZE should be 30', () => {
    expect(TANK_SIZE).toBe(30);
  });

  test('AC-constants AI intervals should be within valid ranges', () => {
    expect(AI_DIRECTION_MIN).toBe(60);
    expect(AI_DIRECTION_MAX).toBe(180);
    expect(AI_SHOOT_MIN).toBe(60);
    expect(AI_SHOOT_MAX).toBe(180);
  });
});
