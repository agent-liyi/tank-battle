import {
  getTileAt,
  setTileAt,
  isPassable,
  isDestructible,
  loadLevel,
  getDefaultLevel,
} from '../../src/js/map.js';
import { TILE_TYPES, GRID_SIZE } from '../../src/js/constants.js';

describe('map - getTileAt', () => {
  const testMap = [
    ['empty', 'brick', 'steel'],
    ['water', 'forest', 'base'],
  ];

  test('AC-v0.1.0-001-tank-battle-024 returns correct tile at valid coords', () => {
    expect(getTileAt(testMap, 0, 0)).toBe('empty');
    expect(getTileAt(testMap, 1, 0)).toBe('brick');
    expect(getTileAt(testMap, 2, 0)).toBe('steel');
    expect(getTileAt(testMap, 0, 1)).toBe('water');
    expect(getTileAt(testMap, 1, 1)).toBe('forest');
    expect(getTileAt(testMap, 2, 1)).toBe('base');
  });

  test('AC-v0.1.0-001-tank-battle-024 returns empty for out-of-bounds', () => {
    expect(getTileAt(testMap, -1, 0)).toBe('empty');
    expect(getTileAt(testMap, 3, 0)).toBe('empty');
    expect(getTileAt(testMap, 0, -1)).toBe('empty');
    expect(getTileAt(testMap, 0, 2)).toBe('empty');
  });
});

describe('map - setTileAt', () => {
  test('AC-v0.1.0-001-tank-battle-021 sets tile and returns new map (immutable)', () => {
    const map = [['empty', 'brick'], ['water', 'forest']];
    const newMap = setTileAt(map, 0, 0, 'steel');
    expect(newMap[0][0]).toBe('steel');
    expect(map[0][0]).toBe('empty'); // original unchanged
  });

  test('AC-v0.1.0-001-tank-battle-021 returns same array for out-of-bounds', () => {
    const map = [['empty']];
    const result = setTileAt(map, 5, 5, 'brick');
    expect(result[0][0]).toBe('empty');
  });
});

describe('map - isPassable', () => {
  test('AC-v0.1.0-001-tank-battle-024 empty is passable', () => {
    expect(isPassable(TILE_TYPES.EMPTY)).toBe(true);
  });

  test('AC-v0.1.0-001-tank-battle-024 forest is passable', () => {
    expect(isPassable(TILE_TYPES.FOREST)).toBe(true);
  });

  test('AC-v0.1.0-001-tank-battle-028 brick is not passable', () => {
    expect(isPassable(TILE_TYPES.BRICK)).toBe(false);
  });

  test('AC-v0.1.0-001-tank-battle-028 steel is not passable', () => {
    expect(isPassable(TILE_TYPES.STEEL)).toBe(false);
  });

  test('AC-v0.1.0-001-tank-battle-029 water is not passable', () => {
    expect(isPassable(TILE_TYPES.WATER)).toBe(false);
  });
});

describe('map - isDestructible', () => {
  test('AC-v0.1.0-001-tank-battle-021 brick is destructible', () => {
    expect(isDestructible(TILE_TYPES.BRICK)).toBe(true);
  });

  test('AC-v0.1.0-001-tank-battle-022 steel is not destructible', () => {
    expect(isDestructible(TILE_TYPES.STEEL)).toBe(false);
  });

  test('empty is not destructible', () => {
    expect(isDestructible(TILE_TYPES.EMPTY)).toBe(false);
  });
});

describe('map - loadLevel', () => {
  test('AC-v0.1.0-001-tank-battle-057 loads numeric level data correctly', () => {
    const levelData = [
      [0, 1, 2],
      [3, 4, 5],
    ];
    const map = loadLevel(levelData);
    expect(map[0][0]).toBe('empty');
    expect(map[0][1]).toBe('brick');
    expect(map[0][2]).toBe('steel');
    expect(map[1][0]).toBe('water');
    expect(map[1][1]).toBe('forest');
    expect(map[1][2]).toBe('base');
  });

  test('AC-v0.1.0-001-tank-battle-057 defaults unknown codes to empty', () => {
    const levelData = [[99]];
    const map = loadLevel(levelData);
    expect(map[0][0]).toBe('empty');
  });
});

describe('map - getDefaultLevel', () => {
  test('AC-v0.1.0-001-tank-battle-025 default level is 25x25', () => {
    const level = getDefaultLevel();
    expect(level).toHaveLength(GRID_SIZE);
    level.forEach(row => {
      expect(row).toHaveLength(GRID_SIZE);
    });
  });

  test('AC-v0.1.0-001-tank-battle-025 base area has U-shape brick walls', () => {
    const level = getDefaultLevel();

    // Row 22, cols 11-13 should be brick (top of U-shape)
    expect(level[22][11]).toBe('brick');
    expect(level[22][12]).toBe('brick');
    expect(level[22][13]).toBe('brick');

    // Row 23, cols 11 and 13 should be brick (sides of U-shape)
    expect(level[23][11]).toBe('brick');
    expect(level[23][13]).toBe('brick');

    // Base at (row 23, col 12)
    expect(level[23][12]).toBe('base');
  });

  test('AC-v0.1.0-001-tank-battle-057 enemy spawn points are empty', () => {
    const level = getDefaultLevel();
    expect(level[0][0]).toBe('empty');
    expect(level[0][12]).toBe('empty');
    expect(level[0][24]).toBe('empty');
  });

  test('AC-v0.1.0-001-tank-battle-057 player spawn area is empty', () => {
    const level = getDefaultLevel();
    expect(level[23][8]).toBe('empty');
  });

  test('AC-v0.1.0-001-tank-battle-057 all tiles are valid types', () => {
    const level = getDefaultLevel();
    const validTypes = Object.values(TILE_TYPES);
    level.forEach((row, y) => {
      row.forEach((tile, x) => {
        expect(validTypes).toContain(tile);
      });
    });
  });
});
