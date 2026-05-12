# TODO.md — PixiJS Tetris

## Pixi project base

- [x] Create the PixiJS project base.
- [x] Add the main game entry point.
- [x] Display a Pixi canvas.
- [x] Display a basic game scene.
- [x] Verify that the project starts without errors.
- [ ] ~~Review Pixi app startup.~~

---

## Game scene layout

- [x] Create the game scene.
- [x] Display the grid area.
- [x] Verify that the layout is stable at startup.
- [ ] ~~Review the initial scene layout.~~

---

## Pixi grid display

- [x] Display the empty Tetris grid.
- [x] Use classic Tetris grid dimensions.
- [x] Position the grid cleanly in the scene.
- [x] Make empty cells visually readable.
- [ ] ~~Review grid readability.~~

---

## Board state rendering

- [x] Render empty cells from the board state.
- [x] Render filled cells from the board state.
- [x] Update the visual board when the board state changes.
- [x] Verify that rendering matches the current board state.
- [ ] ~~Review board state rendering.~~

---

## Tetris pieces

- [x] Add the 7 classic Tetris pieces.
- [x] Spawn one active piece at the top of the grid.
- [x] Render the active piece in the Pixi scene.
- [x] Verify that each piece shape is correct.
- [ ] ~~Review all piece shapes visually.~~

---

## Game loop

- [x] Connect the game update loop.
- [x] Make the active piece fall automatically.
- [x] Keep rendering synchronized with game state.
- [x] Verify that the game loop is stable.
- [ ] ~~Review automatic falling behavior.~~

---

## Player input

- [x] Add left movement.
- [x] Add right movement.
- [x] Add soft drop.
- [x] Update the Pixi scene after input.
- [x] Prevent invalid movement from being displayed.
- [ ] ~~Review movement near both walls.~~

---

## Collisions

- [x] Add collision with the floor.
- [x] Add collision with the left wall.
- [x] Add collision with the right wall.
- [x] Add collision with placed blocks.
- [x] Reject invalid movement.
- [x] Place the active piece when it can no longer fall.
- [x] Verify that rejected moves do not affect rendering.
- [ ] ~~Review all collision cases.~~

---

## Piece spawning

- [x] Spawn a new piece after placement.
- [x] Keep placed blocks rendered on the board.
- [x] Ensure the game continues after each placement.
- [x] Verify that rendering stays consistent between pieces.
- [ ] ~~Review several consecutive placements.~~

---

## Piece rotation

- [x] Add piece rotation.
- [x] Reject invalid rotations.
- [x] Keep the rendered piece aligned to the grid after rotation.
- [x] Prevent visual glitches after invalid rotations.
- [x] Test rotation in open space.
- [x] Test rotation near walls.
- [x] Test rotation near the floor.
- [x] Test rotation near placed blocks.
- [ ] ~~Review rotation behavior.~~

---

## Line clearing

- [x] Detect complete lines.
- [x] Clear one complete line.
- [x] Move upper lines down after clearing.
- [x] Support multiple-line clears.
- [x] Update the Pixi board after clearing.
- [x] Test single line clear.
- [x] Test double line clear.
- [x] Test triple line clear.
- [x] Test four-line clear.
- [ ] ~~Review line clearing behavior.~~

---

## Score display

- [x] Display the score in the Pixi scene.
- [x] Increase the score after clearing lines.
- [x] Reward multiple-line clears more than single-line clears.
- [x] Update the displayed score immediately.
- [x] Verify that displayed score matches gameplay events.
- [ ] ~~Review score behavior.~~

---

## Game over state

- [x] Detect when a new piece cannot spawn.
- [x] Display the game over state in the Pixi scene.
- [x] Stop gameplay input after game over.
- [x] Keep the final board visible.
- [ ] ~~Review the game over condition.~~

---

## Restart flow

- [x] Add restart action.
- [x] Reset the board on restart.
- [x] Reset the score on restart.
- [x] Reset the active piece on restart.
- [x] Return the Pixi scene to a clean gameplay state.
- [x] Verify that a new game starts cleanly.
- [ ] ~~Review restart behavior.~~

---

## Next piece display

- [x] Display the next piece in the side area.
- [x] Use the next piece as the following active piece.
- [x] Generate a new next piece after each spawn.
- [x] Update the side display correctly.
- [x] Verify that displayed next piece matches the next active piece.
- [ ] ~~Review next piece behavior.~~

---

## Ghost piece display

- [x] Display the ghost piece in the grid.
- [x] Update the ghost piece after horizontal movement.
- [x] Update the ghost piece after rotation.
- [x] Update the ghost piece after soft drop.
- [x] Keep the ghost piece visually separate from placed blocks.
- [x] Verify that the ghost position matches the landing position.
- [ ] ~~Review ghost piece behavior.~~

