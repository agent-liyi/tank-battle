# 坦克大战 — Test Plan

- **Spec ID**: v0.1.0-001-tank-battle
- **Created**: 2026-07-11
- **Related acceptance**: `.louke/project/specs/v0.1.0-001-tank-battle/acceptance.md`
- **Test framework**: jest

## 测试策略

本测试计划覆盖全部 65 个 AC（46 Unit + 12 Integration + 7 Manual）。核心逻辑模块（移动、射击、碰撞、AI、地图、生命、计分）通过 Jest 单元测试覆盖；游戏循环与多模块交互通过集成测试覆盖；渲染、视觉效果、性能、浏览器兼容通过手动/视觉测试覆盖。

## §1 Coverage Matrix

| AC ID | Type | Module | Priority |
|-------|------|--------|----------|
| AC-001 | Integration | Canvas & Rendering | P0 |
| AC-002 | Integration | Game Loop | P0 |
| AC-003 | Manual | Performance | P2 |
| AC-004 | Unit | Movement | P0 |
| AC-005 | Unit | Movement | P0 |
| AC-006 | Unit | Movement | P0 |
| AC-007 | Unit | Movement | P0 |
| AC-008 | Unit | Movement | P0 |
| AC-009 | Integration | Input | P0 |
| AC-010 | Unit | Movement | P0 |
| AC-011 | Unit | Shooting | P0 |
| AC-012 | Unit | Shooting | P0 |
| AC-013 | Unit | Shooting | P0 |
| AC-014 | Unit | Shooting | P0 |
| AC-015 | Unit | AI | P0 |
| AC-016 | Unit | AI | P0 |
| AC-017 | Unit | AI | P0 |
| AC-018 | Unit | AI | P0 |
| AC-019 | Unit | AI | P0 |
| AC-020 | Unit | AI | P0 |
| AC-021 | Unit | Collision | P0 |
| AC-022 | Unit | Collision | P0 |
| AC-023 | Unit | Collision | P0 |
| AC-024 | Unit | Map | P0 |
| AC-025 | Unit | Map | P0 |
| AC-026 | Unit | Collision | P0 |
| AC-027 | Unit | Collision | P0 |
| AC-028 | Unit | Collision | P0 |
| AC-029 | Unit | Collision | P0 |
| AC-030 | Unit | Collision | P0 |
| AC-031 | Unit | Collision | P0 |
| AC-032 | Unit | Collision | P0 |
| AC-033 | Unit | Collision | P0 |
| AC-034 | Manual | Rendering | P0 |
| AC-035 | Integration | Game Over | P0 |
| AC-036 | Integration | Game Over | P0 |
| AC-037 | Unit | Life | P1 |
| AC-038 | Unit | Life | P1 |
| AC-039 | Unit | Life | P1 |
| AC-040 | Integration | Game Over | P1 |
| AC-041 | Unit | Life | P1 |
| AC-042 | Unit | Scoring | P1 |
| AC-043 | Unit | Scoring | P1 |
| AC-044 | Unit | Scoring | P1 |
| AC-045 | Integration | Game Over | P0 |
| AC-046 | Integration | Game Over | P0 |
| AC-047 | Integration | Game Over | P0 |
| AC-048 | Integration | Game Over | P0 |
| AC-049 | Manual | Performance | P2 |
| AC-050 | Manual | Performance | P2 |
| AC-051 | Manual | Browser | P2 |
| AC-052 | Manual | Browser | P2 |
| AC-053 | Manual | Browser | P2 |
| AC-054 | Unit | Testability | P2 |
| AC-055 | Unit | Testability | P2 |
| AC-056 | Unit | Testability | P2 |
| AC-057 | Unit | Testability | P2 |
| AC-058 | Manual | Browser | P2 |
| AC-059 | Unit | AI | P0 |
| AC-060 | Integration | Input | P0 |
| AC-061 | Unit | Shooting | P0 |
| AC-062 | Unit | Testability | P2 |
| AC-063 | Integration | Testability | P2 |
| AC-064 | Integration | Game Over | P0 |
| AC-065 | Unit | AI | P0 |

**AC Count Summary**: 65 total ACs — 46 Unit / 12 Integration / 7 Manual

## §2 Unit Tests (Jest)

### 2.1 Movement Module (`src/modules/movement`)
- **AC-004–007**: Directional movement — verify position delta per frame matches 1 tile / 8 frames speed for each direction; verify tank direction property updates.
- **AC-008**: Diagonal input rejection — verify that when two directional inputs are active, only the last-pressed direction is applied; position should not update diagonally.
- **AC-010**: Boundary clamping — verify tank position is clamped within [0, 12] tile coordinates for all four directions at edges.
- **AC-062**: Meta — all movement test cases pass via `npx jest`.

