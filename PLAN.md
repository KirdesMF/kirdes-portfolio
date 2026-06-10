# Recent Files — Plan

## Context

When the editor has no file open (`EmptyEditor`), the user can press shortcuts to trigger actions: "f" for Find File, "p" for Projects, "g" for Find Text, etc. The "r" shortcut is listed but does nothing. We need to implement a Recent Files feature:

- Track recently opened files in the IDE store
- Show them in a dialog when the "r" command is invoked from the empty editor
- Add "r" to the command menu (Space → r → open recent files)

## Approach

Follow the exact same patterns as `FindFileDialog`:
- Store state (`recentFiles`, `addRecentFile`) in `useIdeStore` (zustand)
  - `addRecentFile(fileId)`: removes existing occurrence, prepends to front, caps at 20
  - Result: most recently opened file at top, oldest at bottom, no duplicates
- Dialog component using `CommandDialog` from `#/design-system/command`
- Open/close controlled via store boolean (`recentFilesOpen`)
- Hotkey handled in `EmptyEditor` via `useHotkeys` (already existing pattern)
- Command menu entry in `CommandMenu` component

---

## Files to Modify

| File | What changes |
|------|-------------|
| `src/ide/store.ts` | Add `recentFiles: string[]`, `addRecentFile(fileId)`, `recentFilesOpen`, `setRecentFilesOpen` |
| `src/ide/recent-files-dialog.tsx` | **New** — Dialog listing recent files, styled like `FindFileDialog` |
| `src/editor/read-only-file-editor.tsx` | Wire "r" hotkey in `EmptyEditor`, record file opens, hook up `runEmptyEditorCommand("recent-files")` |
| `src/ide/command-menu.tsx` | Add "r" / "Recent Files" entry |
| `src/routes/_ide.tsx` | Render `<RecentFilesDialog />`, wire `recentFilesOpen` to hotkey guard |

---

## Steps

- [x] **1. Add recent files to store** — `recentFiles: string[]`, `addRecentFile(fileId)` (removes existing + prepends + caps at 20, so most recent is always at index 0), `recentFilesOpen: boolean`, `setRecentFilesOpen`

- [x] **2. Create `RecentFilesDialog` component** — Use `CommandDialog` pattern from `FindFileDialog`. List recent files with `FileText` icon and display name (via `getNeoTreeFilePaths` for path, `findEditorFile` for entry). On select → navigate to `/editor?file=xxx&neotree=open`.

- [x] **3. Record files when opened** — In `EmptyEditor` or a `useEffect`, when a file is opened (detected via route search param `file` changing to a non-null value), call `addRecentFile(file)`.

- [x] **4. Wire "r" hotkey** — In `EmptyEditor`, connect the existing `"recent-files"` command id to `setRecentFilesOpen(true)`. Add `"r"` to the `useHotkeys` array.

- [x] **5. Add command menu entry** — In `CommandMenu`, add `{ id: "recent-files", Icon: History, label: "Recent Files", shortcut: "r", action: () => { setRecentFilesOpen(true); setOpen(false); } }`.

- [x] **6. Render dialog in `_ide.tsx`** — Add `<RecentFilesDialog />` alongside existing dialogs. Add `recentFilesOpen` to hotkey guard conditions.

---

## Verification

1. Open file A → file A at top of recent list. Open file B → file B at top, file A below. Re-open file A → file A moves back to top, no duplicate.
2. Press "r" in empty editor → recent files dialog opens
3. Select a file → navigates to editor with that file, neo-tree opens and highlights it
4. Open multiple files → list shows most recent first, no duplicates
5. Space → "r" → recent files dialog opens
6. Close dialog → focus returns to editor
7. "r" hotkey is disabled when a file is already open, or when other dialogs are open
