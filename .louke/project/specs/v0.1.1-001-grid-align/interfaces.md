# 坦克大战 — 网格对齐 Interfaces

- **Spec ID**: v0.1.1-001-grid-align
- **基于版本**: v0.1.0-001-tank-battle (已发布)
- **创建日期**: 2026-07-16

## 接口范围（Interface Scope）

本文档定义 v0.1.1 网格对齐 spec 的**增量接口契约**：
- **新增**：`snapToGrid(pixel)` — `tank.js` 导出的纯函数
- **变更**：`updatePlayer(player, direction, mapData, enemies, bullets)` — 内部增加网格对齐逻辑
- **变更**：`updateEnemy(enemy, mapData, rng)` — 内部增加网格对齐逻辑（含撞墙变向的二次 snap）

未列出的 v0.1.0 接口保持不变。

> 本文档为**增量接口契约**，仅描述 v0.1.1 网格对齐 spec 引入的新增 / 变更可观察契约。
> 基础接口（Game / Renderer / Input / Map / Collision / Bullet / Score / Base / UI / Tank 既有工具函数）
> 见 `v0.1.0-001-tank-battle/interfaces.md`，本 spec 不修改这些接口的签名。
>
> Devon 写单元 / 集成测试、Shield 写 e2e 均以本文档 + v0.1.0 interfaces.md 为唯一契约来源。
> 当本文档与 v0.1.0 interfaces.md 描述存在差异时，**以本文档为准**（v0.1.1 范围内）。

## §1 新增接口

### §1.1 snapToGrid (tank.js)

```js
/**
 * 将像素坐标对齐到最近的网格线（TILE_SIZE 的整数倍），并钳制到有效坦克边界内。
 * 用于坦克转向时垂直轴坐标的对齐。
 *
 * @param {number} pixel - 待对齐的像素坐标（任意实数，含负数与超界值）
 * @returns {number} 对齐后的像素坐标
 *
 * @公式 result = clamp( Math.round(pixel / TILE_SIZE) * TILE_SIZE, 0, maxAligned )
 *        其中 maxAligned = floor((CANVAS_SIZE - TANK_SIZE) / TILE_SIZE) * TILE_SIZE = 992
 *
 * @返回值不变式:
 *   1. result 是 TILE_SIZE(32) 的整数倍
 *   2. 0 <= result <= 992
 *   3. result + TANK_SIZE(30) <= CANVAS_SIZE(1024)
 *
 * @性质 纯函数，无副作用，不依赖外部可变状态（仅依赖 constants.js 常量）
 *
 * @覆盖 AC AC-NFR1020-01 (单元测试), AC-FR1300-02 (边界性质)
 */
function snapToGrid(pixel) {}
```

**输入域与输出示例**（AC-NFR1020-01 Ground Truth；期望值由 `Math.round(pixel/32)*32` 在测试内重算，非 impl 输出）：

| 输入 pixel | `Math.round(pixel/32)*32` | clamp 后输出 | 说明 |
|-----------|---------------------------|-------------|------|
| 0 | 0 | 0 | 已在网格线 |
| 15 | 0 | 0 | 向下对齐到 0 |
| 16 | 32 | 32 | `.5` 向上取整 |
| 17 | 32 | 32 | 向上对齐到 32 |
| 32 | 32 | 32 | 已在网格线 |
| 100 | 96 | 96 | 向下对齐 |
| 130 | 128 | 128 | 向下对齐 |
| 1005 | 992 | 992 | 近边界，天然在界内 |
| -10 | -0 → 0 | 0 | 负输入钳制到 0 |
| 2000 | 2016 | 992 | 超界钳制到 maxAligned |

**不变式表**（AC-FR1300-02）：

| # | 不变量 | 对任意实数 pixel |
|---|--------|-----------------|
| INV-1 | `snapToGrid(pixel) % TILE_SIZE === 0` | 成立 |
| INV-2 | `snapToGrid(pixel) >= 0` | 成立 |
| INV-3 | `snapToGrid(pixel) + TANK_SIZE <= CANVAS_SIZE` | 成立 |
| INV-4 | 纯函数：同输入同输出，无副作用 | 成立 |

---

## §2 变更接口（行为契约增量）

> 以下函数签名与 v0.1.0 一致。本节仅描述 v0.1.1 新增的"网格对齐"行为契约。
> 函数签名、参数、返回值结构以本节为准（v0.1.1 范围内）。

