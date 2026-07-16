# 坦克大战 — 网格对齐 测试计划

- **Spec ID**: v0.1.1-001-grid-align
- **创建日期**: 2026-07-16
- **关联验收**: `.louke/project/specs/v0.1.1-001-grid-align/acceptance.md`
- **关联 Spec**: `.louke/project/specs/v0.1.1-001-grid-align/spec.md` (locked: true)
- **测试框架**: jest
- **基于版本**: v0.1.0-001-tank-battle (已发布，217/217 PASS)

## 测试策略

本测试计划覆盖 v0.1.1 网格对齐 spec 的全部 17 个 AC（FR-1100: 6, FR-1200: 3, FR-1300: 2, FR-1400: 2, NFR-1010: 1, NFR-1020: 3）。

核心对齐逻辑 `snapToGrid` 为纯函数，通过 Jest 单元测试覆盖；对齐行为在 `updatePlayer` / `updateEnemy` 中的集成通过 Jest 集成测试覆盖（使用确定性输入与 mock RNG）；真实游戏循环中的转向对齐通过 e2e 场景测试覆盖；性能（60fps）通过手动测试覆盖。

### 黑盒立场

本测试计划仅声明**系统外部可观察**的测试方法。可观察对象限定为：

- `tank.js` 模块导出的纯函数 `snapToGrid` 的返回值
- `updatePlayer` / `updateEnemy` 返回的坦克对象坐标字段（`x`, `y`, `direction`）
- `Game` 实例的 `player` / `enemies` 坐标字段（e2e 层）

**不直接依赖**的内部对象：方向变更检测的内部状态机、对齐触发的中间标志位、AI 决策的内部计数器。若某 AC 需观察这些内部状态，应由 interfaces.md 提供对应出口（见 Stage 2），而非在测试侧窥探内部。

### 断言依据

所有断言落点 = spec.md 中明确的 `snapToGrid(pixel) = Math.round(pixel / TILE_SIZE) * TILE_SIZE` 公式 + acceptance.md 中各 AC 给定的精确坐标值。期望值由 spec 公式在测试中重算（非硬编码 impl 输出），符合反作弊模式 #6/#7 的规避要求。

### 反作弊约束 (CI 强制)

| #   | 反作弊模式 | 本计划应对 |
| --- | --- | --- |
| 1 | 改断言迁就实现 | 断言值必须来自 spec 公式重算，不得取 impl 返回值 |
| 6 | 期望值取自 impl | `snapToGrid` 期望值由 `Math.round(x/32)*32` 在测试内重算 |
| 7 | 硬编码期望值 | AC 已给定精确坐标（如 96/64/128），属 spec 定义的真值，非 impl 输出，允许硬编码 |
| 8 | 平凡通过 | 每个测试须断言精确坐标值，禁止 `assert true` / `isNotNull` 作为唯一断言 |

---

## §1 覆盖矩阵

| AC ID | 类型 | 模块 / 断言落点 | 优先级 | 现状 |
|-------|------|----------------|--------|------|
| AC-FR1100-01 | 集成测试 | player (updatePlayer 返回 x) | P0 | ✓ 已有 |
| AC-FR1100-02 | 集成测试 | player (updatePlayer 返回 y) | P0 | ✓ 已有 |
| AC-FR1100-03 | 集成测试 | player (updatePlayer 返回 x/y) | P0 | ✓ 已有 |
| AC-FR1100-04 | 集成测试 | player (updatePlayer 返回 x) | P0 | ✗ 需补充 |
| AC-FR1100-05 | 集成测试 | player (updatePlayer 返回 y) | P0 | ✗ 需补充 |
| AC-FR1100-06 | 集成测试 | player (updatePlayer 返回 x/y) | P0 | ✓ 已有 |
| AC-FR1200-01 | 集成测试 | enemy (updateEnemy 返回 y) | P0 | ✓ 已有 |
| AC-FR1200-02 | 集成测试 | enemy (updateEnemy 返回 x) | P0 | ✓ 已有 |
| AC-FR1200-03 | 集成测试 | enemy (updateEnemy 返回 y/direction) | P0 | ✓ 已有 |
| AC-FR1300-01 | 集成测试 | player (updatePlayer 返回 x, 边界内) | P0 | ✗ 需补充 |
| AC-FR1300-02 | 单元测试 | tank (snapToGrid 返回值性质) | P0 | ✓ 已有 |
| AC-FR1400-01 | 集成测试 | player (8 帧后 updatePlayer 返回 x/y) | P1 | ✗ 需补充 |
| AC-FR1400-02 | 集成测试 | enemy (10 帧后 updateEnemy 返回 x/y) | P1 | ✗ 需补充 |
| AC-NFR1010-01 | 手动测试 | 性能 (帧率) | P2 | ✗ 需补充 |
| AC-NFR1020-01 | 单元测试 | tank (snapToGrid 6 个断言点) | P1 | ✓ 已有 |
| AC-NFR1020-02 | 集成测试 | player (updatePlayer 确定性输入) | P1 | ✓ 已有 |
| AC-NFR1020-03 | 集成测试 | enemy (updateEnemy mock RNG) | P1 | ✓ 已有 |

