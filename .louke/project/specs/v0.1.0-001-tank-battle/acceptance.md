# 坦克大战 — Acceptance Criteria

- **Spec ID**: v0.1.0-001-tank-battle
- **Created**: 2026-07-10

> Central registry of acceptance criteria. spec.md only keeps FR/NFR requirement descriptions and metadata (testability/resolved/valid);
> detailed observable, assertable pass conditions live in this table.
>
> Numbering convention:
> - AC-v0.1.0-001-tank-battle-NNN, where NNN is a 3-digit sequential number starting from 001.
>
> During Lex phase 1/2 review, verify: (1) this table exists; (2) every FR/NFR in spec.md has a corresponding section here; (3) each AC can be tested/asserted.

## FR-0100 Game Canvas & Rendering

### AC-v0.1.0-001-tank-battle-001
- **Given** the game module is loaded in a browser
- **When** the game initializes
- **Then** a `<canvas>` element is created with dimensions 416x416 pixels
- **And** the canvas has a dark background color

### AC-v0.1.0-001-tank-battle-002
- **Given** the game is running
- **When** the game loop executes
- **Then** each frame calls the update logic followed by the render logic
- **And** the game loop targets a consistent 60fps using `requestAnimationFrame`

### AC-v0.1.0-001-tank-battle-003
- **Given** the game is running at 60fps
- **When** 100 frames are measured
- **Then** the average frame duration is between 14ms and 20ms (approximately 50–60fps)

## FR-0200 Player Tank Movement

### AC-v0.1.0-001-tank-battle-004
- **Given** the player tank is on the map at position (x, y)
- **When** the player presses Arrow Up
- **Then** the tank moves upward at the defined speed (1 tile per 8 frames)
- **And** the tank sprite faces upward

### AC-v0.1.0-001-tank-battle-005
- **Given** the player tank is on the map at position (x, y)
- **When** the player presses Arrow Down
- **Then** the tank moves downward at the defined speed
- **And** the tank sprite faces downward

### AC-v0.1.0-001-tank-battle-006
- **Given** the player tank is on the map at position (x, y)
- **When** the player presses Arrow Left
- **Then** the tank moves leftward at the defined speed
- **And** the tank sprite faces left

### AC-v0.1.0-001-tank-battle-007
- **Given** the player tank is on the map at position (x, y)
- **When** the player presses Arrow Right
- **Then** the tank moves rightward at the defined speed
- **And** the tank sprite faces right

### AC-v0.1.0-001-tank-battle-008
- **Given** the player is holding Arrow Up
- **When** the player presses Arrow Right while still holding Arrow Up
- **Then** only the last pressed direction (Right) is applied
- **And** the tank does not move diagonally

### AC-v0.1.0-001-tank-battle-009
- **Given** the player tank is moving in a direction
- **When** the player releases all movement keys
- **Then** the tank stops moving within 1 frame

### AC-v0.1.0-001-tank-battle-010
- **Given** the player tank is at map boundary (x=0 or x=12 or y=0 or y=12 in tile coordinates)
- **When** the player presses a direction that would move the tank beyond the boundary
- **Then** the tank does not move outside the 13x13 grid

### AC-v0.1.0-001-tank-battle-060
- **Given** the player tank is on the map
- **When** the player presses W, A, S, or D respectively
- **Then** the tank moves in the corresponding direction (W=Up, S=Down, A=Left, D=Right) at the same speed as Arrow key input
- **And** the WASD keys follow the same last-pressed-direction priority behavior as Arrow keys

## FR-0300 Player Tank Shooting

### AC-v0.1.0-001-tank-battle-011
- **Given** the player tank is on the map facing upward
- **When** the player presses Space
- **Then** a bullet is created at the tank's position
- **And** the bullet travels upward at the defined bullet speed (1 tile per 4 frames)

### AC-v0.1.0-001-tank-battle-012
- **Given** the player tank is facing a direction with one active bullet on screen
- **When** the player presses Space
- **Then** no new bullet is created until the existing bullet is destroyed

### AC-v0.1.0-001-tank-battle-013
- **Given** the player tank fired a bullet and 15 frames have passed
- **When** the player presses Space again
- **Then** no new bullet is created (cooldown of 20 frames not yet elapsed)

### AC-v0.1.0-001-tank-battle-014
- **Given** a player bullet is traveling on the canvas
- **When** the bullet reaches a tile coordinate outside the 13x13 grid (x < 0 or x >= 13 or y < 0 or y >= 13)
- **Then** the bullet is removed from the game state

