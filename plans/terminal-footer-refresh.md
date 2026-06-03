# Terminal footer refresh plan

## Context
- Next UI pass moves footer-only controls/metadata to more appropriate places.
- `TerminalFooter` currently contains availability and an editor button.
- `TerminalPane` currently renders a `TIP` line directly above the input.
- `TerminalSessionHeader` already has a `STATUS: OK` field that can become the availability display.
- `AppHeader` left navigation already uses segmented links and route search state, so it can host the editor button.

## Approach
- Make `TerminalFooter` a simple fixed-height bar whose primary content is the terminal tip.
- Move availability into `TerminalSessionHeader` by changing `STATUS: OK` to `STATUS: AVAILABLE`.
- Implement the `AVAILABLE` visual directly in `TerminalSessionHeader`, not via `AvailabilityStatus`, so there is no popover.
- Add an infinite left-to-right shine/light sweep animation to the `AVAILABLE` word using `anime.js`, matching the project dependency and avoiding CSS-only keyframes for this effect.
- Move the editor-opening link from `TerminalFooter` to `AppHeader` left navigation as an additional segmented item, preserving the existing search params that open the editor panel.

## Files to modify
- `src/terminal/TerminalFooter.tsx` — remove availability/editor button/tooltip imports and render the tip.
- `src/terminal/TerminalPane.tsx` — remove the separate tip row above `TerminalPrompt`.
- `src/terminal/TerminalSessionHeader.tsx` — replace `STATUS: OK` with animated `STATUS: AVAILABLE`.
- `src/layout/AppHeader.tsx` — add editor button/link to left navigation segments.
- No CSS file changes expected for the shine animation because it should be driven by `anime.js`.

## Reuse
- `src/layout/AppHeader.tsx` — existing `Link` search-state pattern for route links and chevron status segments.
- `src/terminal/TerminalFooter.tsx` — existing editor link search params before moving them to `AppHeader`.
- `src/terminal/TerminalSessionHeader.tsx` — existing session header row layout and `data-anim-header` scramble selector.
- `src/design-system/useScrambleRef.ts` — keep existing header/footer scramble behavior where appropriate.
- `anime.js` — use the existing dependency to animate a light sweep across the `AVAILABLE` word, likely via a referenced overlay/span or CSS custom property updated by anime.
- Avoid `src/portfolio/AvailabilityStatus.tsx` for this header status because it includes the popover that should be removed.

## Steps
- [ ] Update `TerminalSessionHeader` status field to show `AVAILABLE` instead of `OK`.
- [ ] Add a non-interactive animated shine/light-sweep effect to the `AVAILABLE` word with `anime.js`.
- [ ] Remove `AvailabilityStatus`, `Separator`, tooltip, and editor link from `TerminalFooter`.
- [ ] Move the tip text into `TerminalFooter` with the same fixed `h-6` footer height.
- [ ] Remove the old tip row from `TerminalPane` so the tip appears only in the footer.
- [ ] Add an editor open control to the left side of `AppHeader`, using the same editor-opening search params from the old footer link.
- [ ] Ensure the new AppHeader editor item visually fits the alternating primary/muted segmented navigation.

## Verification
- [ ] Run `bun run typecheck`.
- [ ] Run `bun run lint` or `bun run check`.
- [ ] Manually verify `TerminalSessionHeader` shows `STATUS: AVAILABLE` and no availability popover appears.
- [ ] Manually verify the `AVAILABLE` shine animation loops left-to-right and remains readable.
- [ ] Manually verify the footer only shows the tip and remains the same fixed height.
- [ ] Manually verify the AppHeader editor button opens/focuses the editor panel with existing search state preserved.
