# 坦克大战 — 接口

- **Spec ID**: v0.1.0-001-tank-battle

## §1 模块接口

### §1.1 Game (game.js)

```js
/**
 * @class Game
 * @description 主控制器，管理游戏状态机、实体集合、编排 update/render 循环
 *
 * @param {Object} scheduler - rAF 注入接口
 * @param {Object} scheduler.requestAnimationFrame {(cb: Function): number}
 * @param {Object} scheduler.cancelAnimationFrame {(id: number): void}
 * @param {Object} renderer - Renderer 实例
 * @param {Object} input - Input 实例
 * @param {Function} mapFactory - 地图数据工厂函数
 */
class Game {
  /**
   * 初始化/重置所有游戏状态
   * @returns {void}
   */
  init() {}

  /**
   * 启动游戏循环
   * @returns {void}
   */
  start() {}

  /**
   * 停止游戏循环
   * @returns {void}
   */
  stop() {}

  /**
   * 重置游戏到初始状态
   * @returns {void}
   */
  reset() {}
}
```

### §1.2 Renderer (renderer.js)

```js
/**
 * @class Renderer
 * @description 封装所有 Canvas 2D API 调用，绘制地图、实体、UI
 *
 * @param {HTMLCanvasElement} canvas - 游戏画布元素
 */
class Renderer {
  /**
   * 清空画布
   * @returns {void}
   */
  clear() {}

  /**
   * 绘制单个地图块
   * @param {number} x - 像素 x 坐标
   * @param {number} y - 像素 y 坐标
   * @param {TileType} tileType - 地块类型
   * @returns {void}
   */
  drawTile(x, y, tileType) {}

  /**
   * 绘制坦克
   * @param {number} x - 像素 x 坐标
   * @param {number} y - 像素 y 坐标
   * @param {Direction} direction - 朝向
   * @param {'player'|'enemy'} type - 坦克类型
   * @param {boolean} isInvulnerable - 是否处于无敌状态
   * @returns {void}
   */
  drawTank(x, y, direction, type, isInvulnerable) {}

  /**
   * 绘制子弹
   * @param {number} x - 像素 x 坐标
   * @param {number} y - 像素 y 坐标
   * @param {Direction} direction - 子弹方向
   * @returns {void}
   */
  drawBullet(x, y, direction) {}

  /**
   * 绘制基地
   * @param {number} x - 像素 x 坐标
   * @param {number} y - 像素 y 坐标
   * @param {boolean} isDestroyed - 是否已摧毁
   * @returns {void}
   */
  drawBase(x, y, isDestroyed) {}

  /**
   * 绘制 HUD 信息栏
   * @param {number} score - 当前分数
   * @param {number} lives - 剩余生命
   * @param {number} enemiesRemaining - 剩余敌人数量
   * @returns {void}
   */
  drawUI(score, lives, enemiesRemaining) {}

  /**
   * 绘制游戏结束画面
   * @param {'victory'|'defeat'} result - 游戏结果
   * @returns {void}
   */
  drawGameOver(result) {}
}
```

### §1.3 Input (input.js)

```js
/**
 * @class Input
 * @description 监听键盘事件，维护当前按键状态，提供方向查询
 */
class Input {
  /**
   * 绑定 keydown/keyup 事件到 window
   * @returns {void}
   */
  init() {}

  /**
   * 解绑键盘事件
   * @returns {void}
   */
  destroy() {}

  /**
   * 获取当前移动方向
   * @returns {Direction} 方向向量 {x: -1|0|1, y: -1|0|1}
   */
  getDirection() {}

  /**
   * 是否按下射击键
   * @returns {boolean}
   */
  isShoot() {}

  /**
   * 是否按下重新开始键 (Enter)
   * @returns {boolean}
   */
  isRestart() {}

  /**
   * 消费射击事件（边缘触发，防止按住时连射）
   * @returns {void}
   */
  consumeShoot() {}
}
```