### 2.2 Shooting Module (`src/modules/shooting`)
- **AC-011**: Bullet creation — verify bullet spawns at tank position, travels at 1 tile / 4 frames in tank's facing direction.
- **AC-012**: One-bullet limit — verify `fire()` returns null when a player bullet is already active on screen.
- **AC-013**: Cooldown enforcement — verify `fire()` returns null when called within 20 frames of the previous shot.
- **AC-014**: Boundary removal — verify bullet is removed from state when its tile coordinate exits [0, 12] × [0, 12].
- **AC-061**: No fire during death — verify `fire()` returns null when player is in `destroyed` or `respawning` state.

### 2.3 Collision Detection Module (`src/modules/collision`)
- **AC-021 / AC-026**: Bullet vs brick wall — verify bullet destroyed, brick tile removed.
- **AC-022 / AC-027**: Bullet vs steel wall — verify bullet destroyed, steel tile unchanged.
- **AC-023 / AC-029**: Tank vs water — verify tank movement blocked, position unchanged.
- **AC-028 / AC-032**: Tank vs wall / tank vs tank — verify movement blocked, no overlap.
- **AC-030**: Bullet vs enemy tank — verify enemy removed, bullet removed, score +100.
- **AC-031**: Enemy bullet vs player tank — verify player destroyed, life −1, bullet removed.
- **AC-033**: Bullet vs bullet — verify both bullets destroyed (mutual cancellation).
- **AC-035 / AC-036**: Bullet vs base — verify base destroyed, game over trigger.
- **AC-054**: Meta — all collision test cases pass via `npx jest`.

### 2.4 AI Module (`src/modules/ai`)
- **AC-015**: Spawn logic — verify enemies spawn at predefined positions (row 0, cols 0/6/12); max 4 active.
- **AC-016**: Autonomous movement — verify enemy tank moves each frame in its facing direction without input.
- **AC-017**: Random direction change — with mocked RNG, verify direction changes at the scheduled frame interval.
- **AC-018**: Collision reroute — verify direction changes to a different random direction on obstacle collision.
- **AC-019**: Firing interval — with mocked RNG, verify bullet fires at the scheduled frame interval.
- **AC-020**: Spawn replenishment — verify new enemies spawn as existing ones are destroyed, up to 4 active, until all 20 deployed.
- **AC-059**: Enemy bullets ignore base — verify enemy bullet colliding with base tile does not trigger base destruction.
- **AC-065**: Spawn deferral — verify spawn is deferred when position occupied by player tank; enemy spawns within 60 frames after clearance.
- **AC-056**: Meta — all AI test cases pass via `npx jest` with mocked random number generators.

### 2.5 Map Module (`src/modules/map`)
- **AC-024**: Forest pass-through — verify tanks can move into forest tiles (collision allows passage).
- **AC-025**: Initial layout — verify level data array produces correct tile types at each coordinate; base area U-shape (rows 11–12, cols 5–7) contains brick walls; eagle at (12, 6).
- **AC-057**: Meta — all map test cases pass via `npx jest` with predefined 13×13 level data array.

### 2.6 Life Module (`src/modules/life`)
- **AC-037**: Initialization — verify life counter starts at 3 on new game.
- **AC-038**: Life decrement + respawn — verify life counter decrements on player destruction; respawn at (12, 4) after 60-frame delay when lives > 0.
- **AC-039**: Invulnerability — verify player cannot be destroyed within 60 frames after respawn; life counter unchanged.
- **AC-041**: No respawn at 0 — verify when lives reach 0, no respawn occurs.
- **AC-055**: Meta — all life management test cases pass via `npx jest`.

### 2.7 Scoring Module (`src/modules/scoring`)
- **AC-042**: Initialization — verify score starts at 0 on new game.
- **AC-043**: Score increment — verify score increases by 100 per enemy destroyed; updated score reflected in output.
- **AC-044**: Full level score — verify score equals 2000 after all 20 enemies destroyed (20 × 100).
- **AC-055**: Meta — all scoring test cases pass via `npx jest`.

### 2.8 NFR-0030 Testability Meta-ACs
- **AC-054**: Collision module passes Jest test suite.
- **AC-055**: Scoring and life modules pass Jest test suite.
- **AC-056**: AI module with mocked RNG passes Jest test suite.
- **AC-057**: Map module passes Jest test suite.
- **AC-062**: Movement module passes Jest test suite.

## §3 Integration Tests

### 3.1 Game Loop (`src/core/loop`)
- **AC-002**: Update-then-render sequence — verify `update()` is called before `render()` each tick in the game loop.
- **AC-063**: rAF abstraction — verify `requestAnimationFrame` is accessed through an injectable interface; mock implementation enables deterministic frame-by-frame testing.

