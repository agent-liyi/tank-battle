# 坦克大战 — Spec

- **Spec ID**: v0.1.0-001-tank-battle
- **Created**: 2026-07-10
- **Status**: Draft

> **[RESOLVED] Responsibility split**: This document only describes the requirements themselves (FR/NFR descriptions + metadata).
> Acceptance criteria (observable, assertable pass conditions) live in `acceptance.md` so they can grow without bloating spec.
> The test plan (`test-plan.md`) references both spec.md and acceptance.md as inputs.

## User Stories

### US-0010
story: As a player, I want to control a tank with arrow keys and shoot enemies, so that I can experience classic FC tank battle gameplay.
priority: P0

### US-0020
story: As a player, I want to see a map with different terrain types (bricks, steel, water, forest), so that the battlefield feels strategic and varied.
priority: P0

### US-0030
story: As a player, I want to protect my base (eagle) from enemy tanks, so that I have a clear win/lose condition beyond just combat.
priority: P0

### US-0040
story: As a player, I want a life system and score display, so that I have clear feedback on my performance and progress.
priority: P1

## Usage Scenarios

### scenario-0010

The player opens the game in a web browser. The game canvas renders a 13x13 tile grid map. The player tank spawns at the bottom of the map, near the base (eagle). Three enemy tanks spawn at the top of the map. The player uses arrow keys to move the tank in four directions and presses Space to fire bullets. Enemy tanks move autonomously with random direction changes and fire bullets periodically. The player must destroy all enemy tanks while protecting the base. Destroying an enemy tank awards points. If the player tank is hit, it respawns after a short delay (consuming one life). The game ends when all enemies are destroyed (victory) or the base is destroyed / all lives are lost (defeat).

## Functional Requirements

> **[RESOLVED] Format convention (must read)**: Each FR unit starts with a level-3 heading + space + FR-XXXX (uppercase, 4-digit zero-padded) + {title}, immediately followed by a 3-column metadata table (Valid / Testable / Decided), then the requirement description; separate FRs with `---`.
>
> **[RESOLVED] Numbering convention (must read)**: FR codes use **4 digits**, zero-padded, **starting from 100 in the initial draft, stepping by 100**; **after the first review round, insert by step 10**; **after the second round, use sequential numbering**.
>
> **[RESOLVED] Must read**: The FR-XXXX code is the id of that requirement. Never delete an existing requirement id to avoid reference confusion; if a FR must be deprecated, change `Valid` to `❌` in the table and explain in the clarification log.
>
> **[RESOLVED] AC reference**: Acceptance criteria use the `AC-v0.1.0-001-tank-battle-NNN` format, see `acceptance.md`.
>
> **[RESOLVED] Metadata fields (table columns)**:
> - Valid: `✅` = still active, `❌` = deprecated
> - Testable: `✅` = can be tested/asserted, `⚠️ {reason}` = has reservations
> - Decided: `✅` = user approved, `⚠️` = pending clarification, `❌` = user explicitly rejected

### FR-0100 Game Canvas & Rendering

| Valid | Testable | Decided |
|---|---|---|---|
| ✅ | ✅ | ✅ |

The game shall render on a fixed-size HTML5 Canvas element. The game world is a 13-column by 13-row tile-based grid, where each tile is 32x32 pixels (total play area: 416x416 pixels). The game shall run a main loop at 60 frames per second using `requestAnimationFrame`. Each frame shall clear the canvas, update game state (movement, collision, AI), and render all game objects (grid, tanks, bullets, base, UI overlay). The canvas shall have a dark background color.

---

### FR-0200 Player Tank Movement

| Valid | Testable | Decided |
|---|---|---|---|
| ✅ | ✅ | ✅ |

The player tank shall move in four directions: up, down, left, right. Movement is controlled via keyboard input (Arrow keys or W/A/S/D). The tank shall face the direction of its last movement. Holding a movement key shall continuously move the tank at a fixed speed (1 tile per 8 frames at 60fps, approximately 240px/s). Releasing all keys shall stop the tank. Diagonal movement (pressing two directions simultaneously) shall be ignored — only the last pressed direction is respected.

---

### FR-0300 Player Tank Shooting

| Valid | Testable | Decided |
|---|---|---|---|
| ✅ | ✅ | ✅ |

The player shall be able to fire bullets by pressing the Space key. Bullets shall travel in the direction the tank is facing at a speed faster than tank movement (1 tile per 4 frames at 60fps, approximately 480px/s). Only one player bullet may be active on the screen at a time. A cooldown of 20 frames (~333ms) shall be enforced between consecutive shots. Bullets that travel beyond the canvas boundary shall be removed from the game state.

---

### FR-0400 Enemy Tank AI

| Valid | Testable | Decided |
|---|---|---|---|
| ✅ | ✅ | ✅ |

