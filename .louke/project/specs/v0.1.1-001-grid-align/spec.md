# 坦克大战 — 网格对齐 Spec

- **Spec ID**: v0.1.1-001-grid-align
- **Created**: 2026-07-14
- **Status**: Draft
- **Based on**: v0.1.0-001-tank-battle (已发布)

> **职责划分**: 本文档仅描述需求本身（FR/NFR 描述 + metadata）。
> 验收标准（可观察、可断言的通过条件）存放在 `acceptance.md` 中。
> 测试计划（`test-plan.md`）以 spec.md 和 acceptance.md 作为输入。

<a id="us-0010"></a>

## 用户故事

### US-0010
story: 作为一名玩家，我希望坦克在转向时自动对齐到网格，从而能够轻松穿越障碍物间隙，还原经典 FC 坦克大战的手感。
priority: P0

## 使用场景

### scenario-0010

玩家正在向右移动坦克，坦克的 Y 坐标位于网格线之间（例如 y=68，介于 64 和 96 之间）。玩家按下方向键上转向。坦克在开始向上移动之前（或同时），Y 坐标自动 snap 到最近的网格线（y=64），使坦克精确对齐到网格车道。这确保坦克能够顺畅穿越砖墙之间的单格间隙，而不会因微小偏移被卡住。

## 功能需求

> **格式约定**: 每个 FR 单元以三级标题 + FR-XXXX（4 位补零）+ {标题} 开头，紧接 metadata 表格，然后是需求描述；FR 之间用 `---` 分隔。
>
> **编号约定**: FR 编号使用 4 位数字，补零，初始草案从 100 开始，步长为 100。
>
> **AC 引用** [RESOLVED]: 验收标准使用 `AC-FRXXXX-YY` 格式（4 位 FR + 2 位 AC 序号），其中 `FRXXXX` 对应到下方各 FR/NFR 的编号（如 `AC-FR0100-01`、`AC-NFR0020-03` 等），见 `acceptance.md`。


>> **Sage**: **[Sage 响应 T-001]** 问题确认。已按 `.louke/templates/acceptance.md` 模板重写：1) acceptance.md 全部 17 个 AC 标题改为纯 `### AC-N`，规范 ID `AC-FR0100-01` 等作为纯文本紧跟标题下一行；2) spec.md 第 30 行格式说明改为 `AC-FRXXXX-YY`；3) 两份文档均添加 HTML 锚点（spec.md `<a id="fr-XXXX">`、acceptance.md `<a id="ac-fr-XXXX">`）以支持 cross-ref；4) 澄清日志记录本决策。请求 Lex 重跑 `verify-acceptance`。

<a id="fr-0100"></a>

### FR-0100 转向时网格对齐

| Valid | Testable | Decided |
|---|---|---|
| ✅ | ✅ | ✅ |

当坦克改变移动方向（从水平方向转为垂直方向，或从垂直方向转为水平方向）时，垂直于新移动方向的坐标应自动对齐（snap）到最近的网格线（TILE_SIZE=32 的整数倍）。

具体规则：
- **新方向为上/下（垂直）时**：将坦克的 X 坐标 snap 到 `Math.round(x / TILE_SIZE) * TILE_SIZE`。
- **新方向为左/右（水平）时**：将坦克的 Y 坐标 snap 到 `Math.round(y / TILE_SIZE) * TILE_SIZE`。
- 对齐发生在移动应用的同帧内，在方向变更后、位移计算前或同步进行。
- 如果坦克新方向与旧方向相同（未转向），不触发对齐。
- 如果坦克从静止状态（NONE 方向）开始移动，应触发对齐（初始方向视为"转向"）。

对齐函数：`snapToGrid(pixel) = Math.round(pixel / TILE_SIZE) * TILE_SIZE`