### 3.2 Input Handling (`src/core/input`)
- **AC-009**: Key release stops movement — verify player tank stops within 1 frame when all keys released.
- **AC-060**: WASD key mapping — verify W/A/S/D maps to Up/Left/Down/Right with same speed and last-pressed priority as Arrow keys.

### 3.3 Game Over State Machine (`src/core/gameover`)
- **AC-035**: Base destruction → defeat — verify bullet hitting base transitions game state to GAME OVER with DEFEAT; all updates halt.
- **AC-036**: Self-destruction — verify player's own bullet can destroy base, triggering DEFEAT.
- **AC-040**: Zero lives → defeat — verify life counter reaching 0 transitions to GAME OVER with DEFEAT.
- **AC-045**: All enemies destroyed → victory — verify destroying 20th enemy transitions to GAME OVER with VICTORY; all updates halt.
- **AC-046**: Defeat — base destroyed path (cross-check with AC-035).
- **AC-047**: Defeat — zero lives path (cross-check with AC-040).
- **AC-048**: Restart on Enter — verify pressing Enter during GAME OVER resets score to 0, lives to 3, reinitializes all game objects.
- **AC-064**: Input blocked during game over — verify all input (Space, movement keys) is ignored when game over overlay is displayed.

### 3.4 Canvas Initialization (`src/core/canvas`)
- **AC-001**: Canvas creation — verify `<canvas>` element created with 416×416 pixel dimensions; dark background color applied.

## §4 Manual / Visual Tests

### 4.1 Visual Rendering
- **AC-034**: Base (eagle) visual — verify base tile at (12, 6) displays a distinct visual (eagle icon or colored diamond).

### 4.2 Visual Effects
- **AC-024**: Forest overlay — manual verification: tank sprite rendered with partial transparency or under forest overlay while on forest tiles.

### 4.3 Performance
- **AC-003**: Frame timing — measure average frame duration over 100 frames; verify between 14ms and 20ms.
- **AC-049**: Sustained 50fps — verify frame rate ≥50 fps over 5 seconds with 4 enemies + player + bullets active. *(Requires Playwright/Selenium)*
- **AC-050**: Average frame time — verify ≤20ms average over 300 frames via browser performance API. *(Requires Playwright/Selenium)*

### 4.4 Browser Compatibility
- **AC-051**: Chrome — canvas renders, keyboard responsive, no console errors. *(Requires Playwright/Selenium)*
- **AC-052**: Firefox — canvas renders, keyboard responsive, no console errors. *(Requires Playwright/Selenium)*
- **AC-053**: Safari — canvas renders, keyboard responsive, no console errors. *(Requires Playwright/Selenium)*
- **AC-058**: Edge — canvas renders, keyboard responsive, no console errors. *(Requires Playwright/Selenium)*

## §5 Test Priority (P0/P1/P2)

### P0 — Core Gameplay (Must Pass Before Merge)
- **Unit**: Movement (AC-004–008, 010), Shooting (AC-011–014, 061), Collision (all 8 FR-0600 ACs), AI (AC-015–020, 059, 065), Map (AC-024, 025)
- **Integration**: Canvas init (AC-001), Game loop (AC-002), Input (AC-009, 060), Game over transitions (AC-035, 036, 045, 046, 047, 048, 064)
- **Manual**: Base rendering (AC-034)
- **Total P0 ACs**: 46

### P1 — Secondary Mechanics (Must Pass Before Release)
- **Unit**: Life (AC-037–039, 041), Scoring (AC-042–044)
- **Integration**: Zero-lives game over (AC-040)
- **Total P1 ACs**: 8

### P2 — Non-functional & Meta (Informational)
- **Unit**: Testability meta (AC-054–057, 062)
- **Integration**: rAF abstraction (AC-063)
- **Manual**: Performance (AC-003, 049, 050), Browser compat (AC-051–053, 058)
- **Total P2 ACs**: 11

## §6 E2E Test Paths

### E2E-01: Full Victory Playthrough
1. Player opens game → canvas renders with 13×13 map, base at bottom center.
2. Arrow keys move player tank in all four directions.
3. Space fires bullets; bullets destroy brick walls; collision with steel stops bullets.
4. Enemy tanks spawn from top (max 4 active); player destroys them one by one.
5. Score increments +100 per kill; displayed on UI.
6. After 20th enemy destroyed → "GAME OVER" overlay displays "VICTORY".
7. All game updates halt; pressing Enter restarts game with score=0, lives=3.

### E2E-02: Player Death & Respawn
1. Player tank hit by enemy bullet → player destroyed, life −1 (2 remaining).
2. After 60-frame invulnerability period, player respawns at (12, 4).
3. During invulnerability, enemy bullets pass through without damage; tank blinks.
4. Player hit twice more → life reaches 0 → "GAME OVER" overlay displays "DEFEAT".

