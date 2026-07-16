# 坦克大战 — 网格对齐 架构

- **Spec ID**: v0.1.1-001-grid-align
- **基于版本**: v0.1.0-001-tank-battle (已发布，217/217 PASS)
- **创建日期**: 2026-07-16

> 本文档为**增量架构文档**，仅描述 v0.1.1 网格对齐 spec 引入的新增/变更设计。
> 基础架构（Game / Renderer / Input / Map / Collision / Bullet / Score / Base / UI 等模块）
> 见 `v0.1.0-001-tank-battle/architecture.md`，本 spec 不修改这些模块的边界与依赖。

## §1 范围与基线

### 1.1 变更范围

v0.1.1 在 v0.1.0 基础上引入"转向时网格对齐"机制，涉及 3 个源文件：

| 文件 | 变更类型 | 内容 |
|------|---------|------|
| `src/js/tank.js` | 新增导出 | `snapToGrid(pixel)` 纯函数（共享对齐工具） |
| `src/js/player.js` | 修改 `updatePlayer` | 在 90° 转向 / from-NONE 时调用 `snapToGrid` |
| `src/js/enemy.js` | 修改 `updateEnemy` | 在 AI 随机变向和撞墙变向时调用 `snapToGrid` |

### 1.2 不变量

- v0.1.0 的 217 个测试保持 PASS（回归基线）
- 模块边界不变：`tank.js` 仍为共享纯函数工具模块，`player.js` / `enemy.js` 仍为纯函数模块
- 不引入新的运行时第三方依赖
- 不修改 Game / Renderer / Input / Collision / Map / Bullet / Score / Base / UI 任何模块
- 技术栈与 v0.1.0 完全一致（见 v0.1.0 architecture.md §6），无新选型

## 模块划分（网格对齐相关）

```
┌──────────────────────────────────────────────────────────┐
│                    constants.js                          │
│  TILE_SIZE=32  CANVAS_SIZE=1024  TANK_SIZE=30            │
│  PLAYER_SPEED=4  ENEMY_SPEED=3.2                         │
│  DIRECTIONS { UP, DOWN, LEFT, RIGHT, NONE }              │
└──────▲───────────────────────────▲───────────────────────┘
       │                           │
       │      ┌────────────────────┴───────────────┐
       │      │            tank.js                 │
       │      │        (共享纯函数工具)             │
       │      │                                     │
       │      │  + snapToGrid(pixel)      [v0.1.1] │
       │      │    calculateMovement(dir, speed)   │
       │      │    isWithinBounds(x, y)            │
       │      │    getTankBoundingBox(tank)        │
       │      │    pixelToTile / tileToPixel       │
       │      └────▲──────────────────────▲────────┘
       │           │                      │
   ┌───┴───────────┴──┐         ┌─────────┴──────────┐
   │   player.js       │         │     enemy.js        │
   │                   │         │                     │
   │  updatePlayer()   │         │  updateEnemy()      │
   │   ├ 转向检测       │         │   ├ AI 定时变向 snap │
   │   ├ snapToGrid    │         │   ├ 撞墙变向二次 snap │
   │   │  (≤1 次/转向) │         │   │  (≤2 次/帧)      │
   │   └ 位移+边界     │         │   └ 位移+边界       │
   └───────────────────┘         └─────────────────────┘

依赖方向:
  player.js ──→ tank.js ──→ constants.js
  enemy.js  ──→ tank.js ──→ constants.js
  player.js ──→ constants.js
  enemy.js  ──→ constants.js
  player.js 与 enemy.js 之间无直接依赖（编排由 Game 完成）
```

### 2.1 调用关系

| 调用方 | 被调用方 | 调用函数 | 调用频率（每帧） |
|--------|---------|---------|----------------|
| player.js | tank.js | `snapToGrid` | 0~1 次（仅转向时） |
| player.js | tank.js | `calculateMovement`, `isWithinBounds` | 1 次 |
| enemy.js | tank.js | `snapToGrid` | 0~2 次（AI 变向 + 可能撞墙变向） |
| enemy.js | tank.js | `calculateMovement`, `isWithinBounds` | 1 次 |

### 2.2 snapToGrid 放置在 tank.js 的理由

