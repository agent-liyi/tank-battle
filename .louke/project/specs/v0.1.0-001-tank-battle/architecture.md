# 坦克大战 — Architecture

- **Spec ID**: v0.1.0-001-tank-battle

## §1 High-Level Architecture

### 架构概览

```
┌──────────────────────────────────────────────────────────────┐
│                        index.html                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                     main.js (入口)                       │ │
│  │  初始化 Game、创建 Canvas、启动游戏循环                    │ │
│  └────────────────────────┬────────────────────────────────┘ │
│                           │                                   │
│  ┌────────────────────────▼────────────────────────────────┐ │
│  │                   Game (game.js)                         │ │
│  │  主控制器，管理 GameState、实体集合、游戏循环              │ │
│  │                                                          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │ │
│  │  │  Input   │  │  Renderer│  │   UI     │               │ │
│  │  │ (DOM)    │  │ (Canvas) │  │ (Canvas) │               │ │
│  │  └────┬─────┘  └────▲─────┘  └────▲─────┘               │ │
│  │       │             │             │                      │ │
│  │  ┌────▼─────────────▼─────────────▼──────┐               │ │
│  │  │            Game Loop                   │               │ │
│  │  │  input.parse() → update() → render()  │               │ │
│  │  └────┬─────────────┬──────────────┬─────┘               │ │
│  │       │             │              │                     │ │
│  └───────┼─────────────┼──────────────┼─────────────────────┘ │
│          │             │              │                       │
│  ┌───────▼─────────────▼──────────────▼─────────────────────┐ │
│  │                   Pure Logic Layer                        │ │
│  │  ┌──────┐ ┌──────┐ ┌────────┐ ┌──────┐ ┌──────┐         │ │
│  │  │ Map  │ │Tank  │ │Bullet  │ │Colli-│ │Score │         │ │
│  │  │      │ │(move)│ │(update)│ │sion  │ │      │         │ │
│  │  └──────┘ └──────┘ └────────┘ └──────┘ └──────┘         │ │
│  │  ┌──────┐ ┌──────┐ ┌────────┐ ┌──────┐                 │ │
│  │  │Player│ │Enemy │ │ Base   │ │ Life │                 │ │
│  │  │      │ │  +AI │ │        │ │      │                 │ │
│  │  └──────┘ └──────┘ └────────┘ └──────┘                 │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

依赖方向: Game ──→ Pure Logic ──→ constants
           Game ──→ Input / Renderer / UI (浏览器 API)
           Input / Renderer / UI 之间无依赖
           Pure Logic 模块之间无直接依赖 (通过 Game 编排)
```

### 数据流

```
键盘事件 → Input (keydown/keyup → 按键状态集)
                │
                ▼
          Game.update()
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
  Player     Enemy+AI    Bullets
  (从Input   (RNG注入    (位置更新
   读方向)    方向/射击)    + 边界检测)
    │           │           │
    └───────────┼───────────┘
                ▼
          Collision (AABB)
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
  Score++    Life--     Game Over?
  (击毁敌人)  (被击中)   (条件检测)
                │
                ▼
          Renderer.draw()
    ┌───────────┼───────────┐
    ▼           ▼           ▼
  Map Tiles   Entities    UI Overlay
  (13x13)    (Tanks +     (Score, Lives,
              Bullets)     Game Over)
```

## 模块划分

### §2.1 Game — 主控制器 (src/js/game.js)

- **职责**: 管理游戏状态机、实体集合、编排 update/render 循环
- **接口**:
  - `class Game(scheduler, renderer, input, mapFactory)`
  - `init()` — 初始化/重置所有状态
  - `start()` — 启动游戏循环
  - `stop()` — 停止循环
  - `reset()` — 重置游戏到初始状态
- **依赖**: scheduler (rAF 注入), renderer, input, map (数据), constants
- **状态**: GameState { status: 'playing'|'gameover', result: 'victory'|'defeat'|null }

### §2.2 Renderer — Canvas 渲染 (src/js/renderer.js)

- **职责**: 封装所有 Canvas 2D API 调用，绘制地图、实体、UI
- **接口**:
  - `class Renderer(canvas)`
  - `clear()` — 清空画布
  - `drawTile(x, y, tileType)` — 绘制单个地图块
  - `drawTank(x, y, direction, type, isInvulnerable)` — 绘制坦克
  - `drawBullet(x, y, direction)` — 绘制子弹
  - `drawBase(x, y, isDestroyed)` — 绘制基地
  - `drawUI(score, lives, enemiesRemaining)` — 绘制 HUD
  - `drawGameOver(result)` — 绘制游戏结束画面
