import { CANVAS_SIZE } from './constants.js';

export function renderHUD(ctx, score, lives, enemiesRemaining, canvasSize) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, canvasSize.h - 20, canvasSize.w, 20);

  ctx.fillStyle = '#fff';
  ctx.font = '12px monospace';
  ctx.fillText(`SCORE: ${score}`, 8, canvasSize.h - 6);
  ctx.fillText(`LIVES: ${lives}`, 120, canvasSize.h - 6);
  ctx.fillText(`ENEMIES: ${enemiesRemaining}`, 230, canvasSize.h - 6);
  ctx.restore();
}

export function renderGameOver(ctx, result, canvasSize) {
  ctx.save();

  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(0, 0, canvasSize.w, canvasSize.h);

  // GAME OVER text
  ctx.fillStyle = '#e74c3c';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', canvasSize.w / 2, canvasSize.h / 2 - 20);

  if (result === 'victory') {
    ctx.fillStyle = '#27ae60';
    ctx.fillText('VICTORY', canvasSize.w / 2, canvasSize.h / 2 + 20);
  } else {
    ctx.fillStyle = '#c0392b';
    ctx.fillText('DEFEAT', canvasSize.w / 2, canvasSize.h / 2 + 20);
  }

  // Restart hint
  ctx.fillStyle = '#fff';
  ctx.font = '12px monospace';
  ctx.fillText('Press ENTER to restart', canvasSize.w / 2, canvasSize.h / 2 + 50);

  ctx.textAlign = 'left';
  ctx.restore();
}

export function renderStageInfo(ctx, canvasSize) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvasSize.w, canvasSize.h);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('STAGE 1', canvasSize.w / 2, canvasSize.h / 2);
  ctx.textAlign = 'left';
  ctx.restore();
}
