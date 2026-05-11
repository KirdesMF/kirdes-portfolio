# PLAN.md — Tetris

## Goal

Create a playable Tetris game, split into short steps that can be reviewed after each iteration.

Each step must produce something testable or observable.

---

## Working rules

- Move forward in small iterations.
- Do not mix multiple major features in the same step.
- Review each step before moving to the next one.
- Make the game playable as early as possible.
- Prioritize gameplay logic before visual polish.
- Add visual details only after the core gameplay is validated.

---

## Step 1 — Project base

### Goal

Have an application that starts correctly with an empty game screen.

### Deliverable

- The project starts without errors.
- A game area is visible.
- The basic game structure is ready for the next steps.

### Review

Check that the project starts cleanly and that the visual base is stable.

---

## Step 2 — Game grid

### Goal

Display an empty Tetris grid.

### Deliverable

- The main grid is visible.
- The grid dimensions match a classic Tetris layout.
- The grid is centered or positioned cleanly on the screen.

### Review

Check that the grid is readable and that the play area is clear.

---

## Step 3 — Basic pieces

### Goal

Add the classic Tetris pieces.

### Deliverable

- The 7 pieces exist.
- A piece can appear at the top of the grid.
- The displayed piece matches its expected shape.

### Review

Check each piece shape individually.

---

## Step 4 — Automatic falling

### Goal

Make the active piece fall automatically.

### Deliverable

- The piece falls at a regular interval.
- The piece stays aligned to the grid.
- The falling movement is readable and stable.

### Review

Check that the movement is regular and that the piece does not leave the grid.

---

## Step 5 — Player movement

### Goal

Allow the player to move the active piece.

### Deliverable

- The player can move the piece left.
- The player can move the piece right.
- The player can speed up the fall.
- Movements respect the grid boundaries.

### Review

Test movements near the walls and verify that invalid moves are not possible.

---

## Step 6 — Collisions

### Goal

Prevent pieces from passing through walls, the floor, and other blocks.

### Deliverable

- A piece stops at the floor.
- A piece stops when touching another piece.
- Invalid movements are rejected.
- The active piece becomes a placed piece when it can no longer fall.

### Review

Test collisions with the floor, walls, and already placed blocks.

---

## Step 7 — New piece after placement

### Goal

Spawn a new piece after the active piece is placed.

### Deliverable

- A new piece appears automatically.
- Previous pieces remain on the grid.
- The game continues without interruption.

### Review

Play several pieces in a row and check that the grid keeps placed blocks correctly.

---

## Step 8 — Piece rotation

### Goal

Allow the active piece to rotate.

### Deliverable

- The player can rotate a piece.
- Rotation is rejected if it creates an invalid position.
- Pieces stay aligned to the grid after rotation.

### Review

Test rotations in the center, near walls, on the floor, and near placed blocks.

---

## Step 9 — Line clearing

### Goal

Clear complete lines.

### Deliverable

- A complete line disappears.
- Lines above move down correctly.
- Multiple lines can disappear from a single placement.

### Review

Test clearing one, two, three, and four lines.

---

## Step 10 — Score

### Goal

Add a simple score.

### Deliverable

- The score is visible.
- The score increases when lines are cleared.
- The score rewards multiple-line clears more heavily.

### Review

Check that the score increases correctly based on the number of cleared lines.

---

## Step 11 — Game over condition

### Goal

Detect the end of the game.

### Deliverable

- The game detects when a new piece cannot spawn.
- A game over state is displayed.
- The player can no longer continue playing after game over.

### Review

Fill the grid to the top and check that game over triggers at the right time.

---

## Step 12 — Restart game

### Goal

Allow the player to restart after game over.

### Deliverable

- The player can start a new game.
- The grid is reset.
- The score is reset.
- The game resumes normally.

### Review

Play a game, trigger game over, then restart.

---

## Step 13 — Next piece

### Goal

Display the next piece.

### Deliverable

- The next piece is visible.
- After the active piece is placed, the next piece becomes active.
- A new next piece is generated.

### Review