- **依赖**: CanvasRenderingContext2D, constants
- **状态**: 无状态（纯渲染函数），持有 canvas context 引用

### §2.3 Input — 键盘输入 (src/js/input.js)

- **职责**: 监听键盘事件，维护当前按键状态，提供方向查询
- **接口**:
  - `class Input()`
  - `init()` — 绑定 keydown/keyup 到 window
  - `destroy()` — 解绑事件
  - `getDirection()` — 返回当前方向 {x: -1|0|1, y: -1|0|1}
  - `isShoot()` — 返回是否按下发射键
  - `isRestart()` — 返回是否按下 Enter
  - `consumeShoot()` — 消费发射事件（边缘触发）
- **依赖**: window (DOM), constants (键位映射)
- **状态**: keysPressed: Set<string>, shootPressed: boolean

### §2.4 Map — 地图管理 (src/js/map.js)

- **职责**: 地图数据加载、tile 类型查询、通行性判断（纯函数模块）
- **接口**:
  - `getTileAt(mapData, col, row)` → tileType
  - `setTileAt(mapData, col, row, tileType)` → newMapData
  - `isPassable(tileType)` → boolean
  - `isDestructible(tileType)` → boolean
  - `loadLevel(levelData)` → mapData
  - `getDefaultLevel()` → levelData (预定义的13x13数组)
- **依赖**: constants (TILE_TYPES)
- **状态**: 纯函数，无内部状态

### §2.5 Player — 玩家坦克 (src/js/player.js)

- **职责**: 管理玩家实体状态，包括位置、方向、生命、无敌状态
- **接口**:
  - `createPlayer(position)` → playerState
  - `updatePlayer(player, direction, mapData, enemies, bullets)` → { player, event? }
  - `playerHit(player)` → { player, event? }
  - `isPlayerInvulnerable(player)` → boolean
- **依赖**: constants, Tank 工具（位置计算混合）, Map
- **状态**: { x, y, direction, lives, invulnerabilityTimer, respawnTimer, destroyed }

### §2.6 Enemy — 敌方坦克 + AI (src/js/enemy.js)

- **职责**: 敌方坦克工厂、AI 行为（方向选择、射击决策）、生成管理
- **接口**:
  - `createEnemy(position, type)`: EnemyState
  - `updateEnemy(enemy, mapData, rng)`: updatedEnemy
  - `enemyAI(enemy, mapData, rng)`: { newDirection, shouldShoot }
  - `spawnEnemyQueue(activeEnemies, queue, spawnPoints, playerPosition, rng)`: { enemies, updatedQueue }
  - `isEnemyDestroyed(enemy)`: boolean
- **依赖**: constants, Tank 工具, Map, Bullet
- **状态**: EnemyState { x, y, direction, type, active, directionTimer, shootTimer }

### §2.7 Bullet — 子弹管理 (src/js/bullet.js)

- **职责**: 子弹工厂、位置更新、边界检测、冷却管理（纯函数）
- **接口**:
  - `createBullet(x, y, direction, owner)`: bullet
  - `updateBullet(bullet)`: bullet (更新位置)
  - `isBulletOutOfBounds(bullet)`: boolean
  - `canShoot(activeBullet, lastShotFrame, currentFrame, cooldown)`: boolean
  - `getBulletBoundingBox(bullet)`: {x, y, w, h}
- **依赖**: constants (BULLET_SIZE, CANVAS_SIZE, TILE_SIZE)
- **状态**: Bullet { x, y, direction, owner, speed }
  - x, y 使用像素坐标（浮点数精确位置）

### §2.8 Collision — 碰撞检测 (src/js/collision.js)

- **职责**: AABB 碰撞检测与结果解决（纯函数）
- **接口**:
  - `aabbCollision(a, b)` → boolean
  - `bulletVsTile(bullet, tileCol, tileRow, mapData)`: { bulletDestroyed, tileChanged, newTileType? }
  - `bulletVsTank(bullet, tank, invulnerable)`: { bulletDestroyed, tankDestroyed }
  - `bulletVsBullet(bulletA, bulletB)`: { bothDestroyed }
  - `bulletVsBase(bullet, base, isEnemyBullet)`: { bulletDestroyed, baseDestroyed }
  - `tankVsTile(x, y, direction, mapData)`: { blocked, newX, newY }
  - `tankVsTank(tankA, tankB, x, y)`: { blocked, newX, newY }
- **依赖**: constants, Map
- **状态**: 纯函数，无状态

