# Procedural ASCII Banner Plan

## Context

The generated `src/Ascii Motion Animation.tsx` output from ascii-motion is not usable as-is for the editor banner: it is large, non-responsive, hard to customize, and its generated WebGL shader pipeline has broken alpha/compositing behavior that causes black backgrounds and unreliable glow/blur.

For the first iteration, the goal is not to build a full ascii-motion-like app. The goal is to create a working banner for the editor empty state using the same current lettering/frame content from `src/Ascii Motion Animation.tsx`. Later, an alphabet/FIGlet-based text generator can be added so the text can be changed more freely.

Desired banner capabilities:

- Use the same visible letters/art as the current generated ASCII component for now.
- Be responsive inside the editor empty state.
- Allow configurable colors for text, lines, blocks, glow, and shimmer.
- Animate a shimmer effect across the ASCII art.
- Support glow and soft blur without relying on the broken generated shader export.
- Keep the component maintainable and small.

## Approach

Replace the generated component usage with a small procedural canvas banner runtime:

1. Extract/reuse the current ASCII cell data from `src/Ascii Motion Animation.tsx` as static banner art.
2. Render that data with a clean canvas 2D renderer.
3. Make the canvas responsive by sizing from its container and scaling cells proportionally.
4. Add configurable semantic coloring for different cell kinds, even if the first pass uses simple heuristics.
5. Add shimmer procedurally by varying cell color over time based on `x`, `y`, and `time`.
6. Add glow/blur through layered canvas 2D passes instead of WebGL shaders.
7. Use the new banner in `src/editor/ReadOnlyFileEditor.tsx` empty state.

No alphabet system will be implemented in this iteration. The current exported letters/art will be treated as the source artwork. Later, the data source can be swapped for a FIGlet/alphabet renderer.

## Files to modify

- `src/editor/ReadOnlyFileEditor.tsx`
  - Replace test usage of the generated component with the new banner component.
- `src/ascii-banner/AsciiBanner.tsx`
  - New React wrapper component for canvas rendering and animation lifecycle.
- `src/ascii-banner/bannerArt.ts`
  - Static cell data extracted from `src/Ascii Motion Animation.tsx`.
- `src/ascii-banner/drawAsciiBanner.ts`
  - Canvas 2D drawing utilities.
- `src/ascii-banner/colors.ts`
  - Color helpers for interpolation/shimmer.
- Optional later cleanup: `src/Ascii Motion Animation.tsx`
  - Keep temporarily for reference, then remove once the new banner fully replaces it.

## Reuse

Existing code/data to reuse:

- `src/Ascii Motion Animation.tsx`
  - Reuse the existing `FRAMES` cell data and canvas constants as the initial banner artwork.
  - Do not reuse the generated `window._applyShaders` runtime.
- `src/editor/ReadOnlyFileEditor.tsx`
  - Reuse the existing empty state placement and editor styling.
- `src/design-system/cn.ts`
  - Reuse existing class name utility if needed.

Existing patterns to preserve:

- Canvas-based rendering is appropriate for this banner.
- The banner should remain isolated from React renders as much as possible by using `requestAnimationFrame` inside the component effect.
- The editor empty state should still show command shortcuts below or around the banner.

## Steps

- [ ] Create `src/ascii-banner/bannerArt.ts` with the current cell data from `src/Ascii Motion Animation.tsx`.
- [ ] Define banner art types: cell coordinates, character, color/kind metadata, and source grid dimensions.
- [ ] Create a canvas renderer that draws cells from static art data.
- [ ] Add responsive sizing using a wrapper/container measurement strategy.
- [ ] Support configurable color props for text, lines, blocks, glow, background, and shimmer.
- [ ] Add layered draw passes:
  - [ ] blurred glow pass
  - [ ] soft glow pass
  - [ ] sharp text pass
  - [ ] shimmer highlight pass
- [ ] Add a `requestAnimationFrame` loop for shimmer animation.
- [ ] Add reduced-motion handling so shimmer can be disabled for users who prefer reduced motion.
- [ ] Replace the current generated component usage in `ReadOnlyFileEditor.tsx` with the new `AsciiBanner`.
- [ ] Keep controls/debug props optional, e.g. fixed frame preview or shimmer on/off, if useful during development.
- [ ] Once verified, remove or stop importing the generated `src/Ascii Motion Animation.tsx` component.

## Verification

- Run `bun run typecheck`.
- Run `bun run lint` or `bun run check` if available/appropriate.
- Start the app with `bun run dev` and manually verify:
  - Empty editor state shows the banner.
  - Banner scales correctly at different editor sizes.
  - No black background appears.
  - Text remains sharp while glow/blur remain soft.
  - Shimmer animates smoothly.
  - Colors can be changed through component props/config.
  - Empty state command list remains usable and visually balanced.
- Test with reduced motion enabled and verify shimmer is disabled or simplified.

## Future work

- Add an alphabet/FIGlet-based text generator so banner text can be changed without hand-authored cell data.
- Add richer semantic classification for text/line/block cells.
- Add optional real WebGL post-processing later, but only with a proper alpha-aware pipeline and separate source/output canvases.
- Add Rive-like state-machine interactivity later if the banner needs hover/click states.
