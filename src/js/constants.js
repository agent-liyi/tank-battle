// Tile size in pixels
export const TILE_SIZE = 32;

// Grid dimensions
export const GRID_SIZE = 13;

// Canvas size (13 tiles * 32px = 416px)
export const CANVAS_SIZE = 416;

// Frames per second target
export const FPS = 60;

// Fixed time step per frame in milliseconds
export const FIXED_STEP = 1000 / FPS;

// Player tank speed: 1 tile per 8 frames = 32px / 8 = 4px per frame
export const PLAYER_SPEED = TILE_SIZE / 8;

// Enemy tank speed: 1 tile per 10 frames = 32px / 10 = 3.2px per frame
export const ENEMY_SPEED = TILE_SIZE / 10;

// Bullet speed: 1 tile per 4 frames = 32px / 4 = 8px per frame
export const BULLET_SPEED = TILE_SIZE / 4;

// Bullet size in pixels
export const BULLET_SIZE = 6;

// Tank size in pixels (slightly smaller than tile)
export const TANK_SIZE = 30;

// Player shooting cooldown in frames (20 frames ~333ms)
export const SHOOTING_COOLDOWN = 20;

// Enemy AI direction change interval range
export const AI_DIRECTION_MIN = 60;
export const AI_DIRECTION_MAX = 180;

// Enemy AI shooting interval range
export const AI_SHOOT_MIN = 60;
export const AI_SHOOT_MAX = 180;

// Player respawn delay in frames
export const RESPAWN_DELAY = 60;

// Player invulnerability duration in frames
export const INVULNERABILITY_DURATION = 60;

// Maximum active enemy tanks on screen
export const MAX_ACTIVE_ENEMIES = 4;

// Total enemy tanks per level
export const TOTAL_ENEMIES = 20;

// Player initial lives
export const INITIAL_LIVES = 3;

// Score per enemy tank destroyed
export const SCORE_PER_ENEMY = 100;

// Player spawn position (pixel coordinates)
export const PLAYER_SPAWN_X = 4 * TILE_SIZE;
export const PLAYER_SPAWN_Y = 12 * TILE_SIZE;

// Base position (pixel coordinates)
export const BASE_POSITION = { col: 6, row: 12 };
export const BASE_X = BASE_POSITION.col * TILE_SIZE;
export const BASE_Y = BASE_POSITION.row * TILE_SIZE;

// Enemy spawn positions (col, row in tile coordinates)
export const ENEMY_SPAWN_POINTS = [
  { x: 0 * TILE_SIZE, y: 0 },
  { x: 6 * TILE_SIZE, y: 0 },
  { x: 12 * TILE_SIZE, y: 0 },
];

// Tile types enumeration
export const TILE_TYPES = {
  EMPTY: 'empty',
  BRICK: 'brick',
  STEEL: 'steel',
  WATER: 'water',
  FOREST: 'forest',
  BASE: 'base',
};

// Direction vectors
export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
  NONE: { x: 0, y: 0 },
};

// Key mappings
export const KEYS = {
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  W: 'KeyW',
  S: 'KeyS',
  A: 'KeyA',
  D: 'KeyD',
  SPACE: 'Space',
  ENTER: 'Enter',
};

// Game states
export const GAME_STATES = {
  PLAYING: 'playing',
  GAMEOVER: 'gameover',
  PAUSED: 'paused',
};

// Game results
export const GAME_RESULTS = {
  VICTORY: 'victory',
  DEFEAT: 'defeat',
};

export default {
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
};