### §1.4 Map (map.js)

```js
/**
 * 获取地图指定位置的 tile 类型
 * @param {MapData} mapData - 13x13 地图数据
 * @param {number} col - 列索引 [0, 12]
 * @param {number} row - 行索引 [0, 12]
 * @returns {TileType} 地块类型
 */
function getTileAt(mapData, col, row) {}

/**
 * 设置地图指定位置的 tile 类型，返回新地图数据
 * @param {MapData} mapData - 13x13 地图数据
 * @param {number} col - 列索引 [0, 12]
 * @param {number} row - 行索引 [0, 12]
 * @param {TileType} tileType - 新的地块类型
 * @returns {MapData} 修改后的新地图数据（不修改原数组）
 */
function setTileAt(mapData, col, row, tileType) {}

/**
 * 判断 tile 类型是否可通行（坦克可穿过）
 * @param {TileType} tileType - 地块类型
 * @returns {boolean} true 表示可通行（empty, forest）
 */
function isPassable(tileType) {}

/**
 * 判断 tile 类型是否可被子弹摧毁
 * @param {TileType} tileType - 地块类型
 * @returns {boolean} true 表示可摧毁（brick）
 */
function isDestructible(tileType) {}

/**
 * 加载关卡数据
 * @param {LevelData} levelData - 关卡布局数据
 * @returns {MapData} 13x13 地图数据
 */
function loadLevel(levelData) {}

/**
 * 获取默认关卡布局数据
 * @returns {LevelData} 预定义的 13x13 数组
 */
function getDefaultLevel() {}
```

### §1.5 Player (player.js)

```js
/**
 * 创建玩家实体
 * @param {{x: number, y: number}} position - 初始像素坐标
 * @returns {PlayerState} 玩家状态对象
 */
function createPlayer(position) {}

/**
 * 更新玩家状态（处理移动、射击、无敌计时、重生计时）
 * @param {PlayerState} player - 当前玩家状态
 * @param {Direction} direction - 输入方向（来自 Input.getDirection()）
 * @param {MapData} mapData - 地图数据（用于碰撞前检查）
 * @param {EnemyState[]} enemies - 敌方坦克列表（用于碰撞前检查）
 * @param {Bullet[]} bullets - 活跃子弹列表
 * @returns {{ player: PlayerState, event?: 'shoot'|'respawn'|'hit' }} 更新后的玩家状态及可选事件
 */
function updatePlayer(player, direction, mapData, enemies, bullets) {}

/**
 * 玩家被子弹击中处理
 * @param {PlayerState} player - 当前玩家状态
 * @returns {{ player: PlayerState, event?: 'lifeLost' }} 更新后的玩家状态及可选事件
 */
function playerHit(player) {}

/**
 * 判断玩家是否处于无敌状态
 * @param {PlayerState} player - 玩家状态
 * @returns {boolean}
 */
function isPlayerInvulnerable(player) {}
```

### §1.6 Enemy (enemy.js)