### AC-v0.1.0-001-tank-battle-061
- **Given** the player tank has been destroyed and is in the 60-frame respawn delay
- **When** the player presses Space
- **Then** no bullet is created
- **And** the shooting cooldown is not triggered

## FR-0400 Enemy Tank AI

### AC-v0.1.0-001-tank-battle-015
- **Given** a level has started
- **When** enemy tanks spawn
- **Then** the first enemy appears at a predefined spawn position (row 0, column 0, 6, or 12)
- **And** a maximum of 4 enemy tanks are active on screen at any time

### AC-v0.1.0-001-tank-battle-016
- **Given** an enemy tank is active on the map
- **When** the game updates each frame
- **Then** the enemy tank moves in its current facing direction autonomously without player input

### AC-v0.1.0-001-tank-battle-017
- **Given** an enemy tank is active on the map
- **When** 60 to 180 frames have elapsed (randomized per enemy)
- **Then** the enemy tank changes to a new random direction

### AC-v0.1.0-001-tank-battle-018
- **Given** an enemy tank is moving and collides with a wall or other obstacle
- **When** the collision is detected
- **Then** the enemy tank immediately selects a new random direction different from the blocked direction

### AC-v0.1.0-001-tank-battle-019
- **Given** an enemy tank is active on the map
- **When** 60 to 180 frames have elapsed (randomized per enemy)
- **Then** the enemy tank fires a bullet in its current facing direction

### AC-v0.1.0-001-tank-battle-020
- **Given** a total of 20 enemy tanks are queued for the level and 4 have been destroyed
- **When** the game updates
- **Then** new enemies spawn to maintain up to 4 active tanks on screen until all 20 are deployed

### AC-v0.1.0-001-tank-battle-059
- **Given** the game is in progress, the base is intact, and an enemy bullet is traveling on the map
- **When** the enemy bullet's bounding box overlaps the base tile
- **Then** the base remains intact
- **And** the game does not end (enemy bullets do not trigger base destruction)

### AC-v0.1.0-001-tank-battle-065
- **Given** a new enemy tank is queued to spawn at a predefined position
- **When** the spawn position is currently occupied by the player tank
- **Then** enemy spawn is deferred until the position is clear
- **And** the enemy spawns within 60 frames after the position becomes available

## FR-0500 Map Elements

### AC-v0.1.0-001-tank-battle-021
- **Given** a map is loaded with brick wall tiles
- **When** a bullet (player or enemy) hits a brick wall tile
- **Then** the bullet is destroyed and the brick wall tile is removed from the map

### AC-v0.1.0-001-tank-battle-022
- **Given** a map is loaded with steel wall tiles
- **When** a bullet (player or enemy) hits a steel wall tile
- **Then** the bullet is destroyed and the steel wall tile remains unchanged

### AC-v0.1.0-001-tank-battle-023
- **Given** a map is loaded with water tiles
- **When** a tank (player or enemy) attempts to move into a water tile
- **Then** the tank's movement is blocked
- **And** bullets pass over water tiles without any interaction

### AC-v0.1.0-001-tank-battle-024
- **Given** a map is loaded with forest tiles
- **When** a tank (player or enemy) enters a forest tile
- **Then** the tank can pass through
- **And** the tank sprite is rendered with partial transparency or under a forest overlay while on the forest tile
- **Testability Note**: Manual verification — visual rendering cannot be asserted by Jest unit tests

### AC-v0.1.0-001-tank-battle-025
- **Given** the initial level map is loaded
- **When** the map data is read
- **Then** the base area (row 11–12, columns 5–7) contains brick walls in a U-shape: 3 bricks wide on top row, 2 bricks tall on left and right sides
- **And** the eagle tile is at (row 12, column 6)

## FR-0600 Collision Detection

### AC-v0.1.0-001-tank-battle-026
- **Given** a player bullet is traveling toward a brick wall tile
- **When** the bullet's bounding box overlaps the brick wall tile's bounding box
- **Then** the bullet is destroyed and the brick wall tile is removed

### AC-v0.1.0-001-tank-battle-027
- **Given** a player bullet is traveling toward a steel wall tile
- **When** the bullet's bounding box overlaps the steel wall tile's bounding box
- **Then** the bullet is destroyed and the steel wall tile remains

### AC-v0.1.0-001-tank-battle-028
- **Given** the player tank is adjacent to a brick wall tile
- **When** the player attempts to move into the brick wall tile
- **Then** the player tank's movement is blocked in that direction

