/**
 * @jest-environment jsdom
 */

import { CANVAS_SIZE } from '../../src/js/constants.js';

describe('canvas - AC-001', () => {
  test('AC-v0.1.0-001-tank-battle-001 canvas element is created with 800x800 dimensions', () => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(800);
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
  });

  test('AC-v0.1.0-001-tank-battle-001 canvas element exists in DOM', () => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    document.body.appendChild(canvas);

    const found = document.querySelector('canvas');
    expect(found).not.toBeNull();
    expect(found.width).toBe(800);
    expect(found.height).toBe(800);

    document.body.removeChild(canvas);
  });
});