- player 与 enemy 的对齐逻辑完全相同（同一公式 `Math.round(pixel/TILE_SIZE)*TILE_SIZE` + 同一边界钳制）
- `tank.js` 在 v0.1.0 已是"共享坦克工具"模块（`calculateMovement` / `isWithinBounds` / `getTankBoundingBox`），`snapToGrid` 与它们同属"坦克坐标工具"语义
- 集中放置满足 NFR-1020-01"纯函数可独立单元测试"要求，避免逻辑重复（DRY）
- player.js / enemy.js 已 import tank.js（v0.1.0 既有依赖），无新增耦合面

## §3 网格对齐设计决策

### 3.1 90° 转向检测算法

**问题**：需区分"同向移动"（不 snap）、"90° 转向"（snap 垂直轴）、"from-NONE 起步"（snap 对应轴）。

**算法**（player.js L68-80 / enemy.js L63-75）：

```
oldDir          = tank.direction            # 上一帧方向
isOldHorizontal = oldDir.x !== 0            # LEFT / RIGHT
isOldVertical   = oldDir.y !== 0            # UP / DOWN
isOldNone       = !isOldHorizontal && !isOldVertical   # NONE
isNewVertical   = newDir.y !== 0

if isNewVertical AND (isOldHorizontal OR isOldNone):
    snap X              # 转→垂直：对齐 X 轴
else if NOT isNewVertical AND (isOldVertical OR isOldNone):
    snap Y              # 转→水平：对齐 Y 轴
else:
    no snap             # 同向 或 180° 反向
```

**为何用 `x!==0` / `y!==0` 而非方向枚举比较**：
- Direction 是向量 `{x, y}`，无独立枚举类型
- `x!==0` 自然覆盖 LEFT/RIGHT（水平），`y!==0` 覆盖 UP/DOWN（垂直）
- 避免引入额外的方向分类函数，保持 tank.js 工具最小化

**180° 反向不 snap 的理由**：
- 180° 反向（如 RIGHT→LEFT）时垂直轴坐标无需改变，坦克仍在原车道
- snap 反而可能引入不必要位移，破坏 FR-1400"同向移动保持对齐"语义

### 3.2 from-NONE 处理

FR-1100 要求"从静止状态（NONE）开始移动应触发对齐（初始方向视为转向）"。

**实现**：`isOldNone` 同时加入两个分支条件：
- `isNewVertical AND (isOldHorizontal OR isOldNone)` → 从 NONE 转垂直，snap X
- `NOT isNewVertical AND (isOldVertical OR isOldNone)` → 从 NONE 转水平，snap Y

**语义**：NONE 视为"既非水平也非垂直"，任何非 NONE 新方向都被视为"转向"，触发对应轴 snap。保证坦克从静止起步即落入网格车道。

**NONE 方向来源**：
- v0.1.0 已定义 `DIRECTIONS.NONE = {x:0, y:0}`
- `createPlayer` / `createEnemy` 初始设 UP / DOWN，NONE 主要出现在玩家未按键时 `Input.getDirection()` 返回
- 注：当前 `updatePlayer` 在 `direction === NONE` 时不进入移动分支（player.js L64 `if (direction.x !== 0 || direction.y !== 0)`），因此 from-NONE snap 实际发生在"上一帧 NONE、本帧有方向"的状态转换

### 3.3 撞墙变向的二次 snap（enemy.js 独有）

**场景**：敌方坦克移动后 `isWithinBounds` 失败（撞边界），AI 立即重新选择方向。此"撞墙变向"也是一次方向变更，需 snap。

**实现**（enemy.js L82-106）：

```
if NOT isWithinBounds(newX, newY):                  # 撞墙
    prevDir = updated.direction                     # 撞墙前的方向（第一次 AI 变向后的方向）
    choice   = rng.randomInt(0, 3)
    updated.direction = ALL_DIRECTIONS[choice]      # 撞墙变向
    updated.directionTimer = rng.randomInt(MIN, MAX)

    isPrevVertical    = prevDir.y !== 0
    isNewDirVertical  = updated.direction.y !== 0
    if isNewDirVertical AND NOT isPrevVertical:
        newX = snapToGrid(updated.x)                # 水平→垂直：snap X
        newY = updated.y
    else if NOT isNewDirVertical AND isPrevVertical:
        newX = updated.x                            # 垂直→水平：snap Y
        newY = snapToGrid(updated.y)
    else:
        newX = updated.x                            # 同轴/180°：不 snap
        newY = updated.y
```

