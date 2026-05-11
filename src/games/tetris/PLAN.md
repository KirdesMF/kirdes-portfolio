# PLAN.md — PixiJS Tetris

## Goal

Create a playable Tetris game using PixiJS, split into short reviewable steps.

Each step must produce something testable or observable.

---

## Working rules

- Move forward in small iterations.
- Do not mix multiple major features in the same step.
- Review each step before moving to the next one.
- Keep the game playable as early as possible.
- Keep gameplay logic separate from Pixi rendering.
- Use Pixi only for rendering, scene structure, input feedback, and presentation.
- Prioritize gameplay correctness before polish.

---

## Step 1 — Pixi project base

### Goal

Create a PixiJS application that starts correctly.

### Deliverable

- The project starts without errors.
- A Pixi canvas is visible.
- A basic game scene is displayed.
- The app has a clear place for game setup, rendering, and updates.

### Review

Check that the Pixi application starts cleanly and that the canvas renders reliably.

---

## Step 2 — Game scene layout

### Goal

Create the main visual layout for the game.

### Deliverable

- A game scene exists.
- The grid area is visible on screen.
- The layout is stable when the app starts.

### Review

Check that the scene layout is clear and ready for gameplay elements.

---

## Step 3 — Pixi grid display

### Goal

Display an empty Tetris grid in Pixi.

### Deliverable

- The main grid is visible.
- The grid dimensions match a classic Tetris layout.
- The grid is positioned cleanly in the game scene.
- Empty cells are visually readable.

### Review

Check that the grid is readable and that the play area is visually clear.

---

## Step 4 — Board state rendering

### Goal

Render a board state into the Pixi scene.

### Deliverable

- Empty cells and filled cells can be displayed.
- The rendered board matches the current board state.
- Updating the board state updates the visual grid.

### Review

Check that Pixi rendering accurately reflects the board state.

---

## Step 5 — Tetris pieces

### Goal

Add the 7 classic Tetris pieces.

### Deliverable

- The 7 pieces exist.
- A piece can appear at the top of the grid.
- The active piece is rendered in Pixi.
- The displayed piece matches its expected shape.

### Review

Check each piece shape visually in the Pixi scene.

---

## Step 6 — Game loop

### Goal

Connect the game update loop to Pixi.

### Deliverable

- The game updates over time.
- The active piece can fall automatically.
- Rendering stays in sync with the game state.
- The game loop is stable.

### Review

Check that the falling movement is regular and that the Pixi scene updates correctly.

---

## Step 7 — Player input

### Goal

Connect player controls to the game.

### Deliverable

- The player can move the active piece left.
- The player can move the active piece right.
- The player can speed up the fall.
- The Pixi scene updates after each input.
- Invalid movements are not visually applied.

### Review

Test movement near both walls and check that the visual state stays correct.

---

## Step 8 — Collisions

### Goal

Prevent pieces from passing through walls, the floor, and placed blocks.

### Deliverable

- A piece stops at the floor.
- A piece stops when touching another piece.
- Invalid movements are rejected.
- The Pixi scene reflects rejected movements correctly.
- The active piece becomes part of the board when it can no longer fall.

### Review

Test collisions with the floor, walls, and already placed blocks.

---

## Step 9 — Piece spawning

### Goal

Spawn a new active piece after placement.

### Deliverable

- A new piece appears automatically.
- Previous pieces remain rendered on the board.
- The game continues without interruption.
- Pixi rendering stays consistent across piece transitions.

### Review

Play several pieces in a row and check that placed blocks remain correct.

---

## Step 10 — Piece rotation

### Goal

Allow the active piece to rotate.

### Deliverable

- The player can rotate a piece.
- Rotation is rejected if it creates an invalid position.
- The rendered piece stays aligned to the grid after rotation.
- Invalid rotations do not create visual glitches.

### Review

Test rotations in the center, near walls, on the floor, and near placed blocks.

---

## Step 11 — Line clearing

### Goal

Clear complete lines and update the rendered board.

### Deliverable

- A complete line disappears.
- Lines above move down correctly.
- Multiple lines can disappear from a single placement.
- The Pixi board rendering updates correctly after clearing.

### Review

Test clearing one, two, three, and four lines.

---

## Step 12 — Score display

### Goal

Display and update the score in the Pixi scene.

### Deliverable

- The score is visible.
- The score increases when lines are cleared.
- Multiple-line clears are rewarded more heavily.
- The displayed score updates immediately.

### Review

Check that the score shown on screen matches gameplay events.

---

## Step 13 — Game over state

### Goal

Detect and display the end of the game.

### Deliverable

- The game detects when a new piece cannot spawn.
- A game over state is displayed in the Pixi scene.
- Gameplay input no longer affects the board after game over.
- The final board remains visible.

### Review

Fill the grid to the top and check that game over triggers at the right time.

---

## Step 14 — Restart flow

### Goal

Allow the player to restart after game over.

### Deliverable

- The player can start a new game.
- The board is reset.
- The score is reset.
- The Pixi scene returns to a clean gameplay state.

### Review

Play a game, trigger game over, then restart and verify the state is clean.

---

## Step 15 — Next piece display

### Goal

Display the next piece in the Pixi side area.

### Deliverable

- The next piece is visible.
- After placement, the next piece becomes active.
- A new next piece is generated.
- The side display updates correctly.

