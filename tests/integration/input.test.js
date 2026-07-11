/**
 * @jest-environment jsdom
 */

import { Input } from '../../src/js/input.js';
import { DIRECTIONS, KEYS } from '../../src/js/constants.js';

describe('input - Input class', () => {
  let input;

  beforeEach(() => {
    input = new Input();
    input.init();
  });

  afterEach(() => {
    input.destroy();
  });

  function simulateKeyDown(code) {
    const event = new KeyboardEvent('keydown', { code, bubbles: true });
    window.dispatchEvent(event);
  }

  function simulateKeyUp(code) {
    const event = new KeyboardEvent('keyup', { code, bubbles: true });
    window.dispatchEvent(event);
  }

  test('AC-v0.1.0-001-tank-battle-009 no keys pressed returns NONE', () => {
    expect(input.getDirection()).toEqual(DIRECTIONS.NONE);
  });

  test('AC-v0.1.0-001-tank-battle-004 ArrowUp returns UP direction', () => {
    simulateKeyDown(KEYS.ARROW_UP);
    expect(input.getDirection()).toEqual(DIRECTIONS.UP);
  });

  test('AC-v0.1.0-001-tank-battle-005 ArrowDown returns DOWN direction', () => {
    simulateKeyDown(KEYS.ARROW_DOWN);
    expect(input.getDirection()).toEqual(DIRECTIONS.DOWN);
  });

  test('AC-v0.1.0-001-tank-battle-006 ArrowLeft returns LEFT direction', () => {
    simulateKeyDown(KEYS.ARROW_LEFT);
    expect(input.getDirection()).toEqual(DIRECTIONS.LEFT);
  });

  test('AC-v0.1.0-001-tank-battle-007 ArrowRight returns RIGHT direction', () => {
    simulateKeyDown(KEYS.ARROW_RIGHT);
    expect(input.getDirection()).toEqual(DIRECTIONS.RIGHT);
  });

  test('AC-v0.1.0-001-tank-battle-009 releasing all keys returns NONE', () => {
    simulateKeyDown(KEYS.ARROW_RIGHT);
    expect(input.getDirection()).toEqual(DIRECTIONS.RIGHT);
    simulateKeyUp(KEYS.ARROW_RIGHT);
    expect(input.getDirection()).toEqual(DIRECTIONS.NONE);
  });

  test('AC-v0.1.0-001-tank-battle-060 WASD keys map correctly', () => {
    simulateKeyDown(KEYS.W);
    expect(input.getDirection()).toEqual(DIRECTIONS.UP);
    simulateKeyUp(KEYS.W);

    simulateKeyDown(KEYS.S);
    expect(input.getDirection()).toEqual(DIRECTIONS.DOWN);
    simulateKeyUp(KEYS.S);

    simulateKeyDown(KEYS.A);
    expect(input.getDirection()).toEqual(DIRECTIONS.LEFT);
    simulateKeyUp(KEYS.A);

    simulateKeyDown(KEYS.D);
    expect(input.getDirection()).toEqual(DIRECTIONS.RIGHT);
    simulateKeyUp(KEYS.D);
  });

  test('Space key triggers shoot', () => {
    expect(input.isShoot()).toBe(false);
    simulateKeyDown(KEYS.SPACE);
    expect(input.isShoot()).toBe(true);
    // Second call should return false (edge-triggered)
    expect(input.isShoot()).toBe(false);
  });

  test('Enter key triggers restart', () => {
    expect(input.isRestart()).toBe(false);
    simulateKeyDown(KEYS.ENTER);
    expect(input.isRestart()).toBe(true);
    expect(input.isRestart()).toBe(false);
  });
});
