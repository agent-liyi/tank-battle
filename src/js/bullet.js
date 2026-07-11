import { BULLET_SPEED, BULLET_SIZE, CANVAS_SIZE } from './constants.js';

export function createBullet(x, y, direction, owner) {
  return {
    x,
    y,
    direction: { ...direction },
    owner,
    speed: BULLET_SPEED,
    active: true,
  };
}

export function updateBullet(bullet) {
  return {
    ...bullet,
    x: bullet.x + bullet.direction.x * bullet.speed,
    y: bullet.y + bullet.direction.y * bullet.speed,
  };
}

export function isBulletOutOfBounds(bullet) {
  return bullet.x < 0 || bullet.y < 0 ||
         bullet.x >= CANVAS_SIZE || bullet.y >= CANVAS_SIZE;
}

export function canShoot(activeBullet, lastShotFrame, currentFrame, cooldown) {
  if (activeBullet !== null) return false;
  return (currentFrame - lastShotFrame) >= cooldown;
}

export function getBulletBoundingBox(bullet) {
  return {
    x: bullet.x,
    y: bullet.y,
    w: BULLET_SIZE,
    h: BULLET_SIZE,
  };
}