### §2.9 Score — 计分系统 (src/js/score.js)

- **职责**: 分数计算与查询（纯函数）
- **接口**:
  - `addScore(currentScore, points)`: newScore
  - `getScoreForEnemy(enemyType)`: points (固定100)
  - `calculateTotalScore(enemiesDestroyed)`: totalPoints
- **依赖**: constants
- **状态**: 纯函数，score 值由 Game 管理

### §2.10 Base — 基地 (src/js/base.js)

- **职责**: 基地状态管理
- **接口**:
  - `createBase(x, y)` → baseState
  - `destroyBase(base)` → baseState
  - `isBaseDestroyed(base)` → boolean
- **依赖**: constants
- **状态**: BaseState { x, y, destroyed }

### §2.11 UI — 界面覆盖层 (src/js/ui.js)

- **职责**: 通过 Canvas 渲染 HUD 和游戏结束画面
- **接口**:
  - `renderHUD(ctx, score, lives, enemiesRemaining, canvasSize)` — 渲染顶部信息栏
  - `renderGameOver(ctx, result, canvasSize)` — 渲染 GAME OVER + VICTORY/DEFEAT
  - `renderStageInfo(ctx, canvasSize)` — 渲染关卡/阶段信息
- **依赖**: CanvasRenderingContext2D, constants
- **状态**: 无状态

## §3 FR Reference Table

| FR | 需求描述 | 对应模块 |
|----|---------|---------|
| FR-0100 | Game Canvas & Rendering | Game, Renderer, UI |
| FR-0200 | Player Tank Movement | Game, Input, Player, Tank, Collision |
| FR-0300 | Player Tank Shooting | Game, Input, Player, Bullet, Collision |
| FR-0400 | Enemy Tank AI | Game, Enemy, Collision |
| FR-0500 | Map Elements | Map, Renderer |
| FR-0600 | Collision Detection | Collision, Bullet, Tank, Map, Player, Enemy |
| FR-0700 | Base (Eagle) Defense | Base, Collision, Renderer |
| FR-0800 | Life System | Game, Player, Renderer |
| FR-0900 | Scoring System | Game, Score, Renderer |
| FR-1000 | Game Over Conditions | Game, UI |

## §4 Data Flow

### §4.1 游戏循环流程

```
                     ┌─────────────────┐
                     │   rAF 回调       │
                     └────────┬────────┘
                              │
                     ┌────────▼────────┐
                     │ 计算 deltaTime   │ 固定步长: 1/60s
                     └────────┬────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
      ┌───────────┐   ┌───────────┐   ┌───────────┐
      │ 1. Input   │   │ 2. Update │   │ 3. Render │
      │   Processing│   │   Phase   │   │   Phase   │
      └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
            │               │               │
            ▼               ▼               ▼
    direction =         updatePlayer()    renderer.clear()
    input.getDirection() updateEnemies()  drawMapTiles()
    shoot =             updateBullets()   drawTanks()
    input.isShoot()     resolveCollisions() drawBullets()
                        checkGameOver()   drawBase()
                                          ui.renderHUD()
                                          (if gameover) ui.renderGameOver()
```

### §4.2 事件流

```
键盘按下 ───→ Input 更新按键集 ───→ Game.update() 读取方向 ────→ updatePlayer() 更新位置
                                                                ────→ canShoot() 检查冷却
                                                                       → createBullet() 创建子弹

敌人AI(RNG) ───→ enemyAI() 决定方向/射击 ───→ updateEnemy() 更新位置
                                             ────→ createBullet() (敌人子弹)

子弹位置更新 ───→ resolveCollisions():
                  ├── bulletVsTile() → 销毁砖墙 / 反弹钢墙
                  ├── bulletVsTank() → score+100 / life-1
                  ├── bulletVsBase() → gameover defeat
                  ├── bulletVsBullet() → 互相销毁
                  └── tankVsTile/tankVsTank() → 阻止移动

碰撞结果 ───→ checkGameOver():
              ├── enemiesRemaining === 0 → victory
              ├── lives === 0 → defeat
              └── baseDestroyed → defeat
```

## §5 File Structure