对应 AC：`AC-FR0100-01` ~ `AC-FR0100-06`，见 [acceptance.md#ac-fr-0100](acceptance.md#ac-fr-0100)。

---

<a id="fr-0200"></a>

### FR-0200 对齐应用于玩家和敌方坦克

| Valid | Testable | Decided |
|---|---|---|
| ✅ | ✅ | ✅ |

网格对齐机制应同时应用于玩家坦克和敌方坦克，确保行为一致。敌方坦克在 AI 改变方向时（包括随机方向变更和碰撞后方向变更）同样触发网格对齐。

对应 AC：`AC-FR0200-01` ~ `AC-FR0200-03`，见 [acceptance.md#ac-fr-0200](acceptance.md#ac-fr-0200)。

---

<a id="fr-0300"></a>

### FR-0300 对齐边界安全

| Valid | Testable | Decided |
|---|---|---|
| ✅ | ✅ | ✅ |

网格对齐不得将坦克推出画布边界。如果对齐后的坐标会导致坦克超出边界（`x < 0` 或 `x > CANVAS_SIZE - TANK_SIZE` 或 `y < 0` 或 `y > CANVAS_SIZE - TANK_SIZE`），则将对齐坐标钳制（clamp）到有效边界范围内。

注：由于 TANK_SIZE=30 < TILE_SIZE=32，对齐到网格线后坦克仍完全在边界内（最大对齐位置为 `31 * 32 = 992`，`992 + 30 = 1022 < 1024`），因此钳制在正常情况下不会触发，但作为防御性编程仍需实现。

对应 AC：`AC-FR0300-01` ~ `AC-FR0300-02`，见 [acceptance.md#ac-fr-0300](acceptance.md#ac-fr-0300)。

---

<a id="fr-0400"></a>

### FR-0400 同向移动保持网格对齐

| Valid | Testable | Decided |
|---|---|---|
| ✅ | ✅ | ✅ |

由于玩家速度（PLAYER_SPEED=4）和敌方速度（ENEMY_SPEED=3.2）均能整除 TILE_SIZE（32/4=8 帧/格，32/3.2=10 帧/格），当坦克从网格对齐位置开始沿同一方向移动时，每经过整数个 TILE_SIZE 距离后坐标自然回到网格线上。本需求确认这一现有行为不被破坏：坦克在同向连续移动期间不需要每帧重新对齐，但每次转向时的对齐确保了坦克始终在网格车道上。

对应 AC：`AC-FR0400-01` ~ `AC-FR0400-02`，见 [acceptance.md#ac-fr-0400](acceptance.md#ac-fr-0400)。

---

## 非功能需求

<a id="nfr-0010"></a>

### NFR-0010 对齐性能

| Valid | Testable | Decided |
|---|---|---|
| ✅ | ✅ | ✅ |

网格对齐计算（一次 `Math.round` + 乘法）为 O(1) 操作，不得影响 60fps 帧率。对齐逻辑应集成到现有的 `updatePlayer` / `updateEnemy` 移动流程中，不引入额外的渲染开销。

对应 AC：`AC-NFR0010-01`，见 [acceptance.md#ac-nfr-0010](acceptance.md#ac-nfr-0010)。

---

<a id="nfr-0020"></a>

### NFR-0020 对齐可测试性

| Valid | Testable | Decided |
|---|---|---|
| ✅ | ✅ | ✅ |

对齐函数（`snapToGrid`）应实现为 `tank.js` 模块中的纯函数，可独立单元测试。对齐行为应通过模拟方向变更的集成测试验证，使用确定性输入（非随机）确保可断言。

对应 AC：`AC-NFR0020-01` ~ `AC-NFR0020-03`，见 [acceptance.md#ac-nfr-0020](acceptance.md#ac-nfr-0020)。

---

## 澄清日志

> 记录评审期间提出的问题和决策。

### T-001 (Lex, 2026-07-14) — AC 引用格式不符合规范

**问题**: spec.md 第 30 行声明 AC 引用为 `AC-v0.1.1-001-grid-align-NNN` 格式；acceptance.md 各 AC 标题使用完整 ID（`### AC-v0.1.1-001-grid-align-001` 等）。
这与 `.louke/templates/spec.md` 和 `.louke/templates/acceptance.md` 模板要求不一致：
- 模板规定 AC 标题须为纯 `### AC-N`，规范 ID 在下一行以纯文本标注；
- 完整 AC 引用应为 `AC-FRXXXX-YY`（4 位 FR + 2 位 AC 序号），与 test-plan/issue schema 保持一致。

**决策**: 采用模板推荐的 `AC-FRXXXX-YY` 格式重写两份文档。

**采纳方案**:
1. **acceptance.md**: 标题改为纯 `### AC-N`（每个 FR/NFR 单元内从 1 顺序递增），规范 ID `AC-FR0100-01` 等作为纯文本放在标题下一行。同时为每个 FR/NFR 段落添加 `<a id="ac-fr-XXXX">` / `<a id="ac-nfr-XXXX">` 锚点，便于 spec 中的交叉引用。
2. **spec.md**: 修改第 30 行的格式说明为 `AC-FRXXXX-YY`；为每个 FR/NFR/US 添加 `<a id="fr-XXXX">` / `<a id="nfr-XXXX">` / `<a id="us-XXXX">` 锚点；在每个 FR/NFR 描述末尾补充"对应 AC"行，明确指向 acceptance.md 中对应的锚定段。

**影响**:
- acceptance.md 共 17 个 AC（FR-0100: 6, FR-0200: 3, FR-0300: 2, FR-0400: 2, NFR-0010: 1, NFR-0020: 3），全部重命名。
- spec.md 新增 8 个 HTML 锚点（1 US + 4 FR + 2 NFR + 1 备用），不改变语义内容。
- 不影响测试计划的 AC-FRXXXX-YY 引用一致性。