### §2.1 updatePlayer (player.js)

```js
/**
 * 更新玩家状态。v0.1.1 新增：方向变更时触发网格对齐。
 *
 * @param {PlayerState} player - 当前玩家状态
 * @param {Direction} direction - 输入方向（来自 Input.getDirection()，可为 NONE）
 * @param {MapData} mapData - 地图数据
 * @param {EnemyState[]} enemies - 敌方坦克列表
 * @param {Bullet[]} bullets - 活跃子弹列表
 * @returns {PlayerState} 更新后的玩家状态（含对齐后的 x / y）
 *
 * @返回字段契约（测试断言落点）:
 *   - x: number         snap + 位移后的 x 坐标
 *   - y: number         snap + 位移后的 y 坐标
 *   - direction: Direction  本帧有效方向（direction 为 NONE 时保留旧方向）
 *
 * @v0.1.1 网格对齐行为:
 *   当 direction 非 NONE 且发生"转向"时，垂直于新方向的坐标先 snapToGrid，再叠加位移。
 *   "转向"触发条件（满足任一）：
 *     (a) 旧方向水平(LEFT/RIGHT) → 新方向垂直(UP/DOWN)：snap X
 *     (b) 旧方向垂直(UP/DOWN) → 新方向水平(LEFT/RIGHT)：snap Y
 *     (c) 旧方向 NONE → 新方向任意非 NONE：snap 对应轴（初始方向视为转向）
 *   不触发 snap 的情况：
 *     - direction 为 NONE（不进入移动分支）
 *     - 新旧方向同轴（同向 或 180° 反向）
 *
 * @执行顺序 方向变更检测 → snap → calculateMovement 位移 → isWithinBounds 边界检查
 *
 * @覆盖 AC AC-FR1100-01~06, AC-FR1300-01, AC-FR1400-01, AC-NFR1020-02
 */
function updatePlayer(player, direction, mapData, enemies, bullets) {}
```

**返回值观察契约**（test-plan §3.1 断言落点 = 返回对象 `x` / `y` / `direction` 字段）：

| AC | 输入 (x, y, oldDir → newDir) | 期望（snap 后，spec 公式重算） | 断言字段 |
|----|------------------------------|-------------------------------|---------|
| AC-FR1100-01 | (100, 68, RIGHT → UP) | x = 96 | x |
| AC-FR1100-02 | (96, 50, UP → RIGHT) | y = 64 | y |
| AC-FR1100-03 | (80, 80, RIGHT → RIGHT) | x = 84（仅 +PLAYER_SPEED）, y = 80 | x, y |
| AC-FR1100-04 | (200, 200, NONE → UP) | x = 192 | x |
| AC-FR1100-05 | (65, 130, DOWN → LEFT) | y = 128 | y |
| AC-FR1100-06 | (128, 64, RIGHT → UP) | x = 128（不变） | x |
| AC-FR1300-01 | (1005, 68, RIGHT → UP) | x = 992, 且 992 + 30 ≤ 1024 | x |
| AC-FR1400-01 | (128, 64, RIGHT × 8 帧) | (160, 64) | x, y |

> 上表期望值为 spec 公式 `Math.round(x/32)*32` 重算结果（test-plan §7.5 Ground Truth），非 impl 输出，满足反作弊约束。

### §2.2 updateEnemy (enemy.js)

```js
/**
 * 更新敌人状态。v0.1.1 新增：AI 方向变更时触发网格对齐。
 *
 * @param {EnemyState} enemy - 当前敌人状态
 * @param {MapData} mapData - 地图数据
 * @param {RNG} rng - 随机数生成器注入
 *        rng.random(): number          [0, 1) 浮点
 *        rng.randomInt(min, max): number  [min, max] 闭区间整数
 * @returns {EnemyState} 更新后的敌人状态（含对齐后的 x / y）
 *
 * @返回字段契约（测试断言落点）:
 *   - x: number         snap + 位移后的 x 坐标
 *   - y: number         snap + 位移后的 y 坐标
 *   - direction: Direction  AI 决策后的方向
 *
 * @v0.1.1 网格对齐行为（两类方向变更触发 snap）:
 *   (1) AI 定时器触发的随机变向（directionTimer <= 0）：
 *        - 水平 → 垂直：snap X
 *        - 垂直 → 水平：snap Y
 *        - 同轴 / 180°：不 snap
 *   (2) 撞边界后的变向（isWithinBounds 失败）：
 *        - 撞墙前方向水平、新方向垂直：snap X
 *        - 撞墙前方向垂直、新方向水平：snap Y
 *        - 同轴 / 180°：不 snap
 *        - 撞墙本帧坦克不移动（坐标回退到撞墙前位置 + snap 修正）
 *
 * @确定性测试 通过 mock rng（{ randomInt: (a, b) => fixedIndex }）控制 AI 方向选择
 *
 * @覆盖 AC AC-FR1200-01~03, AC-FR1400-02, AC-NFR1020-03
 */
function updateEnemy(enemy, mapData, rng) {}
```

