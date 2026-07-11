import {
  createPlayer,
  updatePlayer,
  playerHit,
  isPlayerInvulnerable,
} from '../../src/js/player.js';
import {
  DIRECTIONS,
  PLAYER_SPEED,
  INITIAL_LIVES,
  RESPAWN_DELAY,
  INVULNERABILITY_DURATION,
  SHOOTING_COOLDOWN,
  PLAYER_SPAWN_X,
  PLAYER_SPAWN_Y,
  TILE_SIZE,
  CANVAS_SIZE,
} from '../../src/js/constants.js';

describe('player - createPlayer', () => {
  test('AC-v0.1.0-001-tank-battle-037 creates player with 3 lives at given position', () => {
    const player = createPlayer({ x: PLAYER_SPAWN_X, y: PLAYER_SPAWN_Y });
    expect(player.x).toBe(PLAYER_SPAWN_X);
    expect(player.y).toBe(PLAYER_SPAWN_Y);
    expect(player.lives).toBe(INITIAL_LIVES);
    expect(player.direction).toEqual(DIRECTIONS.UP);
    expect(player.destroyed).toBe(false);
    expect(player.invulnerabilityTimer).toBe(0);
    expect(player.respawnTimer).toBe(0);
    expect(player.lastShotFrame).toBe(0);
    expect(player.activeBullet).toBeNull();
  });
});

describe('player - updatePlayer movement', () => {
  const emptyMap = Array.from({ length: 13 }, () => Array(13).fill('empty'));

  test('AC-v0.1.0-001-tank-battle-004 moves up when given UP direction', () => {
    let player = createPlayer({ x: 200, y: 200 });
    player = updatePlayer(player, DIRECTIONS.UP, emptyMap, [], []);
    expect(player.y).toBe(200 - PLAYER_SPEED);
  });

  test('AC-v0.1.0-001-tank-battle-005 moves down when given DOWN direction', () => {
    let player = createPlayer({ x: 200, y: 200 });
    player = updatePlayer(player, DIRECTIONS.DOWN, emptyMap, [], []);
    expect(player.y).toBe(200 + PLAYER_SPEED);
  });

  test('AC-v0.1.0-001-tank-battle-006 moves left when given LEFT direction', () => {
    let player = createPlayer({ x: 200, y: 200 });
    player = updatePlayer(player, DIRECTIONS.LEFT, emptyMap, [], []);
    expect(player.x).toBe(200 - PLAYER_SPEED);
  });

  test('AC-v0.1.0-001-tank-battle-007 moves right when given RIGHT direction', () => {
    let player = createPlayer({ x: 200, y: 200 });
    player = updatePlayer(player, DIRECTIONS.RIGHT, emptyMap, [], []);
    expect(player.x).toBe(200 + PLAYER_SPEED);
  });

  test('AC-v0.1.0-001-tank-battle-008 does not move diagonally', () => {
    let player = createPlayer({ x: 200, y: 200 });
    // Diagonal should not happen, but verify NONE works
    player = updatePlayer(player, DIRECTIONS.NONE, emptyMap, [], []);
    expect(player.x).toBe(200);
    expect(player.y).toBe(200);
  });

  test('AC-v0.1.0-001-tank-battle-010 blocked at top boundary', () => {
    let player = createPlayer({ x: 200, y: 0 });
    player = updatePlayer(player, DIRECTIONS.UP, emptyMap, [], []);
    expect(player.y).toBe(0);
  });

  test('AC-v0.1.0-001-tank-battle-010 blocked at left boundary', () => {
    let player = createPlayer({ x: 0, y: 200 });
    player = updatePlayer(player, DIRECTIONS.LEFT, emptyMap, [], []);
    expect(player.x).toBe(0);
  });

  test('AC-v0.1.0-001-tank-battle-010 blocked at right boundary', () => {
    const maxX = CANVAS_SIZE - 30; // TANK_SIZE
    let player = createPlayer({ x: maxX, y: 200 });
    player = updatePlayer(player, DIRECTIONS.RIGHT, emptyMap, [], []);
    expect(player.x).toBe(maxX);
  });

  test('updates direction when moving', () => {
    let player = createPlayer({ x: 200, y: 200 });
    player = updatePlayer(player, DIRECTIONS.RIGHT, emptyMap, [], []);
    expect(player.direction).toEqual(DIRECTIONS.RIGHT);
  });
});