Enemy tanks shall spawn at predefined positions at the top of the map (typically the top row, columns 0, 6, 12). A level shall have a total of 20 enemy tanks, with a maximum of 4 active on screen simultaneously. Enemy tanks shall move autonomously in one of four directions, with a random direction change every 60–180 frames. When an enemy tank collides with an obstacle, it shall choose a new random direction. Enemy tanks shall fire bullets at random intervals (every 60–180 frames). Enemy bullets follow the same physics as player bullets. Enemy tanks shall not destroy the base (eagle) unless directed by player actions (enemy bullets cannot target the base).

---

### FR-0500 Map Elements

| Valid | Testable | Decided |
|---|---|---|---|
| ✅ | ✅ | ✅ |

The game map shall include four terrain tile types:
- **Brick wall**: A destructible tile. When hit by any bullet, the impacted brick tile is removed. Tanks cannot pass through brick walls.
- **Steel wall**: An indestructible tile. Bullets are destroyed on impact with no effect on the tile. Tanks cannot pass through steel walls.
- **Water**: An impassable tile for tanks. Bullets fly over water without interaction.
- **Forest**: A tile that tanks can pass through but provides visual cover (game objects underneath are partially obscured). Bullets fly through forest without interaction.
The initial map layout shall be loaded from a predefined 13x13 level data array. The base area shall be surrounded by brick walls in a U-shape pattern.

---

### FR-0600 Collision Detection

| Valid | Testable | Decided |
|---|---|---|---|
| ✅ | ✅ | ✅ |

The game shall implement AABB (axis-aligned bounding box) collision detection for all game objects. Collision rules:
- Bullet vs brick wall: bullet is destroyed, brick tile is removed.
- Bullet vs steel wall: bullet is destroyed, steel tile remains.
- Bullet vs player tank: player tank is destroyed (lose one life), bullet is destroyed.
- Bullet vs enemy tank: enemy tank is destroyed (score awarded), bullet is destroyed.
- Bullet vs base (eagle): base is destroyed (game over), bullet is destroyed.
- Tank vs wall/water tile: movement is blocked in the colliding direction.
- Tank vs tank: both tanks are blocked from overlapping.
- Bullet vs bullet: both bullets are destroyed (mutual cancellation).

---

### FR-0700 Base (Eagle) Defense

| Valid | Testable | Decided |
|---|---|---|---|
| ✅ | ✅ | ✅ |

The base (eagle) shall be placed at the bottom center of the map (row 12, column 6, occupying 1 tile). The base is the player's primary objective to protect. If any bullet (player or enemy) hits the base, the base is destroyed and the game ends immediately in defeat. The base shall be rendered with a distinct visual (eagle icon or colored diamond). The base is initially surrounded by brick walls in a U-shape (3 bricks wide at top, 2 bricks tall on sides) to provide initial protection.

---

### FR-0800 Life System

| Valid | Testable | Decided |
|---|---|---|---|
| ✅ | ✅ | ✅ |

The player shall start with 3 lives. Each time the player tank is destroyed by an enemy bullet, one life is consumed. When a life is consumed and the player has remaining lives, the player tank respawns at the starting position (bottom center-left, row 12, column 4) after a 60-frame invulnerability period. During invulnerability, the player tank shall visually blink and cannot be destroyed. When all lives are consumed, the game ends in defeat. The remaining lives count shall be displayed on the UI overlay.

---

### FR-0900 Scoring System

| Valid | Testable | Decided |
|---|---|---|---|
| ✅ | ✅ | ✅ |

The player shall earn points for destroying enemy tanks:
- Standard enemy tank: 100 points
Points shall accumulate across the entire game session. The current score shall be displayed on the UI overlay at all times. The score starts at 0 at the beginning of each game.

---

### FR-1000 Game Over Conditions

| Valid | Testable | Decided |
|---|---|---|---|
| ✅ | ✅ | ✅ |

The game shall end under the following conditions:
- **Victory**: All 20 enemy tanks for the current level have been destroyed. A "GAME OVER" overlay with "VICTORY" text shall be displayed.
- **Defeat (base destroyed)**: The base (eagle) is hit by any bullet. A "GAME OVER" overlay with "DEFEAT" text shall be displayed.
- **Defeat (no lives)**: The player loses all lives. A "GAME OVER" overlay with "DEFEAT" text shall be displayed.
When the game ends, all game logic shall halt (no further updates). The player may restart the game by pressing the Enter key.

---

## Non-Functional Requirements

> **[RESOLVED] Must read**: Format and numbering rules are the same as FR; omitted here.

### NFR-0010 Performance

| Valid | Testable | Decided |
|---|---|---|---|
| ✅ | ✅ | ✅ |

The game shall maintain a consistent 60 frames per second (fps) frame rate on modern desktop browsers (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+). Frame drops below 50 fps shall not occur during normal gameplay with 4 active enemy tanks and all bullets on screen.

---

### NFR-0020 Browser Compatibility