**关键点**：
1. **本帧不移动**：撞墙后 `newX/newY` 回退到 `updated.x/updated.y`（撞墙前位置），坦克本帧静止。snap 仅修正坐标到网格线，下帧从对齐位置出发。
2. **prevDir 语义**：此处 `prevDir` 是"撞墙前的方向"（即本帧第一次 AI 变向后的方向），**不是**"上一帧的方向"。因为撞墙变向发生在同一帧内的两次方向决策之间。
3. **为何 player 无此分支**：玩家撞墙时方向由输入决定，不自动变向；撞墙仅回退坐标（player.js L87-90），不存在"撞墙后再选新方向"的流程。
4. **满足 FR-1200-03**：敌方撞边界后 AI 选新方向，若发生 90° 转向则 snap 垂直轴。

### 3.4 snap 时机：方向变更后、位移计算前

FR-1100 要求"对齐发生在移动应用的同帧内，在方向变更后、位移计算前或同步进行"。

**实现顺序**（player.js L74-84 / enemy.js L69-79）：
1. 检测转向 → snap 垂直轴坐标到 `newX` / `newY`
2. `calculateMovement(direction, speed)` 计算位移 `dx, dy`
3. `newX += dx; newY += dy`（位移叠加在已对齐坐标上）
4. `isWithinBounds` 边界检查

**为何 snap 在位移前**：保证本帧位移从网格线起点计算，避免"先移动再 snap"导致的视觉跳跃。snap 是瞬时位置修正，位移是连续运动，两者叠加后坦克平滑地沿新车道前进。

## §4 边界安全策略 (FR-1300)

### 4.1 snapToGrid 的钳制逻辑

```
function snapToGrid(pixel):
    raw        = Math.round(pixel / TILE_SIZE) * TILE_SIZE
    aligned    = raw + 0                     # 规范化 -0 → +0
    maxAligned = Math.floor((CANVAS_SIZE - TANK_SIZE) / TILE_SIZE) * TILE_SIZE
    if aligned < 0:          return 0
    if aligned > maxAligned: return maxAligned
    return aligned
```

### 4.2 边界不变式

- `CANVAS_SIZE = 1024`，`TANK_SIZE = 30`，`TILE_SIZE = 32`
- `maxAligned = floor((1024 - 30) / 32) * 32 = floor(31.0625) * 32 = 31 * 32 = 992`
- 不变式：`0 ≤ snapToGrid(pixel) ≤ 992`，且 `snapToGrid(pixel) + TANK_SIZE(30) ≤ 1022 < 1024`
- 即对齐结果始终满足 `isWithinBounds` 的单轴条件

### 4.3 -0 规范化

`Math.round` 对负数运算可能产生 `-0`（如 `Math.round(-0.4/32)*32 = -0`）。虽然 `-0 === 0` 为 true，但为避免序列化/显示异常，用 `raw + 0` 强制转为 `+0`。属防御性处理，不影响逻辑正确性。

### 4.4 钳制是否实际触发

由于 `TANK_SIZE(30) < TILE_SIZE(32)`，最大对齐位置 `992 + 30 = 1022 < 1024`，正常对齐不会越界。钳制为防御性编程（FR-1300 spec 明确要求实现）。测试侧（AC-FR1300-01）验证 `x=1005 → snap 992` 天然在边界内即可，无需构造强制越界场景。

### 4.5 snap 与 isWithinBounds 的两层防护

| 层 | 函数 | 防护对象 | 失败处理 |
|----|------|---------|---------|
| 第 1 层 | `snapToGrid` | snap 对齐结果 | 钳制到 `[0, 992]` |
| 第 2 层 | `isWithinBounds` | snap + 位移结果 | 回退到原坐标（player.js L87-90 / enemy.js 撞墙分支）|

snapToGrid 保证单轴坐标在 `[0, 992]`；但 `isWithinBounds(newX, newY)` 检查 snap + 位移后的坐标，位移可能使其越界（如 snap 到 992 后再 +4 = 996，`996 + 30 = 1026 > 1024`）。此时第 2 层兜底回退。

## §5 性能特征 (NFR-1010)

### 5.1 时间复杂度

- `snapToGrid`：O(1) — 1 次 `Math.round` + 1 次乘法 + 1 次 `Math.floor` + 1 次乘法 + 2 次比较
- 转向检测：O(1) — 4 次布尔判断
- 每帧每辆坦克至多调用 `snapToGrid` 1 次（player）或 2 次（enemy 撞墙时）

### 5.2 每帧开销上界

| 实体 | 数量 | snap 调用次数/帧 |
|------|------|-----------------|
| 玩家 | 1 | 0~1（仅转向时） |
| 敌方 | ≤4 | 0~2（AI 变向 + 可能撞墙变向） |
| 合计 | ≤5 | ≤9 次 O(1) 运算/帧 |