---

## Hard drop

- [x] Add hard drop action.
- [x] Move the active piece directly to its landing position.
- [x] Place the piece immediately after hard drop.
- [x] Spawn a new piece after hard drop.
- [x] Update the Pixi scene without intermediate visual errors.
- [ ] ~~Review hard drop behavior.~~

---

## Pause state

- [x] Add pause action.
- [x] Stop falling while paused.
- [x] Disable movement while paused.
- [x] Disable rotation while paused.
- [x] Display the pause state in the Pixi scene.
- [x] Add resume action.
- [ ] ~~Review pause and resume behavior.~~

---

## Start screen

- [ ] Add start screen.
- [ ] Add start action.
- [ ] Prevent gameplay before start.
- [ ] Switch cleanly from start screen to gameplay.
- [ ] Start from a clean game state.
- [ ] Review start screen behavior.

---

## Level and speed display

- [ ] Display the current level.
- [ ] Increase level based on progress.
- [ ] Increase falling speed progressively.
- [ ] Update the displayed level correctly.
- [ ] Verify that speed progression remains playable.
- [ ] Review level and speed behavior.

---

## Hold piece display

- [ ] Add hold action.
- [ ] Display the held piece in the side area.
- [ ] Allow swapping with the held piece.
- [ ] Prevent multiple holds for the same active piece.
- [ ] Reset hold availability after piece placement.
- [ ] Update the hold display correctly.
- [ ] Review hold behavior.

---

## Pixi scene cleanup

- [ ] Verify that restart does not duplicate visual objects.
- [ ] Verify that game over does not leave stale interactive state.
- [ ] Verify that board updates do not create visual artifacts.
- [ ] Restart several games in a row.
- [ ] Confirm that the scene remains clean after repeated restarts.
- [ ] Review Pixi scene cleanup.

---

## Gameplay polish

- [ ] Review control feel.
- [ ] Tune movement responsiveness.
- [ ] Tune soft drop feel.
- [ ] Tune hard drop feel.
- [ ] Improve piece transition clarity.
- [ ] Improve line clear readability.
- [ ] Verify that Pixi rendering remains smooth during normal play.
- [ ] Review full gameplay flow.

---

## Minimal visual polish

- [ ] Make blocks visually distinct.
- [ ] Improve grid readability.
- [ ] Place score clearly.
- [ ] Place level clearly.
- [ ] Place next piece clearly.
- [ ] Place hold piece clearly.
- [ ] Keep the overall presentation visually consistent.
- [ ] Check readability during actual gameplay.
- [ ] Review visual polish.

---

## Sound feedback

- [ ] Add movement sound.
- [ ] Add rotation sound.
- [ ] Add placement sound.
- [ ] Add line clear sound.
- [ ] Add game over sound.
- [ ] Check that sounds support gameplay.
- [ ] Check that sounds are not distracting.
- [ ] Review audio feedback.

---

## Regression testing

- [ ] Test Pixi app startup.
- [ ] Test scene layout.
- [ ] Test board rendering.
- [ ] Test active piece rendering.
- [ ] Test wall collisions.
- [ ] Test floor collisions.
- [ ] Test collisions with placed blocks.
- [ ] Test invalid rotations.
- [ ] Test line clearing.
- [ ] Test multiple-line clearing.
- [ ] Test score display.
- [ ] Test game over display.
- [ ] Test restart.
- [ ] Test next piece display.
- [ ] Test ghost piece display.
- [ ] Test hard drop.
- [ ] Test pause and resume.
- [ ] Test hold.
- [ ] Confirm that visual state stays synchronized with game state.
- [ ] List remaining known bugs.
- [ ] Fix blocking bugs.
- [ ] Review regression testing results.

---

## Final build

- [ ] Run the final build.
- [ ] Verify that the build completes without errors.
- [ ] Verify that the Pixi canvas works in the built version.
- [ ] Test the built version.
- [ ] Confirm that the main game flow works.
- [ ] Confirm that no blocking bugs remain.
- [ ] Mark the project as ready.

---

## Done checklist

- [ ] The Pixi application starts reliably.
- [ ] A full game can be played from start to game over.
- [ ] Pieces move correctly.
- [ ] Pieces rotate correctly.
- [ ] Pieces fall correctly.
- [ ] Pieces place correctly.
- [ ] The Pixi scene always reflects the current game state.
- [ ] Lines clear correctly.
- [ ] Score works.
- [ ] Level works.
- [ ] Next piece works.
- [ ] Ghost piece works.
- [ ] Hold works.
- [ ] Pause works.
- [ ] Restart works.
- [ ] Repeated restarts do not break the Pixi scene.
- [ ] The final build is stable and playable.