### AC-v0.1.0-001-tank-battle-029
- **Given** the player tank is adjacent to a water tile
- **When** the player attempts to move into the water tile
- **Then** the player tank's movement is blocked in that direction

### AC-v0.1.0-001-tank-battle-030
- **Given** a bullet (player or enemy) is traveling toward an enemy tank
- **When** the bullet's bounding box overlaps the enemy tank's bounding box
- **Then** the enemy tank is destroyed and removed from the game
- **And** the bullet is destroyed
- **And** the player's score increases by 100 points

### AC-v0.1.0-001-tank-battle-031
- **Given** an enemy bullet is traveling toward the player tank
- **When** the bullet's bounding box overlaps the player tank's bounding box
- **Then** the player tank is destroyed
- **And** the player loses one life
- **And** the bullet is destroyed

### AC-v0.1.0-001-tank-battle-032
- **Given** the player tank and an enemy tank are approaching each other
- **When** the two tanks' bounding boxes would overlap
- **Then** both tanks are blocked from entering the overlapping position
- **And** neither tank is destroyed (tank-tank collision does not cause destruction)

### AC-v0.1.0-001-tank-battle-033
- **Given** a player bullet and an enemy bullet are traveling toward each other
- **When** the two bullets' bounding boxes overlap
- **Then** both bullets are destroyed (mutual cancellation)

## FR-0700 Base (Eagle) Defense

### AC-v0.1.0-001-tank-battle-034
- **Given** the game level is loaded
- **When** the map renders
- **Then** the base (eagle) is displayed at tile position (row 12, column 6) with a distinct visual representation

### AC-v0.1.0-001-tank-battle-035
- **Given** the game is in progress and the base is intact
- **When** any bullet (player or enemy) hits the base tile
- **Then** the base is destroyed
- **And** the game ends immediately with a "DEFEAT" result

### AC-v0.1.0-001-tank-battle-036
- **Given** the game is in progress and the base is intact
- **When** the player tank fires a bullet toward the base
- **Then** the base is destroyed upon impact
- **And** the game ends with "DEFEAT" (the player can destroy their own base)

## FR-0800 Life System

### AC-v0.1.0-001-tank-battle-037
- **Given** a new game starts
- **When** the player tank spawns
- **Then** the life counter is set to 3
- **And** the life counter is displayed on the UI overlay

### AC-v0.1.0-001-tank-battle-038
- **Given** the player has 2 lives remaining and the player tank is destroyed
- **When** the destruction animation completes
- **Then** the life counter decrements to 1
- **And** a new player tank respawns at the starting position (row 12, column 4) after 60 frames

### AC-v0.1.0-001-tank-battle-039
- **Given** the player tank has just respawned (invulnerability period)
- **When** an enemy bullet hits the player tank within the first 60 frames after respawn
- **Then** the player tank is not destroyed
- **And** the life counter is not decremented
- **And** the player tank visually blinks during the invulnerability period

### AC-v0.1.0-001-tank-battle-040
- **Given** the player has 1 life remaining and the player tank is destroyed
- **When** the life counter decrements to 0
- **Then** the game ends with a "DEFEAT" result

### AC-v0.1.0-001-tank-battle-041
- **Given** the player has 0 lives remaining
- **When** the game checks the game over condition
- **Then** no respawn occurs
- **And** the game over overlay is displayed

## FR-0900 Scoring System

### AC-v0.1.0-001-tank-battle-042
- **Given** a new game starts
- **When** the game initializes
- **Then** the score is set to 0
- **And** the score is displayed on the UI overlay

### AC-v0.1.0-001-tank-battle-043
- **Given** the score is 200 and the player destroys an enemy tank
- **When** the enemy tank is hit by the player's bullet
- **Then** the score increments by 100 to 300
- **And** the updated score is visible on the UI overlay within 1 frame

### AC-v0.1.0-001-tank-battle-044
- **Given** the player has destroyed 20 enemy tanks
- **When** the score is displayed
- **Then** the score equals 20 × 100 = 2000 points

## FR-1000 Game Over Conditions

### AC-v0.1.0-001-tank-battle-045
- **Given** 20 enemy tanks have been queued and the player has destroyed all 20
- **When** the last enemy tank is destroyed
- **Then** the game ends with a "GAME OVER" overlay displaying "VICTORY"
- **And** all game logic updates halt

