# Resizable Terminal Panels Plan

## Context

The terminal layout currently uses fixed desktop splits:

- Terminal pane vs right pane is effectively `50% / 50%` via `md:w-1/2`.
- Route/browser pane vs editor pane uses equal grid rows via `md:grid-rows-2`.

The goal is to let users resize these panels with good drag performance, without using `localStorage` to avoid SSR/client layout flash. Resizing should be desktop-only and session-only for now.

## Approach

- Create a new git branch before implementation, e.g. `feat/resizable-terminal-panels`.
- Implement session-only resizable panel sizes:
  - Use deterministic SSR-safe default sizes: `50%` horizontal split and `50%` vertical split.
  - Store committed sizes in React state only after hydration/user interaction.
  - Do not persist to `localStorage`.
  - Do not write sizes to URL search params for this first pass.
- Use CSS variables for panel sizing:
  - `--terminal-pane-size` for terminal vs right pane.
  - `--route-pane-size` for route/browser vs editor pane.
- During drag, update CSS variables imperatively on the layout element instead of calling React state on every pointer move.
- Use `requestAnimationFrame` to coalesce rapid pointer events into one DOM style update per frame.
- Commit final clamped size to React state on `pointerup` only.
- Add desktop-only resize handles:
  - Vertical handle between terminal pane and right pane.
  - Horizontal handle between route/browser pane and editor pane when both are visible.
- Keep mobile layout unchanged.
- Treat maximized panels as an explicit override, not as part of the resize state:
  - When `maximized === "route"`, hide terminal and editor as existing logic does, do not render any resize handles, and do not mutate saved split sizes.
  - When `maximized === "editor"`, hide terminal and route as existing logic does, do not render any resize handles, and do not mutate saved split sizes.
  - When maximization is cleared, restore the previous session split sizes.
  - Resizing is only active in the normal non-maximized desktop layout where two adjacent panes are actually visible.

## Files to modify

- `src/terminal/TerminalLayout.tsx` — apply CSS vars, replace fixed split classes, render resize handles.
- `src/terminal/TerminalResizeHandle.tsx` — new reusable resize handle component.
- `src/terminal/useResizablePanels.ts` — new hook for pointer drag logic, clamping, CSS var updates, and final state commit.
- Tests to add, likely:
  - `src/terminal/useResizablePanels.test.tsx` or focused component tests.
  - `src/terminal/TerminalResizeHandle.test.tsx` if the handle behavior is isolated enough.

## Reuse

- `src/design-system/cn.ts` for class composition.
- Existing terminal layout state in `src/terminal/TerminalLayout.tsx`:
  - `hasRightPanel`
  - `hasEditorPanel`
  - `isTerminalHidden`
  - `isRouteMaximized`
  - `isEditorMaximized`
  - mobile/desktop classes
- Existing maximization behavior via `toggleMaximizedSearch` should remain unchanged.

## Steps

- [ ] Create and switch to a new branch: `git switch -c feat/resizable-terminal-panels`.
- [ ] Inspect the current desktop layout in `TerminalLayout.tsx` and identify the exact containers that should receive sizing CSS variables.
- [ ] Add `useResizablePanels` with default split values, min/max clamps, pointer handlers, `requestAnimationFrame` scheduling, and cleanup.
- [ ] Add `TerminalResizeHandle` with accessible separator semantics:
  - `role="separator"`
  - `aria-orientation="vertical"` or `"horizontal"`
  - keyboard support for Arrow keys if practical in first pass.
- [ ] Replace fixed terminal/right desktop sizing with CSS variable based sizing only when `maximized` is undefined; preserve existing maximized behavior when route or editor is maximized.
- [ ] Replace fixed route/editor `md:grid-rows-2` with CSS variable based grid rows only when both route and editor are visible and `maximized` is undefined.
- [ ] Render desktop-only resize handles only when both adjacent panes are visible and no maximized panel state makes the handle irrelevant:
  - Terminal/right handle: render only when `hasRightPanel && maximized === undefined`.
  - Route/editor handle: render only when `hasEditorPanel && !isHomeRoute && maximized === undefined`.
- [ ] Ensure entering/exiting maximized mode does not reset the stored session split sizes.
- [ ] Ensure pointer drag updates CSS vars imperatively through `requestAnimationFrame`, then commits final state on `pointerup`.
- [ ] Add tests for clamping, final state commit, handle rendering conditions, preserving split state across maximize/unmaximize, and avoiding resize handles on mobile/maximized layouts.
- [ ] Run verification commands.

## Verification

- `bun run typecheck`
- `bun run test`
- `bunx biome check` on changed files
- Manual checks:
  - Desktop: drag terminal/right splitter smoothly.
  - Desktop: drag route/editor splitter smoothly when both route and editor panes are visible.
  - Resize both splitters, maximize route/editor, then unmaximize and confirm the previous split sizes are restored.
  - Confirm maximized route/editor states do not show irrelevant resize handles or accidental split gutters.
  - Confirm mobile panel tabs/layout are unchanged.
  - Refresh page and confirm layout starts from SSR-safe defaults with no persisted-size flash.
