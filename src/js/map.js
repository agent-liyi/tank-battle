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

  // --- Top section (rows 0-7): enemy spawn area + mixed terrain ---
  // Row 0: enemy spawn points at cols 0, 12, 24 (kept empty)
  map[0][4] = 'brick';
  map[0][8] = 'brick';
  map[0][16] = 'brick';
  map[0][20] = 'brick';

  // Row 1: steel walls
  map[1][2] = 'steel';
  map[1][6] = 'steel';
  map[1][10] = 'steel';
  map[1][14] = 'steel';
  map[1][18] = 'steel';
  map[1][22] = 'steel';

  // Row 2: brick walls
  map[2][3] = 'brick';
  map[2][4] = 'brick';
  map[2][7] = 'brick';
  map[2][8] = 'brick';
  map[2][11] = 'brick';
  map[2][12] = 'brick';
  map[2][13] = 'brick';
  map[2][16] = 'brick';
  map[2][17] = 'brick';
  map[2][20] = 'brick';
  map[2][21] = 'brick';

  // Row 3: forest
  map[3][0] = 'forest';
  map[3][1] = 'forest';
  map[3][5] = 'forest';
  map[3][6] = 'forest';
  map[3][9] = 'brick';
  map[3][15] = 'brick';
  map[3][18] = 'forest';
  map[3][19] = 'forest';
  map[3][23] = 'forest';
  map[3][24] = 'forest';

  // Row 4: water
  map[4][2] = 'water';
  map[4][3] = 'water';
  map[4][7] = 'brick';
  map[4][8] = 'brick';
  map[4][11] = 'steel';
  map[4][13] = 'steel';
  map[4][16] = 'brick';
  map[4][17] = 'brick';
  map[4][21] = 'water';
  map[4][22] = 'water';

  // Row 5: mixed
  map[5][0] = 'brick';
  map[5][1] = 'brick';
  map[5][4] = 'forest';
  map[5][5] = 'forest';
  map[5][9] = 'brick';
  map[5][10] = 'brick';
  map[5][14] = 'brick';
  map[5][15] = 'brick';
  map[5][19] = 'forest';
  map[5][20] = 'forest';
  map[5][23] = 'brick';
  map[5][24] = 'brick';

  // Row 6: steel + brick
  map[6][3] = 'steel';
  map[6][6] = 'brick';
  map[6][7] = 'brick';
  map[6][8] = 'brick';
  map[6][12] = 'steel';
  map[6][16] = 'brick';
  map[6][17] = 'brick';
  map[6][18] = 'brick';
  map[6][21] = 'steel';

  // Row 7: water barrier
  map[7][1] = 'water';
  map[7][2] = 'water';
  map[7][5] = 'forest';
  map[7][10] = 'brick';
  map[7][11] = 'brick';
  map[7][13] = 'brick';
  map[7][14] = 'brick';
  map[7][19] = 'forest';
  map[7][22] = 'water';
  map[7][23] = 'water';

  // --- Middle section (rows 8-15): open battlefield ---
  // Row 8
  map[8][0] = 'brick';
  map[8][4] = 'steel';
  map[8][8] = 'forest';
  map[8][9] = 'forest';
  map[8][15] = 'forest';
  map[8][16] = 'forest';
  map[8][20] = 'steel';
  map[8][24] = 'brick';

  // Row 9
  map[9][2] = 'brick';
  map[9][3] = 'brick';
  map[9][6] = 'water';
  map[9][7] = 'water';
  map[9][11] = 'brick';
  map[9][13] = 'brick';
  map[9][17] = 'water';
  map[9][18] = 'water';
  map[9][21] = 'brick';
  map[9][22] = 'brick';

  // Row 10
  map[10][5] = 'steel';
  map[10][9] = 'brick';
  map[10][10] = 'brick';
  map[10][14] = 'brick';
  map[10][15] = 'brick';
  map[10][19] = 'steel';

  // Row 11
  map[11][1] = 'forest';
  map[11][2] = 'forest';
  map[11][7] = 'brick';
  map[11][8] = 'brick';
  map[11][12] = 'steel';
  map[11][16] = 'brick';
  map[11][17] = 'brick';
  map[11][22] = 'forest';
  map[11][23] = 'forest';

  // Row 12
  map[12][0] = 'brick';
  map[12][3] = 'water';
  map[12][4] = 'water';
  map[12][9] = 'forest';
  map[12][10] = 'forest';
  map[12][14] = 'forest';
  map[12][15] = 'forest';
  map[12][20] = 'water';
  map[12][21] = 'water';
  map[12][24] = 'brick';

  // Row 13
  map[13][6] = 'brick';
  map[13][7] = 'brick';
  map[13][11] = 'steel';
  map[13][13] = 'steel';
  map[13][17] = 'brick';
  map[13][18] = 'brick';

  // Row 14
  map[14][2] = 'steel';
  map[14][5] = 'brick';
  map[14][8] = 'forest';
  map[14][9] = 'forest';
  map[14][15] = 'forest';
  map[14][16] = 'forest';
  map[14][19] = 'brick';
  map[14][22] = 'steel';

  // Row 15
  map[15][1] = 'brick';
  map[15][2] = 'brick';
  map[15][10] = 'water';
  map[15][11] = 'water';
  map[15][13] = 'water';
  map[15][14] = 'water';
  map[15][22] = 'brick';
  map[15][23] = 'brick';

  // --- Bottom section (rows 16-24): approach to base ---
  // Row 16
  map[16][4] = 'forest';
  map[16][5] = 'forest';
  map[16][9] = 'brick';
  map[16][10] = 'brick';
  map[16][14] = 'brick';
  map[16][15] = 'brick';
  map[16][19] = 'forest';
  map[16][20] = 'forest';

  // Row 17
  map[17][0] = 'steel';
  map[17][7] = 'brick';
  map[17][8] = 'brick';
  map[17][12] = 'brick';
  map[17][16] = 'brick';
  map[17][17] = 'brick';
  map[17][24] = 'steel';

  // Row 18
  map[18][3] = 'water';
  map[18][4] = 'water';
  map[18][11] = 'forest';
  map[18][12] = 'forest';
  map[18][13] = 'forest';
  map[18][20] = 'water';
  map[18][21] = 'water';

  // Row 19
  map[19][6] = 'brick';
  map[19][7] = 'brick';
  map[19][10] = 'steel';
  map[19][14] = 'steel';
  map[19][17] = 'brick';
  map[19][18] = 'brick';

  // Row 20
  map[20][1] = 'forest';
  map[20][2] = 'forest';
  map[20][5] = 'brick';
  map[20][9] = 'water';
  map[20][10] = 'water';
  map[20][14] = 'water';
  map[20][15] = 'water';
  map[20][19] = 'brick';
  map[20][22] = 'forest';
  map[20][23] = 'forest';

  // Row 21
  map[21][0] = 'brick';
  map[21][4] = 'steel';
  map[21][8] = 'brick';
  map[21][9] = 'brick';
  map[21][12] = 'brick';
  map[21][16] = 'brick';
  map[21][17] = 'brick';
  map[21][20] = 'steel';
  map[21][24] = 'brick';

  // Row 22: water barriers near base
  map[22][2] = 'water';
  map[22][3] = 'water';
  map[22][6] = 'forest';
  map[22][7] = 'forest';
  map[22][10] = 'brick';
  map[22][14] = 'brick';
  map[22][17] = 'forest';
  map[22][18] = 'forest';
  map[22][21] = 'water';
  map[22][22] = 'water';

  // Row 23: Base defense U-shape
  // Base at (row 23, col 12), U-shape: top 3 bricks + side walls
  map[22][11] = 'brick';
  map[22][12] = 'brick';
  map[22][13] = 'brick';
  map[23][11] = 'brick';
  map[23][13] = 'brick';
  map[23][12] = 'base';

  // Row 23: other tiles
  map[23][0] = 'empty';
  map[23][1] = 'empty';
  map[23][2] = 'brick';
  map[23][3] = 'brick';
  map[23][4] = 'empty'; // Player spawn area
  map[23][5] = 'empty';
  map[23][6] = 'empty';
  map[23][7] = 'empty';
  map[23][8] = 'empty';
  map[23][9] = 'empty';
  map[23][10] = 'empty';
  map[23][14] = 'empty';
  map[23][15] = 'empty';
  map[23][16] = 'empty';
  map[23][17] = 'empty';
  map[23][18] = 'empty';
  map[23][19] = 'empty';
  map[23][20] = 'empty';
  map[23][21] = 'brick';
  map[23][22] = 'brick';
  map[23][23] = 'empty';
  map[23][24] = 'empty';

  // Row 24: bottom boundary
  map[24][0] = 'brick';
  map[24][1] = 'brick';
  map[24][3] = 'brick';
  map[24][5] = 'brick';
  map[24][6] = 'brick';
  map[24][7] = 'brick';
  map[24][8] = 'brick';
  map[24][10] = 'brick';
  map[24][11] = 'brick';
  map[24][13] = 'brick';
  map[24][14] = 'brick';
  map[24][16] = 'brick';
  map[24][17] = 'brick';
  map[24][18] = 'brick';
  map[24][19] = 'brick';
  map[24][21] = 'brick';
  map[24][22] = 'brick';
  map[24][24] = 'brick';

  return map;
}