| Valid | Testable | Decided |
|---|---|---|---|
| ✅ | ✅ | ✅ |

The game shall run on the latest two major versions of Chrome, Firefox, Safari, and Edge. The game shall use only ECMAScript 2015+ features supported by these browsers without requiring transpilation. No external libraries or frameworks are required beyond the browser's built-in Canvas 2D API.

---

### NFR-0030 Code Testability

| Valid | Testable | Decided |
|---|---|---|---|
| ✅ | ✅ | ✅ |

Core game logic modules (movement, collision detection, scoring, life management, AI, map loading) shall be implemented as pure functions or classes with injectable dependencies, separated from rendering concerns. Each module shall be independently testable using the Jest test framework. The game loop integration with `requestAnimationFrame` shall be abstracted behind an interface to allow deterministic testing.

---

## Clarification Log

> **[RESOLVED]** Record questions raised during user review, Sage/Lex replies, reasons for deprecated requirements, and any decisions that affect FR/NFR table status.

> **[RESOLVED] Lex Review 2026-07-10**: PASS with 11 issues (0 L1-L5 structural failures, 11 content-level findings)
> - [L4] NFR-0020 lists Edge 90+ as required browser but acceptance.md only covers Chrome (AC-051), Firefox (AC-052), Safari (AC-053) — no Edge AC
> - [Coverage] FR-0400 states "Enemy tanks shall not destroy the base (eagle)" but acceptance.md has no AC verifying enemy bullets cannot hit the base
> - [Coverage] FR-0200 specifies W/A/S/D as alternative movement keys but AC-004 through AC-010 only test Arrow keys
> - [Coverage] FR-0300: no AC for what happens when player presses Space while tank is destroyed / during respawn delay
> - [Coverage] NFR-0030 mentions "movement" and "AI" as independently testable modules — AC-056 covers AI but no AC covers movement module unit tests
> - [Coverage] NFR-0030 states "requestAnimationFrame shall be abstracted behind an interface" but no AC verifies this abstraction exists
> - [Testability] AC-024 (forest tile half-transparency/overlay rendering) is a visual assertion — cannot be verified by Jest unit tests; may need canvas pixel-sampling or be deferred to manual testing
> - [Testability] AC-049/AC-050 (performance FP50/FP30 thresholds) and AC-051–AC-053 (browser compatibility) are integration-level checks requiring real browsers; cannot be fully automated in CI without Playwright/Selenium
> - [Design] Bullet-bullet mutual cancellation (AC-033 / FR-0600): player has only 1 active bullet while up to 4 enemies can fire — cancellation inherently favours enemies; worth confirming this is intentional
> - [Boundary] No AC covers player attempting to shoot during GAME OVER state (FR-1000 says "all game logic shall halt")
> - [Boundary] FR-0400 AC-020 covers spawn replenishment logic but no AC for the edge case where the player tank is occupying a spawn position when a new enemy tries to spawn there
>
> **[RESOLVED] Lex Review #2 2026-07-10**: PASS — all 11 issues from review #1 resolved. AC-058~065 verified added; AC numbers 001–065 continuous with no gaps; all 13 FR/NFR sections have corresponding acceptance tests; testability notes are reasonable.
>
> **[RESOLVED] Sage Response 2026-07-10**: All 11 issues addressed as follows:
>
> **Accepted — ACs added:**
> - [Issue 1] Edge browser: Added AC-058 under NFR-0020
> - [Issue 2] Enemy bullets not attacking base: Added AC-059 under FR-0400
> - [Issue 3] W/A/S/D keys: Added AC-060 under FR-0200 (Arrow-key ACs remain primary; WASD verified for equivalent behavior)
> - [Issue 4] Player death + Space: Added AC-061 under FR-0300 (Space ignored during destruction/respawn delay)
> - [Issue 5a] Movement module unit tests: Added AC-062 under NFR-0030
> - [Issue 5b] rAF abstraction: Added AC-063 under NFR-0030
> - [Issue 10] Game Over shooting: Added AC-064 under FR-1000 (all input ignored during GAME OVER state)
> - [Issue 11] Enemy spawn position conflict: Added AC-065 under FR-0400 (spawn deferred if position occupied)
>
> **Annotated existing ACs:**
> - [Issue 6] AC-024 forest visuals: Added "Manual verification" testability note
> - [Issue 7] AC-049/AC-050/AC-051/AC-052/AC-053 performance & browser: Added "Requires Playwright/Selenium integration test" note
>
> **Accepted without changes:**
> - [Issue 8] Random AI: AC-056 already covers deterministic testing via mocked RNG — sufficient; no further AC needed.
>
> **Design confirmed (no spec change):**
> - [Issue 9] Bullet-bullet mutual cancellation: Design is intentional. Classic FC Tank Battle features this mechanic; the 1-bullet-vs-4 asymmetry is counterbalanced by the human player's tactical advantage over random AI. No spec change needed.

