import { TILE_SIZE, TANK_SIZE, TILE_TYPES } from './constants.js';
import { getBulletBoundingBox } from './bullet.js';
import { getTankBoundingBox } from './tank.js';

export function aabbCollision(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function bulletVsTile(bullet, tileCol, tileRow, mapData) {
  const bulletBB = getBulletBoundingBox(bullet);
  const tilePixelX = tileCol * TILE_SIZE;
  const tilePixelY = tileRow * TILE_SIZE;
  const tileBB = { x: tilePixelX, y: tilePixelY, w: TILE_SIZE, h: TILE_SIZE };

  if (!aabbCollision(bulletBB, tileBB)) {
    return { bulletDestroyed: false, tileChanged: false };
  }

  const tileType = mapData[tileRow][tileCol];

  switch (tileType) {
    case 'brick':
      return { bulletDestroyed: true, tileChanged: true, newTileType: 'empty' };
    case 'steel':
      return { bulletDestroyed: true, tileChanged: false };
    case 'water':
    case 'forest':
    case 'empty':
    case 'base':
    default:
      return { bulletDestroyed: false, tileChanged: false };
  }
}

export function bulletVsTank(bullet, tank, invulnerable) {
  const bulletBB = getBulletBoundingBox(bullet);
  const tankBB = getTankBoundingBox(tank);

  if (!aabbCollision(bulletBB, tankBB)) {
    return { bulletDestroyed: false, tankDestroyed: false };
  }

  if (invulnerable) {
    return { bulletDestroyed: false, tankDestroyed: false };
  }

  return { bulletDestroyed: true, tankDestroyed: true };
}

export function bulletVsBullet(bulletA, bulletB) {
  const bbA = getBulletBoundingBox(bulletA);
  const bbB = getBulletBoundingBox(bulletB);

  if (aabbCollision(bbA, bbB)) {
    return { bothDestroyed: true };
  }

  return { bothDestroyed: false };
}

export function bulletVsBase(bullet, base, isEnemyBullet) {
  const bulletBB = getBulletBoundingBox(bullet);
  const baseBB = { x: base.x, y: base.y, w: TILE_SIZE, h: TILE_SIZE };

  if (!aabbCollision(bulletBB, baseBB)) {
    return { bulletDestroyed: false, baseDestroyed: false };
  }

  if (base.destroyed) {
    return { bulletDestroyed: true, baseDestroyed: false };
  }

  // Any bullet (player or enemy) destroys the base
  return { bulletDestroyed: true, baseDestroyed: true };
}

export function tankVsTile(x, y, direction, mapData) {
  const tankBB = { x: x, y: y, w: TANK_SIZE, h: TANK_SIZE };

  // Check all tiles the tank might overlap with
  const startCol = Math.floor(x / TILE_SIZE);
  const startRow = Math.floor(y / TILE_SIZE);
  const endCol = Math.floor((x + TANK_SIZE - 1) / TILE_SIZE);
  const endRow = Math.floor((y + TANK_SIZE - 1) / TILE_SIZE);

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      if (row < 0 || row >= mapData.length || col < 0 || col >= mapData[0].length) {
        return { blocked: true, newX: x, newY: y };
      }

      const tileType = mapData[row][col];
      if (tileType === 'brick' || tileType === 'steel' || tileType === 'water') {
        const tileBB = {
          x: col * TILE_SIZE,
          y: row * TILE_SIZE,
          w: TILE_SIZE,
          h: TILE_SIZE,
        };

        if (aabbCollision(tankBB, tileBB)) {
          return { blocked: true, newX: x, newY: y };
        }
      }
    }
  }

  return { blocked: false, newX: x, newY: y };
}

export function tankVsTank(tankA, tankB, x, y) {
  const tankABB = getTankBoundingBox({ ...tankA, x, y });
  const tankBBB = getTankBoundingBox(tankB);

  if (aabbCollision(tankABB, tankBBB)) {
    return { blocked: true, newX: tankA.x, newY: tankA.y };
  }

  return { blocked: false, newX: x, newY: y };
}