### Review

Check that the displayed next piece matches the piece that appears next.

---

## Step 16 — Ghost piece display

### Goal

Show the likely final landing position of the active piece.

### Deliverable

- A ghost piece is visible in the grid.
- The ghost piece updates after movement.
- The ghost piece updates after rotation.
- The ghost piece does not interfere with placed blocks visually.

### Review

Compare the ghost position with the real landing position after the piece falls.

---

## Step 17 — Hard drop

### Goal

Allow the player to place the active piece instantly.

### Deliverable

- The player can send the active piece directly to its landing position.
- The piece is placed immediately.
- A new piece appears after hard drop.
- The Pixi scene updates without intermediate visual errors.

### Review

Test hard drop in several situations, with and without obstacles.

---

## Step 18 — Pause state

### Goal

Add a pause state visible in the Pixi scene.

### Deliverable

- The player can pause the game.
- The game stops while paused.
- The player can resume the game.
- The pause state is clearly visible.
- Gameplay input is disabled while paused.

### Review

Check that falling, movement, and rotation are disabled while paused.

---

## Step 19 — Start screen

### Goal

Add an initial screen before gameplay starts.

### Deliverable

- The game shows a start screen.
- The player can start a game.
- The Pixi scene switches cleanly from start screen to gameplay.
- The game starts from a clean state.

### Review

Check that the game does not start before the start action.

---

## Step 20 — Level and speed display

### Goal

Add level progression and show it in the Pixi scene.

### Deliverable

- The current level is visible.
- The level increases based on progress.
- Falling speed increases progressively.
- The displayed level updates correctly.

### Review

Play long enough to verify that difficulty increases smoothly.

---

## Step 21 — Hold piece display

### Goal

Allow the player to hold a piece and show it in the Pixi side area.

### Deliverable

- The player can move the active piece into hold.
- The held piece is visible.
- The player can swap the active piece with the held piece.
- Only one hold is possible per active piece.
- The hold display updates correctly.

### Review

Test hold at the start, after several pieces, and after swapping.

---

## Step 22 — Pixi scene cleanup

### Goal

Ensure Pixi objects are managed cleanly during gameplay changes.

### Deliverable

- Restart does not duplicate visual objects.
- Game over does not leave stale interactive state.
- Board updates do not create visual artifacts.
- Repeated games remain stable.

### Review

Restart several times and verify that the scene remains clean.

---

## Step 23 — Gameplay polish

### Goal

Improve the overall game feel.

### Deliverable

- Controls feel comfortable.
- Piece transitions are clear.
- Line clearing is easy to understand.
- Game states are easy to read.
- Pixi rendering remains smooth during normal play.

### Review

Play a full session and list any friction points.

---

## Step 24 — Minimal visual polish

### Goal

Make the Pixi scene clean and pleasant without complicating gameplay.

### Deliverable

- Blocks are visually distinct.
- The grid remains readable.
- Score, level, next piece, and hold are placed clearly.
- The overall presentation is visually consistent.

### Review

Check readability during actual gameplay, not only while idle.

---

## Step 25 — Sound feedback

### Goal

Add minimal audio feedback.

### Deliverable

- Movement sound.
- Rotation sound.
- Placement sound.
- Line clear sound.
- Game over sound.
- Sounds do not distract from gameplay.

### Review

Check that audio supports the gameplay flow without becoming intrusive.

---

## Step 26 — Regression testing

### Goal

Stabilize the game before finalization.

### Deliverable

- Critical behaviors are tested.
- Visual state stays synchronized with game state.
- Edge cases are covered.
- Known bugs are listed or fixed.

### Things to check

- Pixi app startup.
- Scene layout.
- Board rendering.
- Active piece rendering.
- Collision with walls.
- Collision with the floor.
- Collision with placed blocks.
- Invalid rotation.
- Line clearing.
- Multiple-line clearing.
- Score display.
- Game over display.
- Restart.
- Next piece display.
- Ghost piece display.
- Hard drop.
- Pause.
- Hold.

### Review

Run a full pass on critical gameplay and rendering cases.

---

## Step 27 — Final build

### Goal

Prepare a clean and shareable version.

### Deliverable

- The game builds without errors.
- The Pixi canvas works in the built version.
- The game is playable after build.
- Main screens work correctly.
- No known blocking bugs remain.

### Review

Test the built version like an end user.

---

## Recommended review order

1. Pixi project base
2. Scene layout
3. Grid display
4. Board state rendering
5. Active piece rendering
6. Game loop
7. Player input
8. Collisions
9. Placement + new piece
10. Rotation
11. Line clearing
12. Score display
13. Game over + restart
14. Next piece display
15. Ghost piece display
16. Hard drop
17. Pause + start screen
18. Level + speed
19. Hold
20. Pixi scene cleanup
21. Gameplay polish
22. Visual polish
23. Sound feedback
24. Regression testing
25. Final build

---

## Definition of done

The game is considered done when:

- The Pixi application starts reliably.
- A full game can be played from start to game over.
- Pieces move, rotate, fall, and place correctly.
- The Pixi scene always reflects the current game state.
- Complete lines clear correctly.
- Score, level, next piece, ghost piece, and hold work.
- The player can pause, resume, and restart.
- Repeated restarts do not break the Pixi scene.
- The final build is stable and playable.