```js
/**
 * 创建敌方坦克
 * @param {{x: number, y: number}} position - 初始像素坐标
 * @param {'basic'|'fast'|'power'|'armor'} type - 敌人类型
 * @returns {EnemyState} 敌人状态对象
 */
function createEnemy(position, type) {}

/**
 * 更新敌人状态（移动、射击计时更新）
 * @param {EnemyState} enemy - 当前敌人状态
 * @param {MapData} mapData - 地图数据
 * @param {Object} rng - 随机数生成器注入
 * @param {Object} rng.random {(): number} - [0, 1) 浮点数
 * @param {Object} rng.randomInt {(min: number, max: number): number} - [min, max] 整数
 * @returns {EnemyState} 更新后的敌人状态
 */
function updateEnemy(enemy, mapData, rng) {}

/**
 * 敌人 AI 决策：方向选择与射击判断
 * @param {EnemyState} enemy - 当前敌人状态
 * @param {MapData} mapData - 地图数据
 * @param {Object} rng - 随机数生成器注入
 * @returns {{ newDirection: Direction, shouldShoot: boolean }} AI 决策结果
 */
function enemyAI(enemy, mapData, rng) {}

/**
 * 管理敌人生成队列（检查生成条件、选择出生点、激活新敌人）
 * @param {EnemyState[]} activeEnemies - 当前活跃敌人列表
 * @param {EnemyState[]} queue - 待生成敌人队列
 * @param {{x: number, y: number}[]} spawnPoints - 出生点位置列表
 * @param {{x: number, y: number}} playerPosition - 玩家位置（避免出生点冲突）
 * @param {Object} rng - 随机数生成器注入
 * @returns {{ enemies: EnemyState[], updatedQueue: EnemyState[] }} 更新后的活跃列表和队列
 */
function spawnEnemyQueue(activeEnemies, queue, spawnPoints, playerPosition, rng) {}

/**
 * 判断敌人是否已激活（在场）
 * @param {EnemyState} enemy - 敌人状态
 * @returns {boolean} true 表示敌人在场上活跃
 */
function isEnemyActive(enemy) {}

/**
 * 判断敌人是否已被摧毁
 * @param {EnemyState} enemy - 敌人状态
 * @returns {boolean} true 表示敌人已被摧毁
 */
function isEnemyDestroyed(enemy) {}
```

### §1.7 Bullet (bullet.js)

```js
/**
 * 创建子弹
 * @param {number} x - 发射点像素 x 坐标
 * @param {number} y - 发射点像素 y 坐标
 * @param {Direction} direction - 子弹飞行方向
 * @param {'player'|'enemy'} owner - 子弹所有者
 * @returns {Bullet} 子弹对象
 */
function createBullet(x, y, direction, owner) {}

/**
 * 更新子弹位置（按方向和速度移动）
 * @param {Bullet} bullet - 当前子弹
 * @returns {Bullet} 更新位置后的子弹
 */
function updateBullet(bullet) {}

/**
 * 判断子弹是否飞出画布边界
 * @param {Bullet} bullet - 子弹
 * @returns {boolean} true 表示已越界
 */
function isBulletOutOfBounds(bullet) {}

/**
 * 检查是否可以发射子弹（冷却逻辑）
 * @param {Bullet|null} activeBullet - 当前活跃子弹（null 表示无子弹在飞行）
 * @param {number} lastShotFrame - 上次射击帧号
 * @param {number} currentFrame - 当前帧号
 * @param {number} cooldown - 冷却帧数
 * @returns {boolean} true 表示可以射击
 */
function canShoot(activeBullet, lastShotFrame, currentFrame, cooldown) {}

/**
 * 获取子弹的包围盒
 * @param {Bullet} bullet - 子弹对象
 * @returns {{x: number, y: number, w: number, h: number}} 包围盒（像素坐标+尺寸）
 */
function getBulletBoundingBox(bullet) {}
```

### §1.8 Collision (collision.js)

