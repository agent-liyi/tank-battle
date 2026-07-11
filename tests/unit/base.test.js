import {
  createBase,
  destroyBase,
  isBaseDestroyed,
} from '../../src/js/base.js';
import { TILE_SIZE } from '../../src/js/constants.js';

describe('base - createBase', () => {
  test('creates base with given position', () => {
    const base = createBase(6 * TILE_SIZE, 12 * TILE_SIZE);
    expect(base.x).toBe(6 * TILE_SIZE);
    expect(base.y).toBe(12 * TILE_SIZE);
    expect(base.destroyed).toBe(false);
  });
});

describe('base - destroyBase', () => {
  test('destroys base and sets destroyed flag', () => {
    const base = createBase(192, 384);
    const destroyed = destroyBase(base);
    expect(destroyed.destroyed).toBe(true);
    expect(destroyed.x).toBe(192);
    expect(destroyed.y).toBe(384);
  });

  test('does not mutate original base', () => {
    const base = createBase(0, 0);
    const destroyed = destroyBase(base);
    expect(base.destroyed).toBe(false);
    expect(destroyed.destroyed).toBe(true);
  });
});

describe('base - isBaseDestroyed', () => {
  test('returns true if base is destroyed', () => {
    const base = createBase(0, 0);
    const destroyed = destroyBase(base);
    expect(isBaseDestroyed(destroyed)).toBe(true);
  });

  test('returns false if base is intact', () => {
    const base = createBase(0, 0);
    expect(isBaseDestroyed(base)).toBe(false);
  });
});