**AC 数量统计**: 共 17 个 AC — 2 单元测试 / 13 集成测试 / 1 手动测试 / e2e 场景补充覆盖（FR1100-01/02 真实循环路径）

> e2e 层不单独占用 AC，而是在 §4 中作为集成测试的真实游戏循环交叉验证，覆盖 FR1100-01/02 的端到端路径。

---

## §2 单元测试 (Jest)

### 2.1 snapToGrid 纯函数 (`src/js/tank.js`)

**断言落点**: `snapToGrid(pixel)` 返回值
**Ground Truth**: 期望值由 `Math.round(pixel / TILE_SIZE) * TILE_SIZE` 在测试内重算（spec 公式），非硬编码 impl 输出。

- **AC-NFR1020-01**: 纯函数 6 个断言点 — 验证 `snapToGrid(0)===0`、`snapToGrid(15)===0`、`snapToGrid(17)===32`、`snapToGrid(32)===32`、`snapToGrid(100)===96`、`snapToGrid(130)===128`。测试用例首行注释须含 `AC-NFR1020-01`。
- **AC-FR1300-02**: 边界安全性质 — 验证对任意有效像素坐标 `[0, CANVAS_SIZE]`，返回值始终满足：(1) 为 `TILE_SIZE` 整数倍；(2) `≥ 0`；(3) `+ TANK_SIZE ≤ CANVAS_SIZE`（因最大对齐位置 992 + 30 = 1022 < 1024）。补充用例：负输入钳制到 0；`CANVAS_SIZE` 输入钳制到 `≤ CANVAS_SIZE - TANK_SIZE`。测试用例首行注释须含 `AC-FR1300-02`。

**现状**: `tests/unit/movement.test.js` 的 `snapToGrid` describe 块已有 9 个用例覆盖上述两点。Devon 须确保每个用例首行注释包含对应 `AC-FRXXXX-YY`（部分用例当前仅有块级注释，需补到 `test()` 首行）。

---

## §3 集成测试 (Jest)

集成测试使用 `@jest-environment jsdom`，通过依赖注入提供确定性输入（mock RNG、空地图/空子弹数组），断言 `updatePlayer` / `updateEnemy` 返回的坦克对象坐标。

### 3.1 updatePlayer 方向变更 (`src/js/player.js`)

**断言落点**: `updatePlayer(player, newDirection, ...)` 返回对象的 `x` / `y` / `direction` 字段。

