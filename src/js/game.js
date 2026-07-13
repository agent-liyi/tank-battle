import {
  CANVAS_SIZE,
  FIXED_STEP,
  GAME_STATES,
  GAME_RESULTS,
  MAX_ACTIVE_ENEMIES,
  TOTAL_ENEMIES,
  ENEMY_SPAWN_POINTS,
  PLAYER_SPAWN_X,
  PLAYER_SPAWN_Y,
  BASE_X,
  BASE_Y,
  SCORE_PER_ENEMY,
  SHOOTING_COOLDOWN,
  DIRECTIONS,
  TILE_TYPES,
  GRID_SIZE,
  TILE_SIZE,
  TANK_SIZE,
  BULLET_SIZE,
} from './constants.js';
import { getDefaultLevel, getTileAt, setTileAt } from './map.js';
import { createPlayer, updatePlayer, playerHit, isPlayerInvulnerable } from './player.js';
import { createEnemy, updateEnemy, spawnEnemyQueue, isEnemyDestroyed } from './enemy.js';
import { createBullet, updateBullet, isBulletOutOfBounds, canShoot } from './bullet.js';
import { createBase, destroyBase, isBaseDestroyed } from './base.js';
import { addScore } from './score.js';
import {
  bulletVsTile,
  bulletVsTank,
  bulletVsBullet,
  bulletVsBase,
  tankVsTile,
  tankVsTank,
} from './collision.js';
import { getTankBoundingBox } from './tank.js';

const ALL_DIRECTIONS = [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT];

export class Game {
  constructor(scheduler, renderer, input, mapFactory) {
    this.scheduler = scheduler;
    this.renderer = renderer;
    this.input = input;
    this.mapFactory = mapFactory || getDefaultLevel;

    this.state = null;
    this.player = null;
    this.enemies = [];
    this.enemyQueue = [];
    this.bullets = [];
    this.base = null;
    this.mapData = null;
    this.score = 0;
    this.frameCount = 0;
    this.animationId = null;
    this.lastTime = 0;
    this.accumulator = 0;
  }

  init() {
    this.state = { status: GAME_STATES.PLAYING, result: null };
    this.mapData = this.mapFactory();
    this.player = createPlayer({ x: PLAYER_SPAWN_X, y: PLAYER_SPAWN_Y });
    this.base = createBase(BASE_X, BASE_Y);
    this.score = 0;
    this.frameCount = 0;

    // Create enemy queue (20 enemies total)
    this.enemyQueue = [];
    for (let i = 0; i < TOTAL_ENEMIES; i++) {
      this.enemyQueue.push(createEnemy({ x: 0, y: 0 }, 'basic'));
    }
    this.enemies = [];

    // Spawn initial enemies
    const spawnResult = spawnEnemyQueue(
      this.enemies,
      this.enemyQueue,
      ENEMY_SPAWN_POINTS,
      { x: this.player.x, y: this.player.y },
      this.defaultRNG()
    );
    this.enemies = spawnResult.enemies;
    this.enemyQueue = spawnResult.updatedQueue;

    this.bullets = [];
    this.lastTime = 0;
    this.accumulator = 0;
  }

  defaultRNG() {
    return {
      random: () => Math.random(),
      randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    };
  }

  start() {
    this.lastTime = 0;
    this.accumulator = 0;
    this._tick = this._tick.bind(this);
    this.animationId = this.scheduler.requestAnimationFrame(this._tick);
  }

