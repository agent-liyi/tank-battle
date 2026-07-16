import { TILE_SIZE, CANVAS_SIZE, TANK_SIZE } from './constants.js';

export function calculateMovement(direction, speed) {
  return {
    dx: direction.x * speed,
    dy: direction.y * speed,
  };
}

export function getTankBoundingBox(tank) {
  return {
    x: tank.x,
    y: tank.y,
    w: TANK_SIZE,
    h: TANK_SIZE,
  };
}

export function isWithinBounds(x, y) {
  return x >= 0 && x <= CANVAS_SIZE - TANK_SIZE &&
         y >= 0 && y <= CANVAS_SIZE - TANK_SIZE;
}

export function pixelToTile(pixel) {
  return Math.floor(pixel / TILE_SIZE);
}

export function tileToPixel(tile) {
  return tile * TILE_SIZE;
}

/**
 * Snap a pixel coordinate to the nearest grid line (multiple of TILE_SIZE).
 * Used for grid-alignment when a tank changes movement direction.
 *
 * @param {number} pixel - pixel coordinate to align
 * @returns {number} - nearest grid-aligned pixel, clamped to valid tank bounds
 *
 * The returned value guarantees that pixel + TANK_SIZE <= CANVAS_SIZE,
 * so the tank always remains within canvas boundaries.
 */
export function snapToGrid(pixel) {
  const raw = Math.round(pixel / TILE_SIZE) * TILE_SIZE;
  // Normalize -0 to 0 (IEEE 754 quirk: -0 + 0 = 0)
  const aligned = raw + 0;
  // Max valid aligned position: largest multiple of TILE_SIZE such that
  // aligned + TANK_SIZE <= CANVAS_SIZE.
  const maxAligned = Math.floor((CANVAS_SIZE - TANK_SIZE) / TILE_SIZE) * TILE_SIZE;
  if (aligned < 0) return 0;
  if (aligned > maxAligned) return maxAligned;
  return aligned;
}