**返回值观察契约**（test-plan §3.2 断言落点 = 返回对象 `x` / `y` / `direction` 字段，mock RNG 控制方向）：

| AC | 输入 (x, y, oldDir) | mock RNG | 期望（snap 后） | 断言字段 |
|----|---------------------|----------|----------------|---------|
| AC-FR1200-01 | (100, 50, DOWN) | randomInt → LEFT 索引 | y = 64, direction = LEFT | y, direction |
| AC-FR1200-02 | (70, 200, RIGHT) | randomInt → UP 索引 | x = 64, direction = UP | x, direction |
| AC-FR1200-03 | (50, 50, DOWN) 撞底边 | randomInt → RIGHT 索引 | y = 64, direction = RIGHT | y, direction |
| AC-FR1400-02 | (64, 128, DOWN) × 10 帧 | 不触发方向变更 | (64, 160) | x, y |

> mock RNG 的 `randomInt(0, 3)` 返回值对应 `ALL_DIRECTIONS = [UP, DOWN, LEFT, RIGHT]` 索引。

---

## §3 数据结构补充（v0.1.1 语义）

### §3.1 Direction 的 NONE 语义

v0.1.0 已定义 `DIRECTIONS.NONE = { x: 0, y: 0 }`。v0.1.1 明确其在对齐语境下的语义：

```typescript
type Direction = { x: -1 | 0 | 1, y: -1 | 0 | 1 };

// 对齐分类（按非零轴）：
//   水平: x !== 0 且 y === 0   (LEFT, RIGHT)
//   垂直: y !== 0 且 x === 0   (UP, DOWN)
//   NONE:  x === 0 且 y === 0   (静止)
```

**NONE 在对齐中的角色**：from-NONE 转任意非 NONE 方向视为"转向"，触发对应轴 snap（FR-1100 第 5 条规则）。

### §3.2 网格对齐相关常量（constants.js，v0.1.0 已定义，v0.1.1 复用）

| 常量 | 值 | 用途 |
|------|----|------|
| `TILE_SIZE` | 32 | 网格大小，snap 粒度 |
| `CANVAS_SIZE` | 1024 | 画布尺寸，边界钳制上界 |
| `TANK_SIZE` | 30 | 坦克尺寸，边界钳制依据 |
| `PLAYER_SPEED` | 4 | 玩家速度，`32/4 = 8` 帧/格（FR-1400） |
| `ENEMY_SPEED` | 3.2 | 敌方速度，`32/3.2 = 10` 帧/格（FR-1400） |

**FR-1400 不变量**：因 `PLAYER_SPEED` 与 `ENEMY_SPEED` 均整除 `TILE_SIZE`，从网格对齐位置出发的同向连续移动，每 `TILE_SIZE / speed` 帧后坐标自然回到网格线。无需每帧重新 snap。

---

## §4 不变量与边界条件

### §4.1 snapToGrid 不变量

| # | 不变量 | 验证 AC |
|---|--------|---------|
| INV-1 | `snapToGrid(p) % TILE_SIZE === 0` ∀ p ∈ ℝ | AC-FR1300-02 |
| INV-2 | `snapToGrid(p) >= 0` ∀ p ∈ ℝ | AC-FR1300-02 |
| INV-3 | `snapToGrid(p) + TANK_SIZE <= CANVAS_SIZE` ∀ p ∈ ℝ | AC-FR1300-02 |
| INV-4 | 纯函数：同输入同输出，无副作用 | AC-NFR1020-01 |

