# Plan: Find File Dialog

## Context

The empty editor/main view currently shows a `Find File` command with shortcut `f`, but it is only listed visually. The goal is to make `f` open a file picker dialog, allow filtering editor/tree files through a command input, update the IDE status mode from `NORMAL` to `INSERT` while typing, show filtered/total counts, and navigate to the chosen file.

## Approach

Add a dedicated find-file dialog controlled by IDE store state. Register the `f` hotkey from the empty editor using the existing `@tanstack/react-hotkeys` package. The dialog will reuse the existing Base UI `Dialog` wrapper and `cmdk` design-system command components.

File candidates should come from the same editor file source as the tree (`editorFiles`). To avoid duplicating the hardcoded tree structure, use `editorFiles` as the canonical selectable file list, with labels from `getDisplayFileName(file.id)`. Selecting an item navigates to `/editor` with `search: { file: file.id, neotree: "open" }` and closes the dialog.

Introduce a global editor mode in `useIdeStore` so the status bar can render `NORMAL` or `INSERT`. The find-file dialog sets mode to `INSERT` when opened/focused for typing, and resets to `NORMAL` when closed/unmounted.

## Files to modify

- `src/ide/store.ts`
  - Add editor mode state/actions and find-file dialog open state/actions.
- `src/ide/status-bar.tsx`
  - Read editor mode from store instead of hardcoding `NORMAL`.
- `src/editor/read-only-file-editor.tsx`
  - Wire the empty editor `f` hotkey to open the find-file dialog.
  - Ensure hotkeys remain disabled while modals/command menu are open.
- `src/routes/_ide.tsx`
  - Render the new find-file dialog alongside `CommandMenu` and `SettingsDialog`.
  - Disable global Space command-menu hotkey while find-file dialog is open.
- `src/ide/find-file-dialog.tsx` (new)
  - Dialog UI, command input/list, filtering count, selection/navigation behavior.

## Reuse

- `@tanstack/react-hotkeys` via existing `useHotkeys` usage in:
  - `src/editor/read-only-file-editor.tsx`
  - `src/routes/_ide.tsx`
- Dialog primitives from:
  - `src/design-system/dialog.tsx`
- Command primitives from:
  - `src/design-system/command.tsx`
- File data/helpers from:
  - `src/editor/editor-files.ts`
  - `editorFiles`
  - `getDisplayFileName`
- Navigation pattern from tree file selection in:
  - `src/ide/neo-tree.tsx`
- Store pattern from:
  - `src/ide/store.ts`

## Steps

- [ ] Add `editorMode: "normal" | "insert"`, `setEditorMode`, `findFileOpen`, and `setFindFileOpen` to `useIdeStore`.
- [ ] Update `StatusBar` mode segment to display `editorMode.toUpperCase()`.
- [ ] Create `FindFileDialog` component using `Dialog`, `Command`, `CommandInput`, `CommandList`, `CommandItem`, and `CommandEmpty`.
- [ ] In `FindFileDialog`, derive candidates from `editorFiles`, filter by command input value, and display the count as `filteredCount/totalCount` at the right side of the input row.
- [ ] When dialog opens, focus the command input and set editor mode to `insert`; when it closes/unmounts, reset to `normal`.
- [ ] On item select, navigate to `/editor` with `{ file: selected.id, neotree: "open" }`, close the dialog, and reset mode.
- [ ] Render `FindFileDialog` in `src/routes/_ide.tsx` and disable the global Space hotkey while it is open.
- [ ] Add the `f` hotkey in `EmptyEditor` to open find-file, using `useHotkeys` with `enabled` rather than callback guards.
- [ ] Keep command menu/settings/find-file state mutually non-conflicting: opening find-file should no-op or be disabled when command menu/settings are open.

## Verification

- [ ] Run `bun run typecheck`.
- [ ] Run scoped Biome lint on modified files, or `bun run lint` if unrelated existing lint is fixed.
- [ ] Manual: from the empty editor/main view, press `f`; find-file dialog opens.
- [ ] Manual: status bar changes `NORMAL` → `INSERT` while dialog input is active.
- [ ] Manual: count shows `N/N` initially and updates while filtering, e.g. `5/10`.
- [ ] Manual: selecting a file navigates to `/editor?file=...&neotree=open` and renders the file.
- [ ] Manual: closing dialog with Escape restores `NORMAL` and does not trigger other app hotkeys.