在 60fps 下，9 次 O(1) 运算耗时在纳秒级，不引入可测量的帧率下降（满足 AC-NFR1010-01）。

### 5.3 无额外渲染开销

snap 仅修改坦克坐标数值，不触发额外渲染调用。Renderer 仍按 v0.1.0 流程每帧重绘，无变更。

## §6 关键 trade-offs

### 6.1 snap 公式：Math.round vs Math.floor

| 方案 | 行为 | 最大偏移 | 选择 |
|------|------|---------|------|
| **Math.round**（采用） | snap 到最近网格线 | ≤16px | ✅ spec 明确要求 |
| Math.floor | snap 向下到网格线 | 0~31px | ❌ 偏移更大，手感差 |

**风险**：`Math.round` 在 `.5` 边界（如 `pixel=16`，`16/32=0.5`）向正无穷方向取整（`Math.round(0.5)=1` → `32`）。spec 已明确采用此公式，测试以 spec 公式重算期望值（test-plan §7.5），无歧义。

### 6.2 snap 放置位置：tank.js 共享 vs 各模块内联

| 方案 | 优点 | 缺点 | 选择 |
|------|------|------|------|
| **tank.js 共享**（采用） | 逻辑单一来源、可独立单测、复用 | 跨模块依赖 | ✅ |
| player/enemy 各内联 | 无跨模块依赖 | 逻辑重复、违反 DRY、难独立单测 | ❌ |

**风险**：player.js / enemy.js 增加 `import { snapToGrid } from './tank.js'`。但 tank.js 已是两者既有依赖（v0.1.0 已 import `calculateMovement` / `isWithinBounds`），无新增耦合面。

### 6.3 撞墙变向是否 snap

| 方案 | 行为 | 选择 |
|------|------|------|
| **撞墙变向也 snap**（采用） | 敌方撞墙后下帧从对齐位置出发，车道一致 | ✅ 满足 FR-1200-03 |
| 撞墙变向不 snap | 敌方撞墙后可能偏在网格线间，后续转向再 snap | ❌ 行为不一致，违反 FR-1200"AI 改变方向时同样触发对齐" |

**风险**：撞墙分支增加一次 snap 调用和方向比较逻辑，enemy.js 复杂度上升。但该分支仅在 `isWithinBounds` 失败时触发（低频），性能影响可忽略。

### 6.4 from-NONE 是否 snap

| 方案 | 行为 | 选择 |
|------|------|------|
| **from-NONE 视为转向并 snap**（采用） | 坦克起步即落网格车道 | ✅ FR-1100 明确要求 |
| from-NONE 不 snap | 坦克起步位置可能偏在网格线间 | ❌ 违反 FR-1100 |

**风险**：若坦克在网格线间静止后起步，会瞬间跳到最近网格线（最大 16px 跳跃）。这是 spec 预期行为（还原经典手感），非 bug。

## §7 技术栈（无变更）

v0.1.1 不引入任何新技术选型，完整技术栈见 v0.1.0 architecture.md：

- 运行时：浏览器原生 ES Module（`import` / `export`）
- 测试：Jest + jsdom
- 无运行时第三方依赖
- 无构建工具（原生 ES Module 直跑）
- Lint / 格式化：沿用 v0.1.0 既有配置

新增的 `snapToGrid` 仅使用 `Math.round` / `Math.floor` 标准库，无新依赖。

## §8 FR 参考对照表

| FR / NFR | 需求描述 | 对应模块 / 函数 |
|----------|---------|----------------|
| FR-1100 | 转向时网格对齐 | tank.js `snapToGrid` + player.js `updatePlayer` + enemy.js `updateEnemy`（转向检测）|
| FR-1200 | 对齐应用于玩家和敌方 | player.js `updatePlayer` + enemy.js `updateEnemy`（AI 变向 + 撞墙变向）|
| FR-1300 | 对齐边界安全 | tank.js `snapToGrid`（clamp）+ player/enemy `isWithinBounds`（第二层兜底）|
| FR-1400 | 同向移动保持网格对齐 | player.js / enemy.js（不触发 snap，靠速度整除 TILE_SIZE 自然回归网格）|
| NFR-1010 | 对齐性能 | tank.js `snapToGrid`（O(1)）|
| NFR-1020 | 对齐可测试性 | tank.js `snapToGrid`（纯函数导出）+ player/enemy（确定性输入 / mock RNG）|