### §4.2 updatePlayer 对齐不变量

| # | 不变量 | 验证 AC |
|---|--------|---------|
| INV-5 | 90° 转向后，垂直于新方向的坐标 = `snapToGrid(原坐标)` | AC-FR1100-01/02/05/06 |
| INV-6 | 同向移动不触发 snap，坐标仅 `+= speed` | AC-FR1100-03 |
| INV-7 | from-NONE 转向触发 snap | AC-FR1100-04 |
| INV-8 | snap 后坐标满足边界（`992 + 30 ≤ 1024`） | AC-FR1300-01 |
| INV-9 | 同向连续 N 帧（`N = TILE_SIZE / speed`）后回到网格线 | AC-FR1400-01 |

### §4.3 updateEnemy 对齐不变量

| # | 不变量 | 验证 AC |
|---|--------|---------|
| INV-10 | AI 随机变向 90° 后，垂直轴坐标 = `snapToGrid(原坐标)` | AC-FR1200-01/02 |
| INV-11 | 撞边界变向 90° 后，垂直轴坐标 = `snapToGrid(原坐标)` | AC-FR1200-03 |
| INV-12 | 同向连续 N 帧后回到网格线 | AC-FR1400-02 |

### §4.4 边界条件

| 条件 | 行为 | 验证 |
|------|------|------|
| `snapToGrid` 负输入 | 钳制到 0 | AC-FR1300-02 补充用例 |
| `snapToGrid` 超界输入 | 钳制到 maxAligned(992) | AC-FR1300-02 补充用例 |
| snap + 位移越界 | `isWithinBounds` 失败，回退原坐标 | v0.1.0 边界行为，v0.1.1 不变 |
| enemy 撞墙 | 本帧不移动，snap 修正，下帧从对齐位出发 | AC-FR1200-03 |

---

## §5 闭合矩阵（interfaces exit ↔ test-plan coverage）

| interfaces exit | 断言落点 | 覆盖 AC | 测试类型 | test-plan § |
|----------------|---------|---------|---------|-------------|
| `snapToGrid` 返回值 | 函数返回值 | AC-NFR1020-01 | 单元测试 | §2.1 |
| `snapToGrid` 边界性质 | 函数返回值 | AC-FR1300-02 | 单元测试 | §2.1 |
| `updatePlayer.x`（转向 snap X） | 返回对象 x | AC-FR1100-01/04/06, AC-FR1300-01 | 集成测试 | §3.1 |
| `updatePlayer.y`（转向 snap Y） | 返回对象 y | AC-FR1100-02/05 | 集成测试 | §3.1 |
| `updatePlayer.x/y`（同向不 snap） | 返回对象 x/y | AC-FR1100-03, AC-FR1400-01 | 集成测试 | §3.1 |
| `updateEnemy.y`（AI 变向 snap Y） | 返回对象 y/direction | AC-FR1200-01 | 集成测试 | §3.2 |
| `updateEnemy.x`（AI 变向 snap X） | 返回对象 x/direction | AC-FR1200-02 | 集成测试 | §3.2 |
| `updateEnemy.y`（撞墙变向 snap） | 返回对象 y/direction | AC-FR1200-03 | 集成测试 | §3.2 |
| `updateEnemy.x/y`（同向保持） | 返回对象 x/y | AC-FR1400-02 | 集成测试 | §3.2 |
| `updatePlayer` 确定性可断言 | 返回对象坐标 | AC-NFR1020-02 | 集成测试 | §3.1 |
| `updateEnemy` mock RNG 可断言 | 返回对象坐标 | AC-NFR1020-03 | 集成测试 | §3.2 |
| `game.player.x/y`（真实循环） | Game 实例字段 | AC-FR1100-01/02（e2e 佐证） | e2e | §4.1 |
| `snapToGrid` O(1) 性能 | 手动 / 微基准 | AC-NFR1010-01 | 手动测试 | §5.2 |

**闭合说明**：
- 全部 17 个 AC 均有至少 1 个 interfaces exit 作为断言落点
- 全部 interfaces exit 均在 test-plan 中有对应测试类型
- 无 testability gap：所有对齐行为通过函数返回值 / 对象字段可观察，无需窥探内部状态
- 若某 AC 需观察内部状态（如转向检测中间标志），应由 interfaces 提供出口；本 spec 无此需求