```js
/**
 * AABB 碰撞检测
 * @param {{x: number, y: number, w: number, h: number}} a - 实体 A 的包围盒
 * @param {{x: number, y: number, w: number, h: number}} b - 实体 B 的包围盒
 * @returns {boolean} true 表示发生碰撞
 */
function aabbCollision(a, b) {}

/**
 * 子弹与地图块的碰撞检测
 * @param {Bullet} bullet - 子弹对象
 * @param {number} tileCol - 目标地块列索引
 * @param {number} tileRow - 目标地块行索引
 * @param {MapData} mapData - 地图数据
 * @returns {{ bulletDestroyed: boolean, tileChanged: boolean, newTileType?: TileType }}
 *   bulletDestroyed: 子弹是否被销毁
 *   tileChanged: 地块是否被改变
 *   newTileType: 改变后的地块类型（tileChanged 为 true 时提供）
 */
function bulletVsTile(bullet, tileCol, tileRow, mapData) {}

/**
 * 子弹与坦克的碰撞检测
 * @param {Bullet} bullet - 子弹对象
 * @param {PlayerState|EnemyState} tank - 坦克状态
 * @param {boolean} invulnerable - 坦克是否无敌
 * @returns {{ bulletDestroyed: boolean, tankDestroyed: boolean }}
 */
function bulletVsTank(bullet, tank, invulnerable) {}

/**
 * 子弹与子弹的碰撞检测
 * @param {Bullet} bulletA - 子弹 A
 * @param {Bullet} bulletB - 子弹 B
 * @returns {{ bothDestroyed: boolean }} 双方是否同时销毁
 */
function bulletVsBullet(bulletA, bulletB) {}

/**
 * 子弹与基地的碰撞检测
 * @param {Bullet} bullet - 子弹对象
 * @param {BaseState} base - 基地状态
 * @param {boolean} isEnemyBullet - 是否为敌方子弹（玩家子弹不打基地）
 * @returns {{ bulletDestroyed: boolean, baseDestroyed: boolean }}
 */
function bulletVsBase(bullet, base, isEnemyBullet) {}

/**
 * 坦克移动时与地图块的碰撞检测
 * @param {number} x - 坦克目标 x 坐标
 * @param {number} y - 坦克目标 y 坐标
 * @param {Direction} direction - 移动方向
 * @param {MapData} mapData - 地图数据
 * @returns {{ blocked: boolean, newX: number, newY: number }}
 *   blocked: 移动是否被阻挡
 *   newX/newY: 修正后的坐标（被阻挡时回退到原位置）
 */
function tankVsTile(x, y, direction, mapData) {}

/**
 * 坦克与坦克的碰撞检测
 * @param {PlayerState|EnemyState} tankA - 坦克 A
 * @param {PlayerState|EnemyState} tankB - 坦克 B
 * @param {number} x - 坦克 A 目标 x 坐标
 * @param {number} y - 坦克 A 目标 y 坐标
 * @returns {{ blocked: boolean, newX: number, newY: number }}
 */
function tankVsTank(tankA, tankB, x, y) {}
```

### §1.9 Score (score.js)

```js
/**
 * 增加分数
 * @param {number} currentScore - 当前分数
 * @param {number} points - 增加的分数
 * @returns {number} 新分数
 */
function addScore(currentScore, points) {}

/**
 * 根据敌人类型获取击杀分数
 * @param {'basic'|'fast'|'power'|'armor'} enemyType - 敌人类型
 * @returns {number} 对应分数（固定 100）
 */
function getScoreForEnemy(enemyType) {}

/**
 * 计算摧毁指定数量敌人的总分
 * @param {number} enemiesDestroyed - 摧毁敌人数量
 * @returns {number} 总分数
 */
function calculateTotalScore(enemiesDestroyed) {}
```

### §1.10 Base (base.js)

```js
/**
 * 创建基地
 * @param {number} x - 像素 x 坐标
 * @param {number} y - 像素 y 坐标
 * @returns {BaseState} 基地状态对象
 */
function createBase(x, y) {}

/**
 * 摧毁基地
 * @param {BaseState} base - 基地状态
 * @returns {BaseState} 更新后的基地状态（destroyed = true）
 */
function destroyBase(base) {}

/**
 * 判断基地是否已被摧毁
 * @param {BaseState} base - 基地状态
 * @returns {boolean}
 */
function isBaseDestroyed(base) {}
```

### §1.11 UI (ui.js)

