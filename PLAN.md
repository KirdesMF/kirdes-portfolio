# Neo-Tree Refactor with Headless Tree — Plan

## Context

The current `NeoTree` component (`src/ide/neo-tree.tsx`) is a hand-built tree with manual state management for expanding/collapsing folders. It works but lacks:

- **Keyboard navigation** — no arrow keys, Enter to open files, etc.
- **Accessibility** — no ARIA attributes, screen-reader support
- **Search/filter** — no way to filter the tree by typing (like LazyVim's file explorer)

**Goal:** Replace the manual tree implementation with [`headless-tree`](https://headless-tree.lukasbach.com/) (already available on npm as `@headless-tree/core` + `@headless-tree/react`), which provides all of the above out of the box. Keep it simple: open/close folders, keyboard nav, search. No drag-and-drop.

A follow-up will add an inline search bar to filter the tree in-place (the `searchFeature` from headless-tree makes this trivial — we just need to render the search input).

---

## Approach

1. **Install** `@headless-tree/core` and `@headless-tree/react`
2. **Transform the existing tree data** (`TreeNode[]`) into a flat ID→payload map compatible with headless-tree's `syncDataLoaderFeature`
3. **Replace the manual React tree rendering** with headless-tree's `useTree` hook, spreading `tree.getContainerProps()` and `item.getProps()` for built-in ARIA and keyboard event handlers
4. **Add `hotkeysCoreFeature`** for arrow-key navigation, Enter to invoke primary action, Left/Right to collapse/expand
5. **Add `searchFeature`** for typeahead search (type while focused → filter highlights matching items, arrow keys navigate matches)
6. **Render the search input** when `tree.isSearchOpen()` is true, styled like the existing prompt/command inputs
7. **Auto-expand folders** when a file is selected (derive expanded item IDs from the current `file` search param)
8. **Preserve the exported `getNeoTreeFilePaths()`** function — it's used by `FindFileDialog` and `FindTextDialog`

---

## Files to Modify

| File | What changes |
|------|-------------|
| `package.json` | Add `@headless-tree/core` and `@headless-tree/react` dependencies |
| `src/ide/neo-tree.tsx` | Full rewrite: use `useTree` hook, render flat items, add search input, keep `getNeoTreeFilePaths` export |

No other files need changes — the public API (`getNeoTreeFilePaths`) and the URL search param interface (`neotree: "open" | "closed"`, `file: string`) stay the same.

---

## Reuse

| File | What we reuse |
|------|-------------|
| `src/editor/editor-files.ts` | `editorFiles` data — the tree payloads come from here |
| `src/editor/editor-files.types.ts` | `EditorFileEntry` type |
| `src/design-system/cn.ts` | `cn` utility for conditional classes |
| `src/ide/search.ts` | `IdeSearch` type — the `file` + `neotree` search params |
| `src/routes/_ide.tsx` | Already renders `<NeoTree />` when `neotree === "open"` — no change needed |
| `lucide-react` | `FileText`, `Folder`, `FolderOpen`, `X`, `Search`, `ChevronRight` icons — already in the project |

---

## Data Transformation Strategy

The current tree is a nested `TreeNode[]`. Headless-tree needs:

- A flat `Record<itemId, payload>` for `getItem()`
- A `getChildren(itemId)` that returns child IDs

We'll transform the nested tree into:

```ts
// Payload type
type TreeItemData = 
  | { kind: "folder"; label: string; children: string[] }  // string[] = child IDs
  | { kind: "file"; entry: EditorFileEntry; displayName: string };

// Flat map: itemId → TreeItemData
// Root is "root", children are "root/src", "root/src/about", "root/README.md", etc.
```

The existing `buildTree()` function can be adapted to produce this flat structure instead of the nested one.

---

## Steps

- [ ] **1. Install dependencies** — `bun add @headless-tree/core @headless-tree/react`

- [ ] **2. Build the flat tree data structure** — Rewrite the tree-building logic to produce:
  - A `Record<string, TreeItemData>` for `getItem`
  - A `getChildren(itemId)` function
  - Keep the existing `getNeoTreeFilePaths()` working (walk the flat structure to build path map)

- [ ] **3. Implement `useTree` hook with core features** — In the `NeoTree` component:
  - `syncDataLoaderFeature` — for the static tree data
  - `hotkeysCoreFeature` — for arrow keys, Enter, Home/End, Left/Right expand/collapse
  - `searchFeature` — for typeahead search/filter
  - Configure `rootItemId`, `getItemName`, `isItemFolder`, `indent`
  - Set `onPrimaryAction` to navigate to the editor when a file is clicked/Entered

- [ ] **4. Render the tree using headless-tree's flat item list** — Replace the recursive `TreeNodeItem` with:
  - A container `<div>` spreading `tree.getContainerProps()`
  - Map over `tree.getItems()` rendering each item as a `<button>` spreading `item.getProps()`
  - Use `item.getItemMeta().level` for indentation (already built-in)
  - Render folder/file icons based on `item.isFolder()` and `item.isExpanded()`
  - Highlight the active file using `search.file` from router state

- [ ] **5. Add the search input** — When `tree.isSearchOpen()`:
  - Render an `<input>` spreading `tree.getSearchInputElementProps()` at the top of the tree panel
  - Style it like the existing command/search inputs (small monospace, border-bottom)
  - Show match count: `{tree.getSearchMatchingItems().length} matches`
  - Highlight matching items via `item.isMatchingSearch()`

- [ ] **6. Auto-expand to selected file** — When `search.file` is set (a file is open in the editor):
  - Compute the ancestor folder IDs of that file
  - Pass them to `initialState.expandedItems` so the path is expanded on mount
  - Use `item.setFocused()` + `tree.updateDomFocus()` to scroll to and focus the file

- [ ] **7. Clean up old code** — Remove the old `TreeNode` type, `buildTree`, `TreeNodeItem`, manual `expanded` state, and manual `toggleExpand`

---

## Verification

1. **Open/close folders** — Click folder arrows or use Left/Right arrow keys to collapse/expand
2. **Keyboard navigation** — Use Up/Down arrows to move focus; Enter to open a file; Home/End for first/last
3. **File selection** — Click a file or press Enter on it → navigates to `/editor?file=xxx&neotree=open`, file opens in editor
4. **Search** — Type while focused on the tree → search input appears, tree filters to matching items, arrow keys navigate matches, Escape closes search
5. **Auto-expand** — Open a file via Find File dialog (`Cmd+P`) → neo-tree opens with the file's folder path expanded and the file focused
6. **Accessibility** — Inspect the DOM: container has `role="tree"`, items have `role="treeitem"`, `aria-expanded`, `aria-selected`, `aria-level`, etc.
7. **Find File / Find Text still work** — `Cmd+P` and text search still list files correctly (they use `getNeoTreeFilePaths()`)
8. **Close button** — The X button in the EXPLORER header still closes the tree
9. **Mobile** — Tree still renders correctly at narrow widths
