import {
  addScore,
  getScoreForEnemy,
  calculateTotalScore,
} from '../../src/js/score.js';
import { SCORE_PER_ENEMY } from '../../src/js/constants.js';

describe('score - addScore', () => {
  test('AC-v0.1.0-001-tank-battle-042 score starts at 0', () => {
    expect(addScore(0, 0)).toBe(0);
  });

  test('AC-v0.1.0-001-tank-battle-043 adds 100 points when enemy destroyed', () => {
    expect(addScore(0, SCORE_PER_ENEMY)).toBe(100);
    expect(addScore(200, SCORE_PER_ENEMY)).toBe(300);
    expect(addScore(500, SCORE_PER_ENEMY)).toBe(600);
  });

  test('adds arbitrary points', () => {
    expect(addScore(100, 50)).toBe(150);
  });

  test('score does not go negative', () => {
    expect(addScore(10, -10)).toBe(0);
  });
});

describe('score - getScoreForEnemy', () => {
  test('AC-v0.1.0-001-tank-battle-043 all enemy types give 100 points', () => {
    expect(getScoreForEnemy('basic')).toBe(100);
    expect(getScoreForEnemy('fast')).toBe(100);
    expect(getScoreForEnemy('power')).toBe(100);
    expect(getScoreForEnemy('armor')).toBe(100);
  });
});

describe('score - calculateTotalScore', () => {
  test('AC-v0.1.0-001-tank-battle-044 full level score is 1500 (15 enemies × 100)', () => {
    expect(calculateTotalScore(15)).toBe(1500);
  });

  test('calculates for arbitrary counts', () => {
    expect(calculateTotalScore(0)).toBe(0);
    expect(calculateTotalScore(1)).toBe(100);
    expect(calculateTotalScore(5)).toBe(500);
    expect(calculateTotalScore(10)).toBe(1000);
  });
});