  stop() {
    if (this.animationId != null) {
      this.scheduler.cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  reset() {
    this.stop();
    this.init();
    this.start();
  }

  _tick(timestamp) {
    if (this.lastTime === 0) {
      this.lastTime = timestamp;
      this.animationId = this.scheduler.requestAnimationFrame(this._tick);
      return;
    }
    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.accumulator += delta;

    while (this.accumulator >= FIXED_STEP) {
      this.update();
      this.accumulator -= FIXED_STEP;
    }

    this.render();
    this.animationId = this.scheduler.requestAnimationFrame(this._tick);
  }

  update() {
    // Check restart (works even during game over)
    if (this.input.isRestart()) {
      this.reset();
      return;
    }

    if (this.state.status !== GAME_STATES.PLAYING) return;

    this.frameCount++;

    // Player input
    const direction = this.input.getDirection();
    const wantsShoot = this.input.isShoot();

    // Save player position before movement for collision revert
    const playerPrevX = this.player.x;
    const playerPrevY = this.player.y;

    // Update player
    this.player = updatePlayer(
      this.player,
      direction,
      this.mapData,
      this.enemies,
      this.bullets
    );

    // Check terrain collision for player
    if (direction.x !== 0 || direction.y !== 0) {
      const playerTileResult = tankVsTile(this.player.x, this.player.y, this.player.direction, this.mapData);
      if (playerTileResult.blocked) {
        this.player.x = playerPrevX;
        this.player.y = playerPrevY;
      }
    }

    // Player shooting
    if (wantsShoot) {
      if (
        !this.player.destroyed &&
        this.player.respawnTimer === 0 &&
        canShoot(this.player.activeBullet, this.player.lastShotFrame, this.frameCount, SHOOTING_COOLDOWN)
      ) {
        const bullet = createBullet(
          this.player.x + TANK_SIZE / 2 - BULLET_SIZE / 2,
          this.player.y + TANK_SIZE / 2 - BULLET_SIZE / 2,
          this.player.direction,
          'player'
        );
        this.bullets.push(bullet);
        this.player.lastShotFrame = this.frameCount;
        this.player.activeBullet = bullet;
      }
    }

    // Update enemies with AI
    const rng = this.defaultRNG();
    for (let i = 0; i < this.enemies.length; i++) {
      const updated = updateEnemy(this.enemies[i], this.mapData, rng);
      
      // Check terrain collision for enemy
      const enemyTileResult = tankVsTile(updated.x, updated.y, updated.direction, this.mapData);
      if (enemyTileResult.blocked) {
        // Revert position and pick a new random direction
        updated.x = this.enemies[i].x;
        updated.y = this.enemies[i].y;
        const choice = rng.randomInt(0, 3);
        updated.direction = { ...ALL_DIRECTIONS[choice] };
      }
      
      this.enemies[i] = updated;

      // Enemy shooting
      if (updated.shootTimer === 1) {
        // Just reset, fire a bullet
        const enemyBullet = createBullet(
          updated.x + TANK_SIZE / 2 - BULLET_SIZE / 2,
          updated.y + TANK_SIZE / 2 - BULLET_SIZE / 2,
          updated.direction,
          'enemy'
        );
        this.bullets.push(enemyBullet);
      }
    }

    // Spawn enemies
    const spawnResult = spawnEnemyQueue(
      this.enemies,
      this.enemyQueue,
      ENEMY_SPAWN_POINTS,
      { x: this.player.x, y: this.player.y },
      rng
    );
    this.enemies = spawnResult.enemies;
    this.enemyQueue = spawnResult.updatedQueue;

    // Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      this.bullets[i] = updateBullet(this.bullets[i]);
      if (isBulletOutOfBounds(this.bullets[i])) {
        // Clear active bullet reference if it was player's
        if (this.bullets[i].owner === 'player') {
          this.player.activeBullet = null;
        }
        this.bullets.splice(i, 1);
      }
    }

    // Collision detection
    this.resolveCollisions();

    // Update HUD enemy count
    this.enemiesRemaining = this.enemyQueue.length + this.enemies.filter(e => e.active).length;
  }

  resolveCollisions() {
    const newMap = this.mapData.map(r => [...r]);
    const bulletsToRemove = new Set();
    const enemiesToRemove = new Set();
    let playerWasHit = false;

    // Bullet vs Tile
    for (let i = 0; i < this.bullets.length; i++) {
      const bullet = this.bullets[i];
      const col = Math.floor(bullet.x / TILE_SIZE);
      const row = Math.floor(bullet.y / TILE_SIZE);

      if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        const result = bulletVsTile(bullet, col, row, newMap);
        if (result.bulletDestroyed) {
          bulletsToRemove.add(i);
          if (result.tileChanged) {
            newMap[row][col] = result.newTileType;
          }
        }
      }
    }

    // Bullet vs Enemy Tank (only player bullets can destroy enemies)
    for (let i = 0; i < this.bullets.length; i++) {
      if (bulletsToRemove.has(i)) continue;
      const bullet = this.bullets[i];
      if (bullet.owner !== 'player') continue;

      for (let j = 0; j < this.enemies.length; j++) {
        if (enemiesToRemove.has(j)) continue;
        const enemy = this.enemies[j];
        if (!enemy.active) continue;

        const result = bulletVsTank(bullet, enemy, false);
        if (result.tankDestroyed) {
          bulletsToRemove.add(i);
          enemiesToRemove.add(j);
          this.score = addScore(this.score, SCORE_PER_ENEMY);
          break;
        }
      }
    }

    // Bullet vs Player Tank
    for (let i = 0; i < this.bullets.length; i++) {
      if (bulletsToRemove.has(i)) continue;
      const bullet = this.bullets[i];

      if (bullet.owner === 'enemy' && !this.player.destroyed) {
        const result = bulletVsTank(bullet, this.player, isPlayerInvulnerable(this.player));
        if (result.tankDestroyed) {
          bulletsToRemove.add(i);
          playerWasHit = true;
        }
      }
    }

    // Bullet vs Base
    for (let i = 0; i < this.bullets.length; i++) {
      if (bulletsToRemove.has(i)) continue;
      const bullet = this.bullets[i];

      if (!isBaseDestroyed(this.base)) {
        const isEnemyBullet = bullet.owner === 'enemy';
        const result = bulletVsBase(bullet, this.base, isEnemyBullet);
        if (result.bulletDestroyed) {
          bulletsToRemove.add(i);
        }
        if (result.baseDestroyed) {
          this.base = destroyBase(this.base);
        }
      }
    }

    // Bullet vs Bullet
    for (let i = 0; i < this.bullets.length; i++) {
      if (bulletsToRemove.has(i)) continue;
      for (let j = i + 1; j < this.bullets.length; j++) {
        if (bulletsToRemove.has(j)) continue;
        const result = bulletVsBullet(this.bullets[i], this.bullets[j]);
        if (result.bothDestroyed) {
          bulletsToRemove.add(i);
          bulletsToRemove.add(j);
          break;
        }
      }
    }

    // Process removals
    this.bullets = this.bullets.filter((_, index) => !bulletsToRemove.has(index));

    // Clear player's active bullet if it was destroyed
    const playerBulletExists = this.bullets.some(b => b.owner === 'player');
    if (!playerBulletExists) {
      this.player.activeBullet = null;
    }

    // Remove destroyed enemies
    this.enemies = this.enemies.filter((_, index) => !enemiesToRemove.has(index));

    // Apply tile changes
    this.mapData = newMap;

    // Handle player hit
    if (playerWasHit) {
      const hitResult = playerHit(this.player);
      this.player = hitResult.player;
    }

    // Check game over conditions
    this.checkGameOver();
  }

