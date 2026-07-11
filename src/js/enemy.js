import {
  DIRECTIONS,
  ENEMY_SPEED,
  MAX_ACTIVE_ENEMIES,
  AI_DIRECTION_MIN,
  AI_DIRECTION_MAX,
  AI_SHOOT_MIN,
  AI_SHOOT_MAX,
  CANVAS_SIZE,
  TANK_SIZE,
} from './constants.js';
import { calculateMovement, isWithinBounds } from './tank.js';

const ALL_DIRECTIONS = [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT];

export function createEnemy(position, type = 'basic') {
  return {
    x: position.x,
    y: position.y,
    direction: { ...DIRECTIONS.DOWN },
    type,
    active: true,
    directionTimer: AI_DIRECTION_MIN,
    shootTimer: AI_SHOOT_MIN,
  };
}

export function updateEnemy(enemy, mapData, rng) {
  if (!enemy.active) return enemy;

  let updated = { ...enemy };

  // Count down direction timer
  if (updated.directionTimer > 0) {
    updated.directionTimer -= 1;
  }

  // Count down shoot timer
  if (updated.shootTimer > 0) {
    updated.shootTimer -= 1;
  }

  // Random direction change when timer reaches 0
  if (updated.directionTimer <= 0) {
    const choice = rng.randomInt(0, 3);
    updated.direction = { ...ALL_DIRECTIONS[choice] };
    updated.directionTimer = rng.randomInt(AI_DIRECTION_MIN, AI_DIRECTION_MAX);
  }

  // Random shooting when timer reaches 0
  if (updated.shootTimer <= 0) {
    updated.shootTimer = rng.randomInt(AI_SHOOT_MIN, AI_SHOOT_MAX);
  }

  // Apply movement
  let newX = updated.x;
  let newY = updated.y;

  if (updated.direction.x !== 0 || updated.direction.y !== 0) {
    const { dx, dy } = calculateMovement(updated.direction, ENEMY_SPEED);
    newX = updated.x + dx;
    newY = updated.y + dy;

    // Check boundaries
    if (!isWithinBounds(newX, newY)) {
      // Blocked by boundary - pick new direction
      const choice = rng.randomInt(0, 3);
      updated.direction = { ...ALL_DIRECTIONS[choice] };
      updated.directionTimer = rng.randomInt(AI_DIRECTION_MIN, AI_DIRECTION_MAX);
      newX = updated.x;
      newY = updated.y;
    }
  }

  updated.x = newX;
  updated.y = newY;

  return updated;
}

export function enemyAI(enemy, mapData, rng) {
  let newDirection = { ...enemy.direction };
  let shouldShoot = false;

  if (!enemy.active) {
    return { newDirection, shouldShoot };
  }

  // Direction change logic
  if (enemy.directionTimer <= 0) {
    const choice = rng.randomInt(0, 3);
    newDirection = { ...ALL_DIRECTIONS[choice] };
  }

  // Shooting logic
  if (enemy.shootTimer <= 0) {
    shouldShoot = true;
  }

  return { newDirection, shouldShoot };
}

export function spawnEnemyQueue(activeEnemies, queue, spawnPoints, playerPosition, rng) {
  const enemies = activeEnemies.filter(e => e.active);
  const newQueue = [...queue];

  while (enemies.length < MAX_ACTIVE_ENEMIES && newQueue.length > 0) {
    const nextEnemy = newQueue.shift();

    // Find a spawn point not occupied by player
    let availablePoint = null;
    for (const point of spawnPoints) {
      const isPlayerThere =
        Math.abs(playerPosition.x - point.x) < TANK_SIZE &&
        Math.abs(playerPosition.y - point.y) < TANK_SIZE;

      const isEnemyThere = enemies.some(
        e => Math.abs(e.x - point.x) < TANK_SIZE && Math.abs(e.y - point.y) < TANK_SIZE
      );

      if (!isPlayerThere && !isEnemyThere) {
        availablePoint = point;
        break;
      }
    }

    if (availablePoint) {
      enemies.push({
        ...nextEnemy,
        x: availablePoint.x,
        y: availablePoint.y,
        active: true,
      });
    } else {
      // Put back in queue if no spawn point available
      newQueue.unshift(nextEnemy);
      break;
    }
  }

  return { enemies, updatedQueue: newQueue };
}

export function isEnemyActive(enemy) {
  return enemy.active === true;
}

export function isEnemyDestroyed(enemy) {
  return enemy.active === false;
}
