import { SCORE_PER_ENEMY } from './constants.js';

export function addScore(currentScore, points) {
  return Math.max(0, currentScore + points);
}

export function getScoreForEnemy(enemyType) {
  return SCORE_PER_ENEMY;
}

export function calculateTotalScore(enemiesDestroyed) {
  return enemiesDestroyed * SCORE_PER_ENEMY;
}