### E2E-03: Base Destruction (Defeat)
1. Player accidentally fires bullet toward base → base destroyed → "DEFEAT" immediately.
2. (Alternative) Enemy breaks through defenses; any bullet hits base → "DEFEAT".
3. Game halts; Enter restarts fresh game.

### E2E-04: Terrain Interaction
1. Player moves through forest tiles (passable, visual overlay applied).
2. Player blocked by brick walls; bullet destroys brick tile → path opens.
3. Player blocked by steel walls; bullets destroyed with no effect.
4. Player blocked by water tiles; bullets fly over water.

### E2E-05: Tank-Tank & Bullet-Bullet Collision
1. Player tank approaches enemy tank → both blocked, no overlap.
2. Player bullet and enemy bullet collide mid-air → both destroyed.
3. Player tactical advantage: only 1 active bullet vs up to 4 enemy bullets; mutual cancellation mechanic intentional.

### E2E-06: Edge Cases
1. Player at map boundary → movement blocked (cannot exit 13×13 grid).
2. Player pressing two directions → only last-pressed applies (no diagonal).
3. Player pressing Space while destroyed → no bullet, no cooldown trigger.
4. Enemy spawn position occupied by player → spawn deferred until clear.
5. All input ignored during GAME OVER state; only Enter triggers restart.

## §7 Test Environment

### 7.1 Directory Layout

```
tests/
├── unit/
│   ├── movement.test.js      # AC-004–008, 010, 062
│   ├── shooting.test.js      # AC-011–014, 061
│   ├── collision.test.js     # AC-021–033, 054
│   ├── ai.test.js            # AC-015–020, 059, 065, 056
│   ├── map.test.js           # AC-024, 025, 057
│   ├── life.test.js          # AC-037–039, 041, 055
│   └── scoring.test.js       # AC-042–044, 055
├── integration/
│   ├── gameloop.test.js      # AC-002, 063
│   ├── input.test.js         # AC-009, 060
│   ├── gameover.test.js      # AC-035, 036, 040, 045–048, 064
│   └── canvas.test.js        # AC-001
├── e2e/
│   └── scenarios.test.js     # E2E-01 ~ E2E-06
└── assets/
    └── level-data.json       # Predefined 13x13 level layout
```

### 7.2 Naming Conventions
- File: `{module}.test.js`
- Test case: `test('AC-{NNN} {description}', () => { ... })`
- First line of each test docstring/comment must contain `AC-v0.1.0-001-tank-battle-NNN`.

### 7.3 Execution
- **Offline**: No network dependencies; test data pinned in `tests/assets/`.
- **Execution order**: `npx jest tests/unit` → `npx jest tests/integration` → `npx jest tests/e2e`
- **CI**: Run full suite on every push; P0 failures block merge.

### 7.4 Key Testing Infrastructures
- **Mocked RNG**: Required for AI module determinism (AC-016–019, 056). Inject via dependency injection.
- **Mocked rAF**: Required for game loop testing (AC-002, 063). Access through injectable interface.
- **DOM Environment**: Integration tests require `jest-environment-jsdom` for canvas tests (AC-001).

## §8 AC Reference Closure

| FR / NFR | AC Range | Count | Test Types | Closure |
|----------|----------|-------|------------|---------|
| FR-0100 Canvas & Rendering | 001–003 | 3 | 2 Integration + 1 Manual | ✓ |
| FR-0200 Movement | 004–010, 060 | 8 | 6 Unit + 2 Integration | ✓ |
| FR-0300 Shooting | 011–014, 061 | 5 | 5 Unit | ✓ |
| FR-0400 Enemy AI | 015–020, 059, 065 | 8 | 8 Unit | ✓ |
| FR-0500 Map | 021–025 | 5 | 4 Unit + 1 Manual | ✓ |
| FR-0600 Collision | 026–033 | 8 | 8 Unit | ✓ |
| FR-0700 Base | 034–036 | 3 | 1 Manual + 2 Integration | ✓ |
| FR-0800 Life | 037–041 | 5 | 4 Unit + 1 Integration | ✓ |
| FR-0900 Scoring | 042–044 | 3 | 3 Unit | ✓ |
| FR-1000 Game Over | 045–048, 064 | 5 | 5 Integration | ✓ |
| NFR-0010 Performance | 049–050 | 2 | 2 Manual | ✓ |
| NFR-0020 Browser | 051–053, 058 | 4 | 4 Manual | ✓ |
| NFR-0030 Testability | 054–057, 062–063 | 6 | 5 Unit + 1 Integration | ✓ |

**All 13 FR/NFR sections have AC coverage. All 65 ACs have test type assigned.**