  checkGameOver() {
    // Base destroyed → defeat
    if (isBaseDestroyed(this.base)) {
      this.state = { status: GAME_STATES.GAMEOVER, result: GAME_RESULTS.DEFEAT };
      return;
    }

    // Player out of lives → defeat
    if (this.player.lives <= 0 && this.player.destroyed) {
      this.state = { status: GAME_STATES.GAMEOVER, result: GAME_RESULTS.DEFEAT };
      return;
    }

    // All enemies destroyed → victory
    const remainingEnemies = this.enemyQueue.length + this.enemies.filter(e => e.active).length;
    if (remainingEnemies === 0) {
      this.state = { status: GAME_STATES.GAMEOVER, result: GAME_RESULTS.VICTORY };
      return;
    }
  }

  render() {
    this.renderer.clear();

    // Draw tiles
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const tileType = this.mapData[row][col];
        if (tileType !== TILE_TYPES.EMPTY && tileType !== TILE_TYPES.BASE) {
          this.renderer.drawTile(col, row, tileType);
        }
      }
    }

    // Draw base
    this.renderer.drawBase(this.base.x, this.base.y, isBaseDestroyed(this.base));

    // Draw player
    if (!this.player.destroyed && this.player.respawnTimer === 0) {
      this.renderer.drawTank(
        this.player.x,
        this.player.y,
        this.player.direction,
        'player',
        isPlayerInvulnerable(this.player)
      );
    }

    // Draw enemies
    for (const enemy of this.enemies) {
      if (enemy.active) {
        this.renderer.drawTank(enemy.x, enemy.y, enemy.direction, 'enemy', false);
      }
    }

    // Draw bullets
    for (const bullet of this.bullets) {
      this.renderer.drawBullet(bullet.x, bullet.y, bullet.direction);
    }

    // Draw UI
    const remaining = this.enemyQueue.length + this.enemies.filter(e => e.active).length;
    this.renderer.drawUI(this.score, this.player.lives, remaining);

    // Draw game over overlay
    if (this.state.status === GAME_STATES.GAMEOVER) {
      this.renderer.drawGameOver(this.state.result);
    }
  }
}
