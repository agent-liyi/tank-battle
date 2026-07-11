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