```js
/**
 * 渲染 HUD 信息栏
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D 渲染上下文
 * @param {number} score - 当前分数
 * @param {number} lives - 剩余生命
 * @param {number} enemiesRemaining - 剩余敌人数量
 * @param {{w: number, h: number}} canvasSize - 画布尺寸
 * @returns {void}
 */
function renderHUD(ctx, score, lives, enemiesRemaining, canvasSize) {}

/**
 * 渲染游戏结束画面
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D 渲染上下文
 * @param {'victory'|'defeat'} result - 游戏结果
 * @param {{w: number, h: number}} canvasSize - 画布尺寸
 * @returns {void}
 */
function renderGameOver(ctx, result, canvasSize) {}

/**
 * 渲染关卡/阶段信息
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D 渲染上下文
 * @param {{w: number, h: number}} canvasSize - 画布尺寸
 * @returns {void}
 */
function renderStageInfo(ctx, canvasSize) {}
```

### §1.12 Tank (tank.js)

```js
/**
 * 根据 direction 计算坦克移动量
 * @param {Direction} direction - 移动方向
 * @param {number} speed - 坦克速度（像素/帧）
 * @returns {{dx: number, dy: number}} x 和 y 轴的位移量
 */
function calculateMovement(direction, speed) {}

/**
 * 获取坦克的包围盒
 * @param {PlayerState|EnemyState} tank - 坦克状态
 * @returns {{x: number, y: number, w: number, h: number}} 包围盒
 */
function getTankBoundingBox(tank) {}

/**
 * 判断坐标是否在画布边界内
 * @param {number} x - 像素 x 坐标
 * @param {number} y - 像素 y 坐标
 * @returns {boolean} true 表示在边界内
 */
function isWithinBounds(x, y) {}
```

## §2 数据结构

```typescript
// 地块类型
type TileType = 'empty' | 'brick' | 'steel' | 'water' | 'forest' | 'base';

// 移动和射击的方向向量
// 同一时间仅一个轴非零（四方向移动）
type Direction = { x: -1 | 0 | 1, y: -1 | 0 | 1 };

// 13x13 网格，行 × 列
// mapData[row][col]
type MapData = TileType[][];

// 关卡配置数据（预定义布局）
type LevelData = number[][]; // 映射到 TileType 的数字地块编码

// 顶层游戏状态机
type GameState = {
  status: 'playing' | 'gameover' | 'paused';
  result: 'victory' | 'defeat' | null;
};

// 玩家坦克状态
type PlayerState = {
  x: number;           // 像素 x 坐标（浮点）
  y: number;           // 像素 y 坐标（浮点）
  direction: Direction; // 当前朝向
  lives: number;       // 剩余生命（初始为 3）
  invulnerabilityTimer: number; // 无敌剩余帧数（0 = 无）
  respawnTimer: number; // 死亡后重生剩余帧数（0 = 存活）
  destroyed: boolean;  // 坦克处于摧毁/死亡状态时为 true
};

// 敌方坦克状态
type EnemyState = {
  x: number;           // 像素 x 坐标（浮点）
  y: number;           // 像素 y 坐标（浮点）
  direction: Direction; // 当前朝向
  type: 'basic' | 'fast' | 'power' | 'armor';
  active: boolean;     // 在场上时为 true
  directionTimer: number; // 下次改变方向剩余帧数（AI）
  shootTimer: number;  // 下次允许射击剩余帧数（AI 冷却时间）
};

// 子弹状态
type Bullet = {
  x: number;           // 像素 x 坐标（浮点）
  y: number;           // 像素 y 坐标（浮点）
  direction: Direction; // 飞行方向
  owner: 'player' | 'enemy'; // 此子弹的发射者
  speed: number;       // 像素/帧
  active: boolean;     // 飞行中为 true
};

// 基地状态
type BaseState = {
  x: number;           // 像素 x 坐标
  y: number;           // 像素 y 坐标
  destroyed: boolean;  // 摧毁时为 true -> 游戏结束（失败）
};

// 用于确定性测试的 RNG 注入接口
type RNG = {
  random(): number;           // [0, 1)
  randomInt(min: number, max: number): number; // [min, max] 闭区间整数
};

// 用于测试的 Scheduler 注入接口
type Scheduler = {
  requestAnimationFrame(cb: (timestamp: number) => void): number;
  cancelAnimationFrame(id: number): void;
};

// 画布尺寸
type CanvasSize = {
  w: number; // = TILE_SIZE * 13 = 416（加 HUD 区域）
  h: number;
};
```