### AC-v0.1.0-001-tank-battle-046
- **Given** the game is in progress and the base is intact
- **When** any bullet collides with the base tile
- **Then** the game ends with a "GAME OVER" overlay displaying "DEFEAT"
- **And** all game logic updates halt

### AC-v0.1.0-001-tank-battle-047
- **Given** the player has 1 life remaining
- **When** the player tank is destroyed by an enemy bullet
- **Then** the life counter reaches 0
- **And** the game ends with a "GAME OVER" overlay displaying "DEFEAT"
- **And** all game logic updates halt

### AC-v0.1.0-001-tank-battle-048
- **Given** the game has ended (victory or defeat) and the game over overlay is displayed
- **When** the player presses the Enter key
- **Then** the game restarts with a fresh level, score reset to 0, and lives reset to 3
- **And** all game objects are reinitialized

### AC-v0.1.0-001-tank-battle-064
- **Given** the game has ended and the GAME OVER overlay is displayed
- **When** the player presses Space
- **Then** no bullet is created
- **And** no game state updates occur (all input is ignored during GAME OVER state)

## NFR-0010 Performance

### AC-v0.1.0-001-tank-battle-049
- **Given** the game is running on a modern desktop browser (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+)
- **When** 4 enemy tanks and the player tank are active with bullets on screen
- **Then** the frame rate remains at or above 50 fps consistently over a 5-second measurement window
- **And** no single frame exceeds 33ms duration
- **Testability Note**: Requires Playwright/Selenium integration test — cannot be fully automated in CI without browser automation

### AC-v0.1.0-001-tank-battle-050
- **Given** the game loop is running
- **When** measured using the browser's performance API
- **Then** the average frame time over 300 frames (5 seconds at 60fps) is ≤ 20ms
- **Testability Note**: Requires Playwright/Selenium integration test

## NFR-0020 Browser Compatibility

### AC-v0.1.0-001-tank-battle-051
- **Given** the game HTML file is opened in the latest Chrome browser
- **When** the game initializes
- **Then** the canvas renders correctly and keyboard input is responsive
- **And** no JavaScript errors appear in the console
- **Testability Note**: Requires Playwright/Selenium integration test

### AC-v0.1.0-001-tank-battle-052
- **Given** the game HTML file is opened in the latest Firefox browser
- **When** the game initializes
- **Then** the canvas renders correctly and keyboard input is responsive
- **And** no JavaScript errors appear in the console
- **Testability Note**: Requires Playwright/Selenium integration test

### AC-v0.1.0-001-tank-battle-053
- **Given** the game HTML file is opened in the latest Safari browser
- **When** the game initializes
- **Then** the canvas renders correctly and keyboard input is responsive
- **And** no JavaScript errors appear in the console
- **Testability Note**: Requires Playwright/Selenium integration test

### AC-v0.1.0-001-tank-battle-058
- **Given** the game HTML file is opened in the latest Edge browser
- **When** the game initializes
- **Then** the canvas renders correctly and keyboard input is responsive
- **And** no JavaScript errors appear in the console
- **Testability Note**: Requires Playwright/Selenium integration test

## NFR-0030 Code Testability

### AC-v0.1.0-001-tank-battle-054
- **Given** the game's collision detection module
- **When** Jest tests are executed with `npx jest`
- **Then** all collision detection test cases pass (bullet-wall, bullet-tank, tank-wall, tank-tank, bullet-bullet)

### AC-v0.1.0-001-tank-battle-055
- **Given** the game's scoring and life management modules
- **When** Jest tests are executed
- **Then** all scoring and life management test cases pass (score increment, life decrement, game over on zero lives)

### AC-v0.1.0-001-tank-battle-056
- **Given** the game's AI module
- **When** Jest tests are executed with mocked random number generators
- **Then** enemy movement direction changes and shooting intervals are deterministic and testable

### AC-v0.1.0-001-tank-battle-057
- **Given** the game's map loading module
- **When** Jest tests are executed with a predefined 13x13 level data array
- **Then** the map correctly identifies tile types at each coordinate (brick, steel, water, forest, empty, base)

### AC-v0.1.0-001-tank-battle-062
- **Given** the game's movement module
- **When** Jest tests are executed
- **Then** all movement test cases pass (position update, direction change, speed calculation, diagonal input rejection, boundary clamping)

### AC-v0.1.0-001-tank-battle-063
- **Given** the game loop module
- **When** the source code is inspected
- **Then** `requestAnimationFrame` is accessed through an injectable interface (not called directly)
- **And** a mock implementation of the interface can be injected to enable deterministic frame-by-frame testing