```
src/
  index.html                  # 入口 HTML，包含 <canvas>
  css/
    style.css                 # 居中布局样式
  js/
    main.js                   # 应用入口，组装依赖，创建 Game 并启动
    game.js                   # Game 类 — 主控制器/游戏循环
    renderer.js               # Renderer 类 — Canvas 2D 渲染
    input.js                  # Input 类 — 键盘输入管理
    map.js                    # 地图 — 纯函数：数据加载/tile查询
    tank.js                   # 坦克 — 共享的位置/移动计算工具
    player.js                 # 玩家 — 纯函数：生命/无敌/重生
    enemy.js                  # 敌人 — AI 决策/生成管理
    bullet.js                 # 子弹 — 纯函数：创建/更新/边界检测
    collision.js              # 碰撞 — 纯函数：AABB 检测与解析
    score.js                  # 积分 — 纯函数：分数计算
    base.js                   # 基地 — 纯函数：基地状态
    ui.js                     # UI — Canvas HUD 和游戏结束画面渲染
    constants.js              # 全局常量：TILE_SIZE/速度/帧数/边界

tests/
  unit/
    movement.test.js          # AC-004~008, 010, 062
    shooting.test.js          # AC-011~014, 061
    collision.test.js         # AC-021~033, 054
    ai.test.js                # AC-015~020, 059, 065, 056
    map.test.js               # AC-024, 025, 057
    life.test.js              # AC-037~039, 041, 055
    scoring.test.js           # AC-042~044, 055
  integration/
    gameloop.test.js          # AC-002, 063
    input.test.js             # AC-009, 060
    gameover.test.js          # AC-035, 036, 040, 045~048, 064
    canvas.test.js            # AC-001
  e2e/
    scenarios.test.js         # E2E-01 ~ E2E-06
  assets/
    level-data.json           # 预定义的13x13关卡布局数据
```

## §6 Key Design Decisions

### §6.1 纯函数 vs 类的选择

- **纯函数模块**: map, score, collision, bullet, ai, tank, base, player, enemy — 所有核心游戏逻辑均为纯函数，接受输入状态，返回新状态，不依赖 DOM/Canvas。便于 Jest 单元测试，无需 jsdom。
- **类模块**: Game, Renderer, Input — 封装浏览器 API 和副作用。Game 接收 injectable scheduler/rng，Render 接收 injectable canvas context，实现依赖注入。

### §6.2 游戏循环设计

- 使用 `requestAnimationFrame` 驱动的可变帧率循环，但**游戏逻辑使用固定时间步长 (1/60s)**。
- 通过注入 `scheduler` 接口抽象 rAF，测试时注入同步 mock 实现逐帧确定性测试（满足 AC-063）。
- 循环结构:
  ```
  tick(timestamp):
    delta += timestamp - lastTime
    while (delta >= FIXED_STEP):
      update()       // 固定步长逻辑更新
      delta -= FIXED_STEP
    render()         // 尽可能渲染最新状态
    scheduler.rAF(tick)
  ```

### §6.3 碰撞检测算法选择

- 使用 **AABB (Axis-Aligned Bounding Box)** 碰撞检测。
- 每个实体（坦克、子弹、地图块、基地）暴露 `getBoundingBox()` 返回 `{x, y, w, h}`。
- 所有 tile 碰撞通过行列号索引到 `MapData` 数组进行 AABB 比对。
- 碰撞检测在 Game.update() 中统一执行，按优先级顺序：bullet-vs-tile → bullet-vs-tank → bullet-vs-base → bullet-vs-bullet → tank-vs-tile → tank-vs-tank。

### §6.4 坐标系统

- 地图坐标系: (col, row)，范围 [0, 12]，整数索引。
- 像素坐标系: (px, py)，范围 [0, 416]，浮点数。
- 所有实体位置使用像素坐标精确存储，渲染时取整。
- 地图: `px = col * TILE_SIZE`, `py = row * TILE_SIZE`
- 反向: `col = floor(px / TILE_SIZE)`, `row = floor(py / TILE_SIZE)`

### §6.5 依赖注入

- **Scheduler**: `{ requestAnimationFrame(cb): id, cancelAnimationFrame(id) }` — 生产环境用 `window` 实现，测试用同步 mock。
- **RNG**: `{ random(): 0..1, randomInt(min, max): int }` — 生产环境用 `Math.random()`，测试用确定性 seed mock。
- **Renderer**: 接收 `CanvasRenderingContext2D`，测试可注入 mock context 或使用 jsdom。

### §6.6 模块间无直接依赖

- Pure Logic 层所有模块（map, tank, collision, bullet, score, etc.）彼此无 import 依赖，仅 import `constants.js`。
- 所有模块编排由 Game 在 update() 中完成：Game 调用 map 获取 tile 信息，调用 collision 传入 tiles 和 entities，调用 ai 传入 rng。
- 这种架构确保每个纯函数模块可以独立在 Jest 中测试，无需 mock 其他模块。