- **AC-FR1100-01**: 水平→垂直转向 snap X — 给定 `(x=100, y=68)` 方向右，转向上；断言 `x === 96`（`Math.round(100/32)*32`），`y` 随上移减小。
- **AC-FR1100-02**: 垂直→水平转向 snap Y — 给定 `(x=96, y=50)` 方向上，转向右；断言 `y === 64`，`x` 随右移增大。
- **AC-FR1100-03**: 同向不触发对齐 — 给定 `(x=80, y=80)` 方向右，继续右；断言 `x === 84`（仅 +PLAYER_SPEED），`y === 80` 不变。
- **AC-FR1100-04**: ⚠ 需补充 — 从静止（NONE）转向触发对齐。给定 `(x=200, y=200)` 方向 NONE，转向上；断言 `x === 192`（`Math.round(200/32)*32`），`direction === UP`，`y` 开始上移。
- **AC-FR1100-05**: ⚠ 需补充 — 从下转左 snap Y。给定 `(x=65, y=130)` 方向下，转向左；断言 `y === 128`（`Math.round(130/32)*32`），`x` 随左移减小。
- **AC-FR1100-06**: 已在网格线保持 — 给定 `(x=128, y=64)` 方向右，转向上；断言 `x === 128` 不变，`y` 上移。
- **AC-FR1300-01**: ⚠ 需补充 — 边界安全。给定 `(x=1005, y=68)` 方向右，转向上；断言 `x` snap 到 `992`（`Math.round(1005/32)*32`），且 `992 + TANK_SIZE(30) = 1022 ≤ CANVAS_SIZE(1024)` 在边界内。
- **AC-FR1400-01**: ⚠ 需补充 — 同向连续移动保持网格对齐。给定玩家从 `(x=128, y=64)` 向右，连续调用 `updatePlayer` 8 帧（PLAYER_SPEED=4，8×4=32=TILE_SIZE）；断言第 8 帧后 `(x=160, y=64)`，`y` 始终为网格线 64。
- **AC-NFR1020-02**: 确定性输入可断言 — 上述 updatePlayer 用例均使用空地图/空数组确定性输入，断言对齐后精确坐标值，满足可测试性要求。

### 3.2 updateEnemy 方向变更 (`src/js/enemy.js`)

**断言落点**: `updateEnemy(enemy, ..., rng)` 返回对象的 `x` / `y` / `direction` 字段。
**确定性手段**: 通过依赖注入 mock RNG（`{ randomInt: (a,b) => fixedIndex }`）控制 AI 方向变更结果，避免随机性。

- **AC-FR1200-01**: 敌方从下转左 snap Y — mock RNG 返回 LEFT 索引；给定 `(x=100, y=50)` 方向下；断言 `y === 64`，`direction === LEFT`。
- **AC-FR1200-02**: 敌方从右转上 snap X — mock RNG 返回 UP 索引；给定 `(x=70, y=200)` 方向右；断言 `x === 64`，`direction === UP`。
- **AC-FR1200-03**: 敌方碰撞后方向变更 snap Y — 构造边界碰撞场景（`y` 近底边触发越界），mock RNG 返回 RIGHT 索引；断言 `y` snap 到网格线，`direction === RIGHT`。
- **AC-FR1400-02**: ⚠ 需补充 — 敌方同向连续移动保持网格对齐。给定敌方从 `(x=64, y=128)` 向下，连续调用 `updateEnemy` 10 帧（ENEMY_SPEED=3.2，10×3.2=32=TILE_SIZE，mock RNG 不触发方向变更）；断言第 10 帧后 `(x=64, y=160)`，`x` 始终为网格线 64。
- **AC-NFR1020-03**: mock RNG 可断言 — 上述 updateEnemy 用例均通过 mock RNG 控制方向变更，断言对齐后精确坐标值，满足可测试性要求。

**现状**: `tests/integration/grid-alignment.test.js` 已有 7 个用例覆盖 3.1 的 FR1100-01/02/03/06 与 3.2 的 FR1200-01/02/03。Devon 须补充 FR1100-04/05、FR1300-01、FR1400-01/02 共 5 个用例（标 ⚠ 项）。

---

## §4 e2e 测试 (Jest)

e2e 测试在真实 `Game` 实例（mock scheduler/renderer/input，但走完整 `game.update()` 流程）中验证网格对齐行为，作为集成测试的端到端交叉验证。

### 4.1 游戏循环中的转向对齐 (`tests/e2e/scenarios.test.js`)

**断言落点**: `game.player.x` / `game.player.y` 字段（真实 Game 状态）。

- **E2E-02 玩家移动与射击**（已有，已适配网格对齐）：在空地图上模拟方向键序列 上→右→下→左，每次 `game.update()` 后断言：
  - 转向后的垂直于新方向的坐标 `=== 0 (mod TILE_SIZE)`（即落在网格线上）
  - 主方向坐标按 PLAYER_SPEED 增减
  - 覆盖 FR1100-01/02 的真实游戏循环路径（集成测试的端到端佐证）

### 4.2 e2e 不重复集成测试的 AC

e2e 层不单独占用 AC 编号，仅作为 FR1100-01/02 的真实循环佐证。其余 AC（FR1100-03~06、FR1200、FR1300、FR1400、NFR）由单元/集成测试精确覆盖，e2e 不重复断言以避免冗余。

### 4.3 e2e 纪律

