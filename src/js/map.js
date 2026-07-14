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

  // ============================================================
  // Top section (rows 0-9): enemy spawn area + scattered terrain
  // Enemy spawns at (0,0), (0,15), (0,31) — kept clear
  // ============================================================

  // Row 0: spawn row, kept fully empty (enemy spawn points)

  // Row 1: steel barriers (away from spawn cols 0/1, 14-16, 30/31)
  map[1][3] = 'steel';
  map[1][4] = 'steel';
  map[1][7] = 'steel';
  map[1][11] = 'brick';
  map[1][12] = 'brick';
  map[1][19] = 'steel';
  map[1][22] = 'brick';
  map[1][23] = 'brick';
  map[1][27] = 'steel';
  map[1][28] = 'steel';

  // Row 2: brick clusters
  map[2][2] = 'brick';
  map[2][3] = 'brick';
  map[2][8] = 'brick';
  map[2][9] = 'brick';
  map[2][13] = 'brick';
  map[2][17] = 'brick';
  map[2][21] = 'brick';
  map[2][22] = 'brick';
  map[2][26] = 'brick';
  map[2][27] = 'brick';

  // Row 3: forest patches
  map[3][4] = 'forest';
  map[3][5] = 'forest';
  map[3][6] = 'forest';
  map[3][10] = 'forest';
  map[3][11] = 'forest';
  map[3][18] = 'forest';
  map[3][19] = 'forest';
  map[3][24] = 'forest';
  map[3][25] = 'forest';
  map[3][29] = 'forest';

  // Row 4: water pools
  map[4][1] = 'water';
  map[4][2] = 'water';
  map[4][7] = 'water';
  map[4][8] = 'water';
  map[4][12] = 'water';
  map[4][13] = 'water';
  map[4][20] = 'water';
  map[4][27] = 'water';
  map[4][28] = 'water';

  // Row 5: mixed
  map[5][3] = 'brick';
  map[5][5] = 'forest';
  map[5][6] = 'forest';
  map[5][9] = 'brick';
  map[5][10] = 'brick';
  map[5][14] = 'brick';
  map[5][15] = 'brick';
  map[5][19] = 'steel';
  map[5][22] = 'brick';
  map[5][23] = 'brick';
  map[5][26] = 'forest';

  // Row 6: steel + brick
  map[6][2] = 'steel';
  map[6][6] = 'brick';
  map[6][7] = 'brick';
  map[6][8] = 'brick';
  map[6][12] = 'steel';
  map[6][16] = 'brick';
  map[6][17] = 'brick';
  map[6][18] = 'brick';
  map[6][21] = 'steel';
  map[6][25] = 'brick';
  map[6][26] = 'brick';

  // Row 7: water + brick
  map[7][4] = 'water';
  map[7][5] = 'water';
  map[7][11] = 'brick';
  map[7][12] = 'brick';
  map[7][14] = 'brick';
  map[7][15] = 'brick';
  map[7][19] = 'water';
  map[7][23] = 'water';
  map[7][24] = 'water';
  map[7][28] = 'forest';

  // Row 8: scattered
  map[8][1] = 'brick';
  map[8][3] = 'forest';
  map[8][4] = 'forest';
  map[8][9] = 'steel';
  map[8][13] = 'forest';
  map[8][14] = 'forest';
  map[8][18] = 'brick';
  map[8][22] = 'steel';
  map[8][27] = 'brick';

  // Row 9: water barriers
  map[9][6] = 'brick';
  map[9][7] = 'brick';
  map[9][10] = 'water';
  map[9][11] = 'water';
  map[9][16] = 'water';
  map[9][17] = 'water';
  map[9][20] = 'brick';
  map[9][21] = 'brick';
  map[9][25] = 'brick';
  map[9][29] = 'forest';
  map[9][30] = 'forest';

  // ============================================================
  // Middle section (rows 10-21): main battlefield
  // Open zones + obstacle clusters, varied terrain combos
  // ============================================================

  // Row 10
  map[10][2] = 'steel';
  map[10][5] = 'brick';
  map[10][6] = 'brick';
  map[10][11] = 'forest';
  map[10][12] = 'forest';
  map[10][15] = 'brick';
  map[10][16] = 'brick';
  map[10][20] = 'steel';
  map[10][23] = 'brick';
  map[10][24] = 'brick';
  map[10][28] = 'forest';

  // Row 11
  map[11][0] = 'brick';
  map[11][4] = 'water';
  map[11][5] = 'water';
  map[11][8] = 'brick';
  map[11][9] = 'brick';
  map[11][13] = 'steel';
  map[11][17] = 'brick';
  map[11][18] = 'brick';
  map[11][22] = 'water';
  map[11][23] = 'water';
  map[11][27] = 'brick';

  // Row 12
  map[12][3] = 'forest';
  map[12][4] = 'forest';
  map[12][7] = 'brick';
  map[12][8] = 'brick';
  map[12][14] = 'forest';
  map[12][15] = 'forest';
  map[12][19] = 'water';
  map[12][20] = 'water';
  map[12][24] = 'brick';
  map[12][25] = 'brick';
  map[12][29] = 'steel';

  // Row 13
  map[13][1] = 'brick';
  map[13][2] = 'brick';
  map[13][6] = 'steel';
  map[13][10] = 'brick';
  map[13][11] = 'brick';
  map[13][13] = 'steel';
  map[13][14] = 'steel';
  map[13][18] = 'brick';
  map[13][19] = 'brick';
  map[13][23] = 'forest';
  map[13][24] = 'forest';
  map[13][28] = 'brick';

  // Row 14
  map[14][5] = 'brick';
  map[14][9] = 'forest';
  map[14][10] = 'forest';
  map[14][12] = 'water';
  map[14][13] = 'water';
  map[14][16] = 'forest';
  map[14][17] = 'forest';
  map[14][21] = 'brick';
  map[14][22] = 'brick';
  map[14][26] = 'steel';

  // Row 15
  map[15][0] = 'steel';
  map[15][3] = 'brick';
  map[15][4] = 'brick';
  map[15][8] = 'water';
  map[15][9] = 'water';
  map[15][14] = 'brick';
  map[15][15] = 'brick';
  map[15][19] = 'forest';
  map[15][20] = 'forest';
  map[15][24] = 'brick';
  map[15][25] = 'brick';
  map[15][30] = 'brick';

  // Row 16
  map[16][2] = 'forest';
  map[16][3] = 'forest';
  map[16][7] = 'brick';
  map[16][8] = 'brick';
  map[16][11] = 'steel';
  map[16][13] = 'brick';
  map[16][14] = 'brick';
  map[16][18] = 'forest';
  map[16][19] = 'forest';
  map[16][22] = 'steel';
  map[16][27] = 'brick';
  map[16][28] = 'brick';

  // Row 17
  map[17][0] = 'brick';
  map[17][5] = 'water';
  map[17][6] = 'water';
  map[17][10] = 'brick';
  map[17][11] = 'brick';
  map[17][15] = 'brick';
  map[17][16] = 'brick';
  map[17][20] = 'water';
  map[17][21] = 'water';
  map[17][25] = 'forest';
  map[17][26] = 'forest';
  map[17][29] = 'brick';

  // Row 18
  map[18][3] = 'steel';
  map[18][4] = 'brick';
  map[18][8] = 'forest';
  map[18][9] = 'forest';
  map[18][12] = 'brick';
  map[18][13] = 'brick';
  map[18][17] = 'steel';
  map[18][19] = 'brick';
  map[18][20] = 'brick';
  map[18][24] = 'water';
  map[18][25] = 'water';
  map[18][28] = 'forest';

  // Row 19
  map[19][1] = 'brick';
  map[19][2] = 'brick';
  map[19][6] = 'forest';
  map[19][7] = 'forest';
  map[19][11] = 'water';
  map[19][12] = 'water';
  map[19][15] = 'brick';
  map[19][16] = 'brick';
  map[19][21] = 'brick';
  map[19][22] = 'brick';
  map[19][26] = 'steel';
  map[19][30] = 'brick';
  map[19][31] = 'brick';

  // Row 20
  map[20][0] = 'brick';
  map[20][4] = 'steel';
  map[20][5] = 'steel';
  map[20][9] = 'brick';
  map[20][10] = 'brick';
  map[20][13] = 'water';
  map[20][14] = 'water';
  map[20][18] = 'brick';
  map[20][19] = 'brick';
  map[20][23] = 'forest';
  map[20][24] = 'forest';
  map[20][27] = 'brick';
  map[20][28] = 'brick';

  // Row 21
  map[21][3] = 'brick';
  map[21][6] = 'forest';
  map[21][7] = 'forest';
  map[21][11] = 'brick';
  map[21][12] = 'brick';
  map[21][16] = 'steel';
  map[21][17] = 'steel';
  map[21][20] = 'brick';
  map[21][21] = 'brick';
  map[21][25] = 'water';
  map[21][26] = 'water';
  map[21][29] = 'brick';

  // ============================================================
  // Bottom section (rows 22-31): base approach + U-shape defense
  // Base at (30,15), player spawn at (30,10) — kept clear
  // U-shape: row 29 cols 14-16 (top), rows 29-30 cols 14 & 16 (sides)
  // ============================================================

  // Row 22: transition into base zone
  map[22][1] = 'water';
  map[22][2] = 'water';
  map[22][5] = 'forest';
  map[22][6] = 'forest';
  map[22][9] = 'brick';
  map[22][10] = 'brick';
  map[22][13] = 'steel';
  map[22][18] = 'brick';
  map[22][19] = 'brick';
  map[22][22] = 'forest';
  map[22][23] = 'forest';
  map[22][27] = 'water';
  map[22][28] = 'water';

  // Row 23
  map[23][0] = 'brick';
  map[23][4] = 'brick';
  map[23][5] = 'brick';
  map[23][8] = 'forest';
  map[23][9] = 'forest';
  map[23][12] = 'brick';
  map[23][13] = 'brick';
  map[23][17] = 'brick';
  map[23][18] = 'brick';
  map[23][21] = 'steel';
  map[23][25] = 'brick';
  map[23][26] = 'brick';
  map[23][30] = 'brick';

  // Row 24
  map[24][2] = 'steel';
  map[24][3] = 'steel';
  map[24][7] = 'brick';
  map[24][8] = 'brick';
  map[24][11] = 'water';
  map[24][12] = 'water';
  map[24][15] = 'forest';
  map[24][16] = 'forest';
  map[24][20] = 'brick';
  map[24][21] = 'brick';
  map[24][24] = 'steel';
  map[24][28] = 'brick';
  map[24][29] = 'brick';

  // Row 25
  map[25][0] = 'brick';
  map[25][1] = 'brick';
  map[25][5] = 'forest';
  map[25][6] = 'forest';
  map[25][9] = 'brick';
  map[25][10] = 'brick';
  map[25][13] = 'brick';
  map[25][14] = 'brick';
  map[25][18] = 'water';
  map[25][19] = 'water';
  map[25][23] = 'brick';
  map[25][24] = 'brick';
  map[25][27] = 'forest';
  map[25][28] = 'forest';

  // Row 26
  map[26][3] = 'brick';
  map[26][4] = 'brick';
  map[26][7] = 'steel';
  map[26][11] = 'forest';
  map[26][12] = 'forest';
  map[26][13] = 'forest';
  map[26][16] = 'brick';
  map[26][17] = 'brick';
  map[26][21] = 'steel';
  map[26][22] = 'steel';
  map[26][25] = 'brick';
  map[26][26] = 'brick';
  map[26][30] = 'brick';

  // Row 27
  map[27][1] = 'water';
  map[27][2] = 'water';
  map[27][5] = 'brick';
  map[27][6] = 'brick';
  map[27][9] = 'forest';
  map[27][10] = 'forest';
  map[27][14] = 'brick';
  map[27][15] = 'brick';
  map[27][19] = 'brick';
  map[27][20] = 'brick';
  map[27][23] = 'water';
  map[27][24] = 'water';
  map[27][28] = 'brick';
  map[27][29] = 'brick';

  // Row 28
  map[28][3] = 'brick';
  map[28][4] = 'brick';
  map[28][8] = 'steel';
  map[28][11] = 'brick';
  map[28][12] = 'brick';
  map[28][17] = 'brick';
  map[28][18] = 'brick';
  map[28][22] = 'forest';
  map[28][23] = 'forest';
  map[28][26] = 'steel';
  map[28][27] = 'steel';
  map[28][31] = 'brick';

  // Row 29: U-shape top (cols 14,15,16) + light terrain
  // Cols 8-12 kept clear (player spawn approach at row 30, col 10)
  map[29][2] = 'forest';
  map[29][3] = 'forest';
  map[29][5] = 'brick';
  map[29][6] = 'brick';
  map[29][14] = 'brick'; // U-shape top-left
  map[29][15] = 'brick'; // U-shape top-center
  map[29][16] = 'brick'; // U-shape top-right
  map[29][19] = 'brick';
  map[29][20] = 'brick';
  map[29][23] = 'forest';
  map[29][24] = 'forest';
  map[29][27] = 'brick';
  map[29][28] = 'brick';

  // Row 30: player spawn (col 10) + base (col 15) + U-shape sides
  // Cols 8-12 kept clear for player spawn
  map[30][1] = 'brick';
  map[30][2] = 'brick';
  map[30][5] = 'forest';
  map[30][6] = 'forest';
  map[30][10] = 'empty';  // player spawn point
  map[30][14] = 'brick';  // U-shape left side
  map[30][15] = 'base';   // base
  map[30][16] = 'brick';  // U-shape right side
  map[30][20] = 'water';
  map[30][21] = 'water';
  map[30][25] = 'brick';
  map[30][26] = 'brick';
  map[30][30] = 'forest';

  // Row 31: bottom boundary — kept clear near player/base zone
  map[31][3] = 'steel';
  map[31][7] = 'brick';
  map[31][8] = 'brick';
  map[31][12] = 'forest';
  map[31][13] = 'forest';
  map[31][17] = 'brick';
  map[31][18] = 'brick';
  map[31][22] = 'steel';
  map[31][27] = 'brick';
  map[31][28] = 'brick';

  return map;
}
