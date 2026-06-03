# Editor status bar plan

## Context
- First phase of editor improvements: add a Neovim/LazyVim-style status bar to the read-only editor.
- The app already has segmented chevron status UI in `src/layout/AppHeader.tsx` that should be reused stylistically.
- Desired left side: `MODE > branch name > file name`.
- Desired right side: `< cursor position < VERSION`.
- Existing app header already displays time, so the rightmost item should probably be app/editor version rather than another clock.

## Approach
- Add a compact status bar at the bottom of `ReadOnlyFileEditor`, below the editor body / empty state.
- Reuse the segmented status item pattern from `AppHeader.tsx` (left/right groups, primary/muted variants, chevrons) adapted as an editor-local component or extracted to a shared reusable component if duplication would be too high.
- Use static/read-only editor metadata for phase 1:
  - MODE: `NORMAL` or `READONLY` (to confirm).
  - Branch: `feature/kirdes-app`, matching existing fake git data.
  - File: active file name, falling back to `[No Name]`/`No file` when empty.
  - Cursor position: static `1:1` for now unless highlighted file data already exposes a cursor location.
  - Version: `kish v1.0.0`, matching `TerminalSessionHeader`.

## Files to modify
- `src/editor/ReadOnlyFileEditor.tsx` — render the editor status bar and feed it active file state.
- Potentially `src/layout/AppHeader.tsx` — only if extracting shared status segment primitives is worthwhile.
- Potentially a new shared file such as `src/design-system/StatusBarSegments.tsx` — if the implementation should avoid copying AppHeader internals.

## Reuse
- `src/layout/AppHeader.tsx` — segmented chevron visual language (`StatusGroup`, `StatusSegment`, `Chevron`, `variantClass`).
- `src/terminal/TerminalFooter.tsx` and `src/terminal/terminal-command-outputs.tsx` — existing fake branch value: `feature/kirdes-app`.
- `src/terminal/TerminalSessionHeader.tsx` — existing version label: `kish v1.0.0`.
- `src/design-system/cn.ts` — class composition helper.

## Steps
- [ ] Decide the exact MODE and VERSION labels for phase 1.
- [ ] Implement/extract reusable status segment primitives based on `AppHeader.tsx` styling.
- [ ] Add `EditorStatusBar` with left and right item arrays.
- [ ] Render `EditorStatusBar` at the bottom of `ReadOnlyFileEditor` for both open-file and empty-editor states.
- [ ] Ensure the editor body uses `min-h-0 flex-1 overflow-auto` (or equivalent) so the bottom bar remains visible.
- [ ] Handle long file names with truncation and preserve responsive layout.

## Verification
- [ ] Run `bun run typecheck`.
- [ ] Run `bun run lint` or `bun run check`.
- [ ] Manually open the editor with no file selected and with multiple files selected.
- [ ] Verify left side shows mode, branch, and active file name.
- [ ] Verify right side shows cursor position and version, aligned to the right with left-pointing chevrons.
- [ ] Verify no overlap with the existing floating `read-only` badge; remove or reposition badge if redundant.