- e2e **不 mock** 框架内部实现（`updatePlayer` / `snapToGrid` 本身），仅 mock 外部依赖（scheduler / renderer / input）
- e2e **不依赖**框架私有 API，仅通过 `Game` 公共接口（`init` / `update` / `player` 字段）观察

---

## §5 边界 / 性能 / 可测试性

### 5.1 边界安全 (FR-1300)

- **AC-FR1300-01**（集成测试，⚠ 需补充）：验证近边界坐标 `x=1005` 转向后 snap 到 `992`，且 `992 + TANK_SIZE ≤ CANVAS_SIZE`。由于 `TANK_SIZE(30) < TILE_SIZE(32)`，正常对齐不会越界，钳制为防御性实现；测试验证对齐结果天然在边界内即可，无需构造强制越界场景。
- **AC-FR1300-02**（单元测试，✓ 已有）：验证 `snapToGrid` 返回值的三个不变式（32 整数倍 / ≥0 / +TANK_SIZE ≤ CANVAS_SIZE）。

### 5.2 性能 (NFR-1010)

- **AC-NFR1010-01**（手动测试，⚠ 需补充）：spec 要求对齐计算为 O(1) 且不影响 60fps。
  - **O(1) 性质**：`snapToGrid` 仅含一次 `Math.round` + 一次乘法，数学上为 O(1)。可在 `tests/unit/movement.test.js` 补充一个微基准用例：循环调用 N 次测量总耗时，断言单次耗时在微秒级（辅助自动化验证，非强制）。
  - **60fps 不下降**：需真实浏览器渲染环境（4 敌方 + 玩家 + 子弹活动），手动通过浏览器 Performance API 测量帧率 ≥50fps（参考 v0.1.0 AC-049/050 的手动性能测试约定）。无浏览器自动化环境时归为手动测试，CI 不强制。
  - **优先级 P2**：对齐逻辑是 O(1) 纯计算，性能风险极低；手动验证在发布前进行即可。

### 5.3 可测试性 (NFR-1020)

- **AC-NFR1020-01**（单元测试，✓ 已有）：`snapToGrid` 实现为 `tank.js` 导出的纯函数，可独立单元测试。
- **AC-NFR1020-02**（集成测试，✓ 已有）：对齐逻辑集成到 `updatePlayer`，使用确定性输入（空地图/空数组）可断言精确坐标。
- **AC-NFR1020-03**（集成测试，✓ 已有）：对齐逻辑集成到 `updateEnemy`，使用 mock RNG 可断言精确坐标。

**可测试性 fallback**: 本 spec 全部 17 个 AC 均可通过外部可观察出口（函数返回值 / 对象字段）验证，无 testability gap，无需标记 "blocked by testability gap"。

---

## §6 测试优先级 (P0/P1/P2)

### P0 — 核心对齐行为（合并前必须通过）
- **集成测试**: updatePlayer 转向对齐 (FR1100-01~06)、updateEnemy 转向对齐 (FR1200-01~03)、边界安全 (FR1300-01)
- **单元测试**: snapToGrid 边界性质 (FR1300-02)
- **P0 AC 总数**: 11

### P1 — 次要机制与可测试性元测试（发布前必须通过）
- **集成测试**: 同向移动保持对齐 (FR1400-01/02)
- **单元测试**: snapToGrid 纯函数 (NFR1020-01)
- **集成测试**: updatePlayer/updateEnemy 可测试性 (NFR1020-02/03)
- **P1 AC 总数**: 5

### P2 — 性能（参考信息）
- **手动测试**: 对齐性能 (NFR1010-01)
- **P2 AC 总数**: 1

---

## §7 测试环境

### 7.1 目录结构

```
tests/
├ unit/
│   └ movement.test.js          # AC-NFR1020-01, AC-FR1300-02 (snapToGrid 9 用例)
├ integration/
│   └ grid-alignment.test.js    # AC-FR1100-01~06, AC-FR1200-01~03, AC-FR1300-01, AC-FR1400-01/02, AC-NFR1020-02/03
├ e2e/
│   └ scenarios.test.js         # E2E-02 转向对齐断言 (FR1100-01/02 真实循环佐证)
└ assets/
    └ level-data.json           # 预定义关卡布局 (复用 v0.1.0)
```

