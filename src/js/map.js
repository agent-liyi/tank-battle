// Tile type codes used in level data arrays
// 0 = empty, 1 = brick, 2 = steel, 3 = water, 4 = forest, 5 = base
export const TILE_CODES = {
  0: 'empty',
  1: 'brick',
  2: 'steel',
  3: 'water',
  4: 'forest',
  5: 'base',
};

export const TILE_TO_CODE = {
  empty: 0,
  brick: 1,
  steel: 2,
  water: 3,
  forest: 4,
  base: 5,
};

import { GRID_SIZE } from './constants.js';

export function getTileAt(mapData, col, row) {
  if (row < 0 || row >= mapData.length || col < 0 || col >= mapData[0].length) {
    return 'empty';
  }
  return mapData[row][col];
}

export function setTileAt(mapData, col, row, tileType) {
  if (row < 0 || row >= mapData.length || col < 0 || col >= mapData[0].length) {
    return mapData;
  }
  const newMap = mapData.map(r => [...r]);
  newMap[row][col] = tileType;
  return newMap;
}

export function isPassable(tileType) {
  return tileType === 'empty' || tileType === 'forest';
}

export function isDestructible(tileType) {
  return tileType === 'brick';
}

export function loadLevel(levelData) {
  return levelData.map(row =>
    row.map(code => {
      const tile = TILE_CODES[code];
      return tile !== undefined ? tile : 'empty';
    })
  );
}

export function getDefaultLevel() {
  const map = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill('empty')
  );

  // Row 0: enemy spawn area (empty except some walls for variety)
  map[0][0] = 'empty';
  map[0][6] = 'empty';
  map[0][12] = 'empty';

  // Row 1: mixed terrain
  map[1][1] = 'brick';
  map[1][4] = 'brick';
  map[1][5] = 'brick';
  map[1][7] = 'brick';
  map[1][8] = 'brick';
  map[1][11] = 'brick';

  // Row 2: steel walls
  map[2][0] = 'steel';
  map[2][2] = 'steel';
  map[2][4] = 'steel';
  map[2][8] = 'steel';
  map[2][10] = 'steel';
  map[2][12] = 'steel';

  // Row 3: brick walls
  map[3][2] = 'brick';
  map[3][4] = 'brick';
  map[3][5] = 'brick';
  map[3][6] = 'brick';
  map[3][7] = 'brick';
  map[3][8] = 'brick';
  map[3][10] = 'brick';

  // Row 4: forest tiles
  map[4][0] = 'forest';
  map[4][1] = 'forest';
  map[4][3] = 'brick';
  map[4][6] = 'brick';
  map[4][9] = 'brick';
  map[4][11] = 'forest';
  map[4][12] = 'forest';

  // Row 5: water and brick mix
  map[5][0] = 'brick';
  map[5][1] = 'brick';
  map[5][3] = 'water';
  map[5][4] = 'water';
  map[5][5] = 'brick';
  map[5][7] = 'brick';
  map[5][8] = 'water';
  map[5][9] = 'water';
  map[5][11] = 'brick';
  map[5][12] = 'brick';

  // Row 6: mixed tiles
  map[6][0] = 'forest';
  map[6][2] = 'brick';
  map[6][3] = 'forest';
  map[6][5] = 'water';
  map[6][7] = 'water';
  map[6][9] = 'forest';
  map[6][10] = 'brick';
  map[6][12] = 'forest';

  // Row 7: brick walls
  map[7][0] = 'steel';
  map[7][1] = 'brick';
  map[7][2] = 'brick';
  map[7][3] = 'brick';
  map[7][4] = 'brick';
  map[7][8] = 'brick';
  map[7][9] = 'brick';
  map[7][10] = 'brick';
  map[7][11] = 'brick';
  map[7][12] = 'steel';

  // Row 8: brick walls
  map[8][0] = 'brick';
  map[8][2] = 'steel';
  map[8][4] = 'brick';
  map[8][6] = 'forest';
  map[8][8] = 'brick';
  map[8][10] = 'steel';
  map[8][12] = 'brick';

  // Row 9: mixed
  map[9][1] = 'brick';
  map[9][3] = 'forest';
  map[9][4] = 'forest';
  map[9][5] = 'brick';
  map[9][7] = 'brick';
  map[9][8] = 'forest';
  map[9][9] = 'forest';
  map[9][11] = 'brick';

  // Row 10: brick wall area
  map[10][2] = 'brick';
  map[10][4] = 'water';
  map[10][6] = 'brick';
  map[10][8] = 'water';
  map[10][10] = 'brick';

  // Row 11: Base defense U-shape
  // U-shape: 3 bricks wide at top, 2 bricks tall on left and right
  // Base at (row 12, col 6), surrounding at row 11-12, col 5-7
  // Top 3 bricks: row 11, cols 5,6,7
  map[11][5] = 'brick';
  map[11][6] = 'brick';
  map[11][7] = 'brick';
  // Left and right sides: rows 11-12, col 5 and col 7
  // Row 11 already has cols 5,7 set above
  map[12][5] = 'brick';
  map[12][7] = 'brick';
  // Base at (12, 6) - this is a special tile, but the base entity is separate
  // We'll mark it as empty in the map and handle base as an entity
  map[12][6] = 'base';

  // Row 12: other tiles
  map[12][0] = 'empty';
  map[12][1] = 'empty';
  map[12][2] = 'brick';
  map[12][3] = 'brick';
  map[12][4] = 'empty'; // Player spawn area
  map[12][8] = 'empty';
  map[12][9] = 'brick';
  map[12][10] = 'brick';
  map[12][11] = 'empty';
  map[12][12] = 'empty';

  return map;
}