## §3 事件契约

### §3.1 Game → Input

```
Game.update() 调用:
  - Input.getDirection()     → Direction    (每帧读取方向)
  - Input.isShoot()          → boolean      (检查射击意图)
  - Input.consumeShoot()     → void         (消费射击事件)
  - Input.isRestart()        → boolean      (检查重新开始)
```

### §3.2 Game → Renderer

```
Game.render() 调用顺序:
  1. Renderer.clear()                        → void (清空画布)
  2. Renderer.drawTile(x, y, tileType)       → void (遍历 mapData 绘制所有地块)
  3. Renderer.drawTank(x, y, dir, type, inv) → void (绘制玩家 + 每个活跃敌人)
  4. Renderer.drawBullet(x, y, dir)          → void (遍历绘制所有活跃子弹)
  5. Renderer.drawBase(x, y, destroyed)      → void (绘制基地)
  6. Renderer.drawUI(score, lives, enemies)  → void (绘制 HUD)
  7. [若游戏结束] Renderer.drawGameOver(result) → void (游戏结束画面)
```

### §3.3 Game → 纯逻辑层

```
Game.update() 数据流:

  1. player.js:
     updatePlayer(playerState, Input.getDirection(), mapData, enemies, bullets)
       → { player: PlayerState, event?: 'shoot'|'respawn'|'hit' }

  2. enemy.js:
     spawnEnemyQueue(activeEnemies, queue, spawnPoints, playerPosition, rng)
       → { enemies: EnemyState[], updatedQueue: EnemyState[] }
     对每个活跃敌人:
       updateEnemy(enemy, mapData, rng)
         → EnemyState

  3. bullet.js:
     对每颗活跃子弹:
       updateBullet(bullet) → Bullet
       isBulletOutOfBounds(bullet) → boolean → 标记销毁

  4. collision.js (按优先级顺序):
     对每个 子弹 × 地块:
       bulletVsTile(bullet, col, row, mapData)
         → { bulletDestroyed, tileChanged, newTileType? }
     对每个 子弹 × 坦克:
       bulletVsTank(bullet, tank, invulnerable)
         → { bulletDestroyed, tankDestroyed }
     对每个 子弹 × 基地:
       bulletVsBase(bullet, base, isEnemyBullet)
         → { bulletDestroyed, baseDestroyed }
     对每个 子弹 × 子弹:
       bulletVsBullet(bulletA, bulletB)
         → { bothDestroyed }
     对每个 坦克 × 地块:
       tankVsTile(x, y, direction, mapData)
         → { blocked, newX, newY }
     对每个 坦克 × 坦克:
       tankVsTank(tankA, tankB, x, y)
         → { blocked, newX, newY }

  5. score.js:
     对每个被摧毁的敌人:
       addScore(currentScore, getScoreForEnemy(enemy.type))
         → newScore

  6. player.js / base.js:
     对每次玩家被击中:
       playerHit(player) → { player, event? }
     对每次基地被击中:
       destroyBase(base) → BaseState

  7. 游戏结束检测:
     剩余敌人 === 0           → 胜利
     剩余生命 === 0           → 失败
     isBaseDestroyed(base)    → 失败
```

### §3.4 纯逻辑模块约束

- 所有纯函数模块（map, player, enemy, bullet, collision, score, base）**不触发事件**，通过**返回值传递状态变更**
- 纯函数模块之间**无直接 import 依赖**，仅依赖 `constants.js`
- 副作用（创建子弹、更新分数）由 Game 根据纯函数的返回值执行
- RNG 和 Scheduler 通过 Game 注入，纯函数不直接访问 `Math.random()` 或 `window`
