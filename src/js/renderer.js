import {
  TILE_SIZE,
  TILE_TYPES,
  CANVAS_SIZE,
  TANK_SIZE,
  BULLET_SIZE,
  DIRECTIONS,
} from './constants.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  clear() {
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawTile(x, y, tileType) {
    const ctx = this.ctx;
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;

    switch (tileType) {
      case TILE_TYPES.BRICK:
        ctx.fillStyle = '#b5651d';
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        // Brick pattern
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        ctx.beginPath();
        ctx.moveTo(px, py + TILE_SIZE / 2);
        ctx.lineTo(px + TILE_SIZE, py + TILE_SIZE / 2);
        ctx.moveTo(px + TILE_SIZE / 2, py);
        ctx.lineTo(px + TILE_SIZE / 2, py + TILE_SIZE / 2);
        ctx.moveTo(px + TILE_SIZE / 4, py + TILE_SIZE / 2);
        ctx.lineTo(px + TILE_SIZE / 4, py + TILE_SIZE);
        ctx.moveTo(px + TILE_SIZE * 3 / 4, py + TILE_SIZE / 2);
        ctx.lineTo(px + TILE_SIZE * 3 / 4, py + TILE_SIZE);
        ctx.stroke();
        break;

      case TILE_TYPES.STEEL:
        ctx.fillStyle = '#808080';
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#a0a0a0';
        ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        break;

      case TILE_TYPES.WATER:
        ctx.fillStyle = '#1a5276';
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#2980b9';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(px + 4 + i * 10, py + 8, 6, 3);
          ctx.fillRect(px + 6 + i * 10, py + 20, 6, 3);
        }
        break;

      case TILE_TYPES.FOREST:
        ctx.fillStyle = '#1a3a1a';
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#2d5a27';
        ctx.beginPath();
        ctx.arc(px + 8, py + 8, 8, 0, Math.PI * 2);
        ctx.arc(px + 24, py + 8, 8, 0, Math.PI * 2);
        ctx.arc(px + 16, py + 22, 10, 0, Math.PI * 2);
        ctx.fill();
        break;

      default:
        break;
    }
  }

  drawTank(x, y, direction, type, isInvulnerable = false) {
    const ctx = this.ctx;
    const cx = x + TANK_SIZE / 2;
    const cy = y + TANK_SIZE / 2;

    ctx.save();
    ctx.translate(cx, cy);

    // Rotate based on direction
    if (direction.y === -1) ctx.rotate(0);           // up
    else if (direction.y === 1) ctx.rotate(Math.PI); // down
    else if (direction.x === -1) ctx.rotate(-Math.PI / 2); // left
    else if (direction.x === 1) ctx.rotate(Math.PI / 2);   // right

    const half = TANK_SIZE / 2;
    const alpha = isInvulnerable ? 0.5 : 1.0;
    ctx.globalAlpha = alpha;

    if (type === 'player') {
      // Player tank body (green)
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(-half + 2, -half + 4, TANK_SIZE - 4, TANK_SIZE - 4);

      // Tracks
      ctx.fillStyle = '#1e8449';
      ctx.fillRect(-half + 1, -half + 2, 6, TANK_SIZE - 4);
      ctx.fillRect(half - 7, -half + 2, 6, TANK_SIZE - 4);

      // Barrel
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(-3, -half - 2, 6, 14);
    } else {
      // Enemy tank body (red)
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(-half + 2, -half + 4, TANK_SIZE - 4, TANK_SIZE - 4);

      // Tracks
      ctx.fillStyle = '#922b21';
      ctx.fillRect(-half + 1, -half + 2, 6, TANK_SIZE - 4);
      ctx.fillRect(half - 7, -half + 2, 6, TANK_SIZE - 4);

      // Barrel
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(-3, -half - 2, 6, 14);
    }

    ctx.restore();
  }

  drawBullet(x, y, direction) {
    const ctx = this.ctx;
    const half = BULLET_SIZE / 2;
    const cx = x + half;
    const cy = y + half;

    // Outer glow
    ctx.fillStyle = 'rgba(241, 196, 15, 0.4)';
    ctx.beginPath();
    ctx.arc(cx, cy, half + 2, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(cx, cy, half, 0, Math.PI * 2);
    ctx.fill();

    // Bright center
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx, cy, half - 1, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBase(x, y, isDestroyed) {
    const ctx = this.ctx;
    const cx = x + TILE_SIZE / 2;
    const cy = y + TILE_SIZE / 2;

    ctx.save();
    ctx.translate(cx, cy);

    if (isDestroyed) {
      ctx.fillStyle = '#666';
      // X marks destroyed
      ctx.beginPath();
      ctx.moveTo(-12, -12);
      ctx.lineTo(12, 12);
      ctx.moveTo(12, -12);
      ctx.lineTo(-12, 12);
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      // Eagle/diamond shape
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(14, 0);
      ctx.lineTo(0, 14);
      ctx.lineTo(-14, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#e67e22';
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(8, 0);
      ctx.lineTo(0, 8);
      ctx.lineTo(-8, 0);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  drawUI(score, lives, enemiesRemaining) {
    const ctx = this.ctx;

    // Draw HUD background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, CANVAS_SIZE - 20, CANVAS_SIZE, 20);

    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.fillText(`SCORE: ${score}`, 8, CANVAS_SIZE - 6);
    ctx.fillText(`LIVES: ${lives}`, 120, CANVAS_SIZE - 6);
    ctx.fillText(`ENEMIES: ${enemiesRemaining}`, 230, CANVAS_SIZE - 6);
  }

  drawGameOver(result) {
    const ctx = this.ctx;

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // GAME OVER text
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 20);

    // Result text
    if (result === 'victory') {
      ctx.fillStyle = '#27ae60';
      ctx.fillText('VICTORY', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 20);
    } else {
      ctx.fillStyle = '#c0392b';
      ctx.fillText('DEFEAT', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 20);
    }

    // Restart hint
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.fillText('Press ENTER to restart', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 50);

    ctx.textAlign = 'left';
  }
}