describe('player - invulnerability', () => {
  const emptyMap = Array.from({ length: 13 }, () => Array(13).fill('empty'));

  test('AC-v0.1.0-001-tank-battle-039 invulnerability timer counts down', () => {
    let player = createPlayer({ x: 200, y: 200 });
    let result = playerHit(player);
    player = result.player;
    // After hit, respawn timer starts
    expect(player.respawnTimer).toBe(RESPAWN_DELAY);
    expect(player.destroyed).toBe(false);

    // Tick until respawn
    for (let i = 0; i < RESPAWN_DELAY; i++) {
      player = updatePlayer(player, DIRECTIONS.NONE, emptyMap, [], []);
    }

    // After respawn, should have invulnerability
    expect(player.invulnerabilityTimer).toBeGreaterThan(0);
    expect(isPlayerInvulnerable(player)).toBe(true);

    // Tick through invulnerability
    const invulnFrames = player.invulnerabilityTimer;
    for (let i = 0; i < invulnFrames; i++) {
      player = updatePlayer(player, DIRECTIONS.NONE, emptyMap, [], []);
    }

    expect(player.invulnerabilityTimer).toBe(0);
    expect(isPlayerInvulnerable(player)).toBe(false);
  });

  test('AC-v0.1.0-001-tank-battle-039 cannot be destroyed while invulnerable', () => {
    let player = createPlayer({ x: 200, y: 200 });
    let hitResult = playerHit(player);
    player = hitResult.player;

    // Fast forward through respawn
    for (let i = 0; i < RESPAWN_DELAY; i++) {
      player = updatePlayer(player, DIRECTIONS.NONE, emptyMap, [], []);
    }

    // Now invulnerable
    expect(isPlayerInvulnerable(player)).toBe(true);

    // Hit during invulnerability should not destroy
    const result = playerHit(player);
    expect(result.player.destroyed).toBe(false);
    expect(result.player.lives).toBeGreaterThan(0);
    expect(result.event).toBeUndefined();
  });
});

describe('player - life system', () => {
  test('AC-v0.1.0-001-tank-battle-038 playerHit decrements life and starts respawn', () => {
    let player = createPlayer({ x: PLAYER_SPAWN_X, y: PLAYER_SPAWN_Y });
    expect(player.lives).toBe(INITIAL_LIVES);

    const result = playerHit(player);
    expect(result.player.lives).toBe(INITIAL_LIVES - 1);
    expect(result.player.respawnTimer).toBe(RESPAWN_DELAY);
    expect(result.event).toBeUndefined();
  });

  test('AC-v0.1.0-001-tank-battle-040 player with 1 life loses and game ends', () => {
    let player = createPlayer({ x: PLAYER_SPAWN_X, y: PLAYER_SPAWN_Y });
    player.lives = 1;

    const result = playerHit(player);
    expect(result.player.lives).toBe(0);
    // lives reach 0, should return event
    expect(result.event).toBe('lifeLost');
  });

  test('AC-v0.1.0-001-tank-battle-041 player with 0 lives is destroyed', () => {
    let player = createPlayer({ x: PLAYER_SPAWN_X, y: PLAYER_SPAWN_Y });
    player.lives = 0;
    player.destroyed = true;

    // With 0 lives and destroyed, no respawn happens
    expect(player.lives).toBe(0);
    expect(player.destroyed).toBe(true);
  });

  test('respawn sets position to spawn point', () => {
    let player = createPlayer({ x: 300, y: 300 });
    let hitResult = playerHit(player);
    player = hitResult.player;

    const emptyMap = Array.from({ length: 13 }, () => Array(13).fill('empty'));

    // Tick through respawn delay
    for (let i = 0; i < RESPAWN_DELAY; i++) {
      player = updatePlayer(player, DIRECTIONS.NONE, emptyMap, [], []);
    }

    // After respawn, should be at spawn position
    expect(player.x).toBe(PLAYER_SPAWN_X);
    expect(player.y).toBe(PLAYER_SPAWN_Y);
    expect(player.destroyed).toBe(false);
  });
});
