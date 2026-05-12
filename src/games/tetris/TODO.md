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

- [ ] Display the empty Tetris grid.
- [ ] Use classic Tetris grid dimensions.
- [ ] Position the grid cleanly in the scene.
- [ ] Make empty cells visually readable.
- [ ] Review grid readability.

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

- [ ] Connect the game update loop.
- [ ] Make the active piece fall automatically.
- [ ] Keep rendering synchronized with game state.
- [ ] Verify that the game loop is stable.
- [ ] Review automatic falling behavior.

---

## Player input

- [ ] Add left movement.
- [ ] Add right movement.
- [ ] Add soft drop.
- [ ] Update the Pixi scene after input.
- [ ] Prevent invalid movement from being displayed.
- [ ] Review movement near both walls.

---

## Collisions

- [ ] Add collision with the floor.
- [ ] Add collision with the left wall.
- [ ] Add collision with the right wall.
- [ ] Add collision with placed blocks.
- [ ] Reject invalid movement.
- [ ] Place the active piece when it can no longer fall.
- [ ] Verify that rejected moves do not affect rendering.
- [ ] Review all collision cases.

---

## Piece spawning

- [ ] Spawn a new piece after placement.
- [ ] Keep placed blocks rendered on the board.
- [ ] Ensure the game continues after each placement.
- [ ] Verify that rendering stays consistent between pieces.
- [ ] Review several consecutive placements.

---

## Piece rotation

- [ ] Add piece rotation.
- [ ] Reject invalid rotations.
- [ ] Keep the rendered piece aligned to the grid after rotation.
- [ ] Prevent visual glitches after invalid rotations.
- [ ] Test rotation in open space.
- [ ] Test rotation near walls.
- [ ] Test rotation near the floor.
- [ ] Test rotation near placed blocks.
- [ ] Review rotation behavior.

---

## Line clearing

- [ ] Detect complete lines.
- [ ] Clear one complete line.
- [ ] Move upper lines down after clearing.
- [ ] Support multiple-line clears.
- [ ] Update the Pixi board after clearing.
- [ ] Test single line clear.
- [ ] Test double line clear.
- [ ] Test triple line clear.
- [ ] Test four-line clear.
- [ ] Review line clearing behavior.

---

## Score display

- [ ] Display the score in the Pixi scene.
- [ ] Increase the score after clearing lines.
- [ ] Reward multiple-line clears more than single-line clears.
- [ ] Update the displayed score immediately.
- [ ] Verify that displayed score matches gameplay events.
- [ ] Review score behavior.

---

## Game over state

- [ ] Detect when a new piece cannot spawn.
- [ ] Display the game over state in the Pixi scene.
- [ ] Stop gameplay input after game over.
- [ ] Keep the final board visible.
- [ ] Review the game over condition.

---

## Restart flow

- [ ] Add restart action.
- [ ] Reset the board on restart.
- [ ] Reset the score on restart.
- [ ] Reset the active piece on restart.
- [ ] Return the Pixi scene to a clean gameplay state.
- [ ] Verify that a new game starts cleanly.
- [ ] Review restart behavior.

---

## Next piece display

- [ ] Display the next piece in the side area.
- [ ] Use the next piece as the following active piece.
- [ ] Generate a new next piece after each spawn.
- [ ] Update the side display correctly.
- [ ] Verify that displayed next piece matches the next active piece.
- [ ] Review next piece behavior.

---

## Ghost piece display

- [ ] Display the ghost piece in the grid.
- [ ] Update the ghost piece after horizontal movement.
- [ ] Update the ghost piece after rotation.
- [ ] Update the ghost piece after soft drop.
- [ ] Keep the ghost piece visually separate from placed blocks.
- [ ] Verify that the ghost position matches the landing position.
- [ ] Review ghost piece behavior.

---

## Hard drop

- [ ] Add hard drop action.
- [ ] Move the active piece directly to its landing position.
- [ ] Place the piece immediately after hard drop.
- [ ] Spawn a new piece after hard drop.
- [ ] Update the Pixi scene without intermediate visual errors.
- [ ] Review hard drop behavior.

---

## Pause state

- [ ] Add pause action.
- [ ] Stop falling while paused.
- [ ] Disable movement while paused.
- [ ] Disable rotation while paused.
- [ ] Display the pause state in the Pixi scene.
- [ ] Add resume action.
- [ ] Review pause and resume behavior.

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
