import {
  DIRECTIONS,
  PLAYER_SPEED,
  INITIAL_LIVES,
  RESPAWN_DELAY,
  INVULNERABILITY_DURATION,
  PLAYER_SPAWN_X,
  PLAYER_SPAWN_Y,
  CANVAS_SIZE,
  TANK_SIZE,
} from './constants.js';
import { calculateMovement, isWithinBounds, snapToGrid } from './tank.js';

export function createPlayer(position) {
  return {
    x: position.x,
    y: position.y,
    direction: { ...DIRECTIONS.UP },
    lives: INITIAL_LIVES,
    invulnerabilityTimer: 0,
    respawnTimer: 0,
    destroyed: false,
    lastShotFrame: 0,
    activeBullet: null,
  };
}

export function updatePlayer(player, direction, mapData, enemies, bullets) {
  if (player.destroyed) {
    return player;
  }

  // Handle respawn timer
  if (player.respawnTimer > 0) {
    const newPlayer = {
      ...player,
      respawnTimer: player.respawnTimer - 1,
    };

    if (newPlayer.respawnTimer === 0) {
      // Respawn at spawn position with invulnerability
      return {
        ...newPlayer,
        x: PLAYER_SPAWN_X,
        y: PLAYER_SPAWN_Y,
        destroyed: false,
        invulnerabilityTimer: INVULNERABILITY_DURATION,
        activeBullet: null,
      };
    }

    return newPlayer;
  }

  // Handle invulnerability timer
  if (player.invulnerabilityTimer > 0) {
    player = { ...player, invulnerabilityTimer: player.invulnerabilityTimer - 1 };
  }

  // Apply movement
  let newX = player.x;
  let newY = player.y;

  if (direction.x !== 0 || direction.y !== 0) {
    // Grid-alignment on direction change: snap the perpendicular axis to the
    // nearest grid line so the tank always travels along a grid lane.
    // Triggered on 90-degree turns (horizontal<->vertical) or from NONE.
    const oldDir = player.direction;
    const isOldHorizontal = oldDir.x !== 0;
    const isOldVertical = oldDir.y !== 0;
    const isOldNone = !isOldHorizontal && !isOldVertical;
    const isNewVertical = direction.y !== 0;

    if (isNewVertical && (isOldHorizontal || isOldNone)) {
      // Turning to vertical: snap X to grid
      newX = snapToGrid(player.x);
    } else if (!isNewVertical && (isOldVertical || isOldNone)) {
      // Turning to horizontal: snap Y to grid
      newY = snapToGrid(player.y);
    }

    const { dx, dy } = calculateMovement(direction, PLAYER_SPEED);
    newX = newX + dx;
    newY = newY + dy;

    // Boundary check
    if (!isWithinBounds(newX, newY)) {
      newX = player.x;
      newY = player.y;
    }
  }

  return {
    ...player,
    x: newX,
    y: newY,
    direction: direction.x !== 0 || direction.y !== 0
      ? { ...direction }
      : { ...player.direction },
  };
}

export function playerHit(player) {
  if (player.invulnerabilityTimer > 0 || player.destroyed) {
    return { player: { ...player }, event: undefined };
  }

  const newLives = player.lives - 1;

  if (newLives <= 0) {
    return {
      player: {
        ...player,
        lives: 0,
        destroyed: true,
        activeBullet: null,
      },
      event: 'lifeLost',
    };
  }

  return {
    player: {
      ...player,
      lives: newLives,
      respawnTimer: RESPAWN_DELAY,
      activeBullet: null,
    },
    event: undefined,
  };
}

export function isPlayerInvulnerable(player) {
  return player.invulnerabilityTimer > 0;
}