Check that the displayed next piece matches the piece that appears next.

---

## Step 14 — Ghost piece

### Goal

Show the likely final landing position of the active piece.

### Deliverable

- A preview of the landing position is visible.
- The preview updates when the piece moves.
- The preview updates when the piece rotates.

### Review

Compare the ghost position with the real position after the piece falls.

---

## Step 15 — Hard drop

### Goal

Allow the player to place the active piece instantly.

### Deliverable

- The player can send the piece directly to its final position.
- The piece is placed immediately.
- A new piece appears after the hard drop.

### Review

Test hard drop in several situations, with and without obstacles.

---

## Step 16 — Pause

### Goal

Add a pause state.

### Deliverable

- The player can pause the game.
- The game stops while paused.
- The player can resume the game.
- The pause state is visible.

### Review

Check that falling, movement, and rotation are disabled while paused.

---

## Step 17 — Start screen

### Goal

Add an initial state before the game starts.

### Deliverable

- The game shows a start screen.
- The player can start a game.
- The game starts from a clean state.

### Review

Check that the game does not start before the start action.

---

## Step 18 — Level and speed

### Goal

Make the difficulty progress during the game.

### Deliverable

- A level is visible.
- The level increases based on progress.
- Falling speed increases progressively.
- The progression remains playable.

### Review

Play long enough to verify that the difficulty increases without becoming too harsh too early.

---

## Step 19 — Hold

### Goal

Allow the player to temporarily store a piece.

### Deliverable

- The player can move the active piece into hold.
- The held piece is visible.
- The player can swap the active piece with the held piece.
- Only one hold is possible per active piece.

### Review

Test hold at the start, after several pieces, and after swapping with an already held piece.

---

## Step 20 — Gameplay polish

### Goal

Improve the overall game feel.

### Deliverable

- Controls feel comfortable.
- Transitions between pieces feel smooth.
- Line clearing is clear.
- Game states are easy to understand.

### Review

Play a full session and note friction points before moving to visual polish.

---

## Step 21 — Minimal visual polish

### Goal

Make the game clean and pleasant without complicating gameplay.

### Deliverable

- Blocks are visually distinct.
- The grid remains readable.
- Game information is placed clearly.
- The overall presentation is visually consistent.

### Review

Check readability during an actual game, not only while the game is idle.

---

## Step 22 — Simple sounds

### Goal

Add minimal audio feedback.

### Deliverable

- Movement sound.
- Rotation sound.
- Placement sound.
- Line clear sound.
- Game over sound.

### Review

Check that sounds support gameplay without becoming distracting.

---

## Step 23 — Regression testing

### Goal

Stabilize the game before finalization.

### Deliverable

- Critical behaviors are tested.
- Edge cases are covered.
- Known bugs are listed or fixed.

### Things to check

- Collision with walls.
- Collision with the floor.
- Collision with placed blocks.
- Impossible rotation.
- Multiple-line clearing.
- Game over.
- Restart.
- Hold.
- Next piece.
- Ghost piece.

### Review

Run a full pass on critical cases before adding new features.

---

## Step 24 — Final build

### Goal

Prepare a clean and shareable version.

### Deliverable

- The game builds without errors.
- The game is playable after build.
- Main screens work correctly.
- No known blocking bugs remain open.

### Review

Test the built version like an end user.

---

## Recommended review order

1. Project base
2. Visible grid
3. Displayed piece
4. Automatic falling
5. Movement
6. Collisions
7. Placement + new piece
8. Rotation
9. Line clearing
10. Score
11. Game over + restart
12. Next piece
13. Ghost piece
14. Hard drop
15. Pause + start screen
16. Level + speed
17. Hold
18. Gameplay polish
19. Visual polish
20. Sounds
21. Regression testing
22. Final build

---

## Definition of done

The game is considered done when:

- A full game can be played from start to game over.
- Pieces move, rotate, fall, and place correctly.
- Complete lines clear correctly.
- Score, level, next piece, and hold work.
- The player can pause, resume, and restart.
- The game is stable after build.
