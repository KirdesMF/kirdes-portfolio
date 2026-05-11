# TODO.md — Tetris

## Project setup

- [x] Create the project base.
- [x] Add the main game entry point.
- [x] Add a visible game area.
- [x] Verify that the project starts without errors.
- [ ] ~~Review the initial project structure.~~

---

## Game grid

- [x] Add the main Tetris grid.
- [x] Use classic Tetris grid dimensions.
- [x] Position the grid cleanly on the screen.
- [x] Verify that the grid is readable.
- [ ] Review the empty grid state.

---

## Pieces

- [ ] Add the 7 classic Tetris pieces.
- [ ] Display one active piece at the top of the grid.
- [ ] Verify that each piece shape is correct.
- [ ] Review all piece shapes individually.

---

## Automatic falling

- [ ] Make the active piece fall automatically.
- [ ] Keep the piece aligned to the grid.
- [ ] Verify that the fall timing is stable.
- [ ] Review automatic falling behavior.

---

## Player controls

- [ ] Add left movement.
- [ ] Add right movement.
- [ ] Add soft drop.
- [ ] Prevent movement outside the grid.
- [ ] Review movement near both walls.

---

## Collisions

- [ ] Add collision with the floor.
- [ ] Add collision with the left wall.
- [ ] Add collision with the right wall.
- [ ] Add collision with placed blocks.
- [ ] Reject invalid movements.
- [ ] Place the active piece when it can no longer fall.
- [ ] Review all collision cases.

---

## Piece spawning

- [ ] Spawn a new piece after placement.
- [ ] Keep placed blocks on the grid.
- [ ] Ensure the game continues after each placement.
- [ ] Review several consecutive placements.

---

## Rotation

- [ ] Add piece rotation.
- [ ] Reject invalid rotations.
- [ ] Keep pieces aligned after rotation.
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
- [ ] Test single line clear.
- [ ] Test double line clear.
- [ ] Test triple line clear.
- [ ] Test four-line clear.
- [ ] Review line clearing behavior.

---

## Score

- [ ] Display the score.
- [ ] Increase the score after clearing lines.
- [ ] Reward multiple-line clears more than single-line clears.
- [ ] Verify score values.
- [ ] Review score behavior.

---

## Game over

- [ ] Detect when a new piece cannot spawn.
- [ ] Display the game over state.
- [ ] Stop gameplay after game over.
- [ ] Review the game over condition.

---

## Restart

- [ ] Add restart action.
- [ ] Reset the grid on restart.
- [ ] Reset the score on restart.
- [ ] Reset the active piece on restart.
- [ ] Verify that a new game starts cleanly.
- [ ] Review restart behavior.

---

## Next piece

- [ ] Display the next piece.
- [ ] Use the next piece as the following active piece.
- [ ] Generate a new next piece after each spawn.
- [ ] Review next piece behavior.

---

## Ghost piece

- [ ] Display the ghost piece.
- [ ] Update the ghost piece after horizontal movement.
- [ ] Update the ghost piece after rotation.
- [ ] Update the ghost piece after soft drop.
- [ ] Verify that the ghost position matches the landing position.
- [ ] Review ghost piece behavior.

---

## Hard drop

- [ ] Add hard drop action.
- [ ] Move the active piece directly to its landing position.
- [ ] Place the piece immediately after hard drop.
- [ ] Spawn a new piece after hard drop.
- [ ] Review hard drop behavior.

---

## Pause

- [ ] Add pause action.
- [ ] Stop falling while paused.
- [ ] Disable movement while paused.
- [ ] Disable rotation while paused.
- [ ] Display the pause state.
- [ ] Add resume action.
- [ ] Review pause and resume behavior.

---

## Start screen

- [ ] Add start screen.
- [ ] Add start action.
- [ ] Prevent gameplay before start.
- [ ] Start from a clean game state.
- [ ] Review start screen behavior.

---

## Level and speed

- [ ] Display the current level.
- [ ] Increase level based on progress.
- [ ] Increase falling speed progressively.
- [ ] Verify that speed progression remains playable.
- [ ] Review level and speed behavior.

---

## Hold

- [ ] Add hold action.
- [ ] Display held piece.
- [ ] Allow swapping with held piece.
- [ ] Prevent multiple holds for the same active piece.
- [ ] Reset hold availability after piece placement.
- [ ] Review hold behavior.

---

## Gameplay polish

- [ ] Review control feel.
- [ ] Tune movement responsiveness.
- [ ] Tune soft drop feel.
- [ ] Tune hard drop feel.
- [ ] Improve transition between placed piece and next piece.
- [ ] Improve line clear readability.
- [ ] Review full gameplay flow.

---

## Minimal visual polish

- [ ] Make blocks visually distinct.
- [ ] Improve grid readability.
- [ ] Place score clearly.
- [ ] Place level clearly.
- [ ] Place next piece clearly.
- [ ] Place hold piece clearly.
- [ ] Ensure the layout works during gameplay.
- [ ] Review visual readability.

---

## Sounds

- [ ] Add movement sound.
- [ ] Add rotation sound.
- [ ] Add placement sound.
- [ ] Add line clear sound.
- [ ] Add game over sound.
- [ ] Check that sounds are not distracting.
- [ ] Review audio feedback.

---

## Regression testing

- [ ] Test wall collisions.
- [ ] Test floor collisions.
- [ ] Test collisions with placed blocks.
- [ ] Test invalid rotations.
- [ ] Test line clearing.
- [ ] Test multiple-line clearing.
- [ ] Test scoring.
- [ ] Test game over.
- [ ] Test restart.
- [ ] Test next piece.
- [ ] Test ghost piece.
- [ ] Test hard drop.
- [ ] Test pause and resume.
- [ ] Test hold.
- [ ] List remaining known bugs.
- [ ] Fix blocking bugs.

---

## Final build

- [ ] Run the final build.
- [ ] Verify that the build completes without errors.
- [ ] Test the built version.
- [ ] Confirm that the main game flow works.
- [ ] Confirm that no blocking bugs remain.
- [ ] Mark the project as ready.

---

## Done checklist

- [ ] A full game can be played from start to game over.
- [ ] Pieces move correctly.
- [ ] Pieces rotate correctly.
- [ ] Pieces fall correctly.
- [ ] Pieces place correctly.
- [ ] Lines clear correctly.
- [ ] Score works.
- [ ] Level works.
- [ ] Next piece works.
- [ ] Ghost piece works.
- [ ] Hold works.
- [ ] Pause works.
- [ ] Restart works.
- [ ] The final build is stable.