### 7.2 命名规范
- 文件: `{module}.test.js`（复用 v0.1.0 既有文件，不新建）
- 测试用例: `test('AC-FRXXXX-YY {description}', () => { ... })`
- **每个 `test()` 首行注释必须包含 `AC-FRXXXX-YY`**（4 位 FR + 2 位 AC 序号），CI 扫描校验
- v0.1.0 旧式 `AC-v0.1.0-001-tank-battle-NNN` 注释保留不动（属于 v0.1.0 AC 范围）

### 7.3 执行
- **离线**: 无网络依赖；mock RNG / mock scheduler / mock renderer 均为内存实现
- **执行顺序**: `npx jest tests/unit` → `npx jest tests/integration` → `npx jest tests/e2e`
- **CI**: 每次推送运行完整套件；P0 失败阻止合并
- **完整命令**: `npx jest`（运行全部 217+ 用例，含 v0.1.0 与 v0.1.1）

### 7.4 关键测试基础设施
- **Mock RNG**: `updateEnemy` 集成测试所必需（FR1200、NFR1020-03）。通过 `rng` 参数依赖注入，`{ randomInt: (a,b) => fixedIndex }` 控制方向变更结果。
- **Mock Scheduler / Renderer / Input**: e2e 测试所必需。通过 `Game(scheduler, renderer, input)` 构造函数注入，支持确定性逐帧推进。
- **DOM 环境**: 集成/e2e 测试需 `@jest-environment jsdom`（文件首行声明）。
- **空地图构造**: 集成测试用 `Array.from({length:32}, () => Array(32).fill('empty'))` 构造无障碍地图，隔离对齐逻辑与碰撞检测。

### 7.5 Ground Truth 方法
本项目为纯规则/计算验证（`snapToGrid` 公式），属"简单规则"类型：**spec 公式本身即 Ground Truth**。期望值由 `Math.round(pixel / TILE_SIZE) * TILE_SIZE` 在测试内重算，不引入独立 `tests/ground_truth/` 目录，不 `import` 系统源码计算期望值（规避反作弊模式 #6）。

### 7.6 外部依赖分层测试
本项目为纯前端游戏，**无外部依赖**（无数据库 / 远程 API / 硬件 / 真实时间）。Wall clock 通过 mock scheduler 替换为确定性逐帧推进。§6 三层测试金字塔不适用，省略。

---

## §8 AC 参考闭合

| FR / NFR | AC 范围 | 数量 | 测试类型 | 闭合 |
|----------|---------|------|----------|------|
| FR-1100 转向时网格对齐 | 01–06 | 6 | 6 集成测试 | ✓ |
| FR-1200 玩家与敌方对齐 | 01–03 | 3 | 3 集成测试 | ✓ |
| FR-1300 对齐边界安全 | 01–02 | 2 | 1 集成测试 + 1 单元测试 | ✓ |
| FR-1400 同向移动保持对齐 | 01–02 | 2 | 2 集成测试 | ✓ |
| NFR-1010 对齐性能 | 01 | 1 | 1 手动测试 | ✓ |
| NFR-1020 对齐可测试性 | 01–03 | 3 | 1 单元测试 + 2 集成测试 | ✓ |

**全部 6 个 FR/NFR 章节均有 AC 覆盖。全部 17 个 AC 均已分配测试类型。**

### 闭合说明
- 每个 AC 至少 1 个测试用例引用（CI `lk agent archer ci-scan` 强制校验）
- 每个测试用例至少引用 1 个 AC（首行注释 `AC-FRXXXX-YY`）
- 断言落点均为外部可观察出口（函数返回值 / 对象坐标字段），无内部状态窥探
- 5 个 ⚠ 待补充用例由 Devon 在实现阶段补齐（FR1100-04/05、FR1300-01、FR1400-01/02）

---

## §9 CI Gate

```bash
lk agent archer ci-scan \
  --acceptance .louke/project/specs/v0.1.1-001-grid-align/acceptance.md \
  --tests tests/
```

校验项:
- AC 引用闭合（每个 AC ≥1 测试，每个测试 ≥1 AC）
- 反作弊静态扫描（§1.3：无 `assert true` / 无 `try-except: pass` / 无未链接 issue 的 skip）
- §7.5 Ground Truth 隔离（期望值由 spec 公式重算，非 impl 输出）
- 测试用例首行 `AC-FRXXXX-YY` 注释完整性
