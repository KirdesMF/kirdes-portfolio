# Mobile Neo-Tree Plan

## Context

The IDE shell (`src/routes/_ide.tsx`) renders `NeoTree` as a fixed-width (`w-56`) sidebar that pushes the editor/main content to the right. On viewports below 768 px the current layout still allocates space to the sidebar, leaving a very small content area.

Goal: adapt the explorer so it works well on mobile without breaking the desktop sidebar experience.

## Options Considered

| Option | UX | Pros | Cons |
|--------|----|------|------|
| **A. Overlay sidebar** (slide-in from left, covers content) | Keeps sidebar paradigm, leaves editor visible behind | Low disruption, easy to toggle, natural for a tree | Smaller hit area than full-screen |
| **B. Full-screen explorer** | Tree takes whole screen | Maximum readability, simplest to implement | Hides editor context, feels like a page switch |
| **C. Bottom drawer** | Reuses existing `Drawer` component | Consistent with command-menu/settings mobile UX | Less natural for a vertical tree, limited height |

## Current Reuse Points

- `useIsMobile()` — `src/design-system/use-media-query.ts` (matches `max-width: 767px`, same boundary as Tailwind `md:`).
- `Drawer` primitives — `src/design-system/drawer.tsx` (used for command-menu/settings on mobile). Anchored bottom; swipe-down to close.
- `Dialog` primitives — `src/design-system/dialog.tsx`.
- `NeoTree` is URL-controlled via `neotree=open|closed` in `src/ide/search.ts`.
- `AppHeader` already toggles the explorer via `neotree` search param.

## Decision

**Overlay sidebar on mobile** (Option A). The explorer will slide in from the left and overlay the editor content. When a file is tapped on mobile, the explorer closes automatically.

## Recommended Approach

Keep the desktop sidebar (`w-56 shrink-0 border-r`) unchanged. On mobile (`useIsMobile()` / Tailwind `md:` variants), render the same tree as a fixed/absolute panel that overlays the main content instead of pushing it:

- Slide in from the left (`-translate-x-full` → `translate-x-0`).
- Semi-opaque backdrop overlay that closes the explorer when tapped.
- Auto-close the explorer when a file is selected by navigating with `neotree: "closed"`.
- Close button in the header remains functional.

## Files to Modify

- `src/ide/neo-tree.tsx` — add mobile overlay layout, backdrop, and close-on-file-select behavior.
- `src/routes/_ide.tsx` — make the flex row parent `relative` so the mobile panel can be absolutely positioned; render `<NeoTree />` unconditionally or conditionally unchanged (`neotree` param still controls open/closed).
- `src/ide/app-header.tsx` — no required changes, but verify the `[explorer]` toggle is reachable on mobile.
- `src/ide/search.ts` — no changes.

## Reuse

- `useIsMobile()` from `src/design-system/use-media-query.ts`.
- Existing `closeNeoTree()` navigation logic inside `NeoTree`.
- Existing tree rendering and keyboard handling from `@headless-tree/react`.

## Steps

- [x] Introduce `useIsMobile()` in `NeoTree`.
- [x] Extract the shared tree JSX into a reusable inner component so the mobile wrapper and desktop `<aside>` share the same markup.
- [x] On mobile, render a `<div>`/`Fragment` containing:
  - A fixed/absolute positioned panel (`left-0`, `top-status-bar`, `bottom-status-bar`, `w-56`, `z-raised` or higher).
  - A backdrop that calls `closeNeoTree()` on click.
- [x] Update the file `onPrimaryAction` to close the explorer when `isMobile` is true.
- [x] Add `relative` to the layout row in `src/routes/_ide.tsx` so absolute positioning is scoped correctly.
- [x] Verify desktop styles are unchanged (`w-56 shrink-0 border-r bg-background`).
- [x] Add subtle enter/exit transition (translate + opacity) for the mobile panel.

## Verification

- [x] Resize browser to < 768 px and open `/editor?neotree=open`.
- [x] Confirm the explorer overlays the editor and does not shrink it.
- [x] Tap a file → the file opens and the explorer closes.
- [x] Tap the backdrop → the explorer closes.
- [x] Resize browser to ≥ 768 px and confirm the sidebar pushes content as before.
- [x] Run the existing test suite to ensure no regressions.