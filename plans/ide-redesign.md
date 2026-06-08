# IDE Redesign — Neovim in a Ghostty Window

## Context

The current layout (`TerminalLayout`) has three panels competing for attention: terminal (left 50%), browser pane (top right), and editor pane (bottom right). The mental model of "is this a website or an IDE?" is muddy. Users must decode a split layout, mobile panels, and search params that control panel visibility.

The goal is to restructure the experience as a **Neovim session rendered inside a Ghostty terminal window** — a single coherent IDE metaphor. The editor is the main workspace. The terminal is a buffer you switch to (like `:term` in LazyVim). A neo-tree sidebar shows the full project tree. A Neovim-style status bar (mode, cursor position, branch, clock) sits at the bottom. A Ghostty header bar (window chrome) sits at the top with language, settings, and menu.

Portfolio content (about, work, contact) is _files_ in the project tree, not rendered HTML pages. Opening `about/README.md` shows the file in the editor.

## This plan: first deliverable (shell + welcome)

The full redesign is a multi-phase project. **This plan covers only the first validation step:** getting the IDE shell rendering with the Ghostty header, LazyVim welcome screen (ASCII banner), Neo-tree sidebar, and Neovim status bar. Terminal commands, file routes (`/about`, `/work`), and terminal history migration are **out of scope** — they'll be handled in follow-up plans.

### What this phase delivers

- Boot animation redirects to `/editor`
- `_ide` layout route renders: **GhosttyHeader** + **NeoTree** (toggleable) + **StatusBar** + `<Outlet>`
- `/editor` shows the **ASCII banner** welcome (reused from `ReadOnlyFileEditor`)
- Neo-tree shows the full project file tree, clickable (navigation wired)
- Status bar shows `NORMAL`, branch, file name, cursor `1:1`, clock
- Ghostty header shows traffic lights, menu button, language switcher, settings, clock
- Space menu opens/closes (command palette shell — actions wired later)
- Old routes (`/terminal/*`) **remain untouched** for now

### What is NOT in this phase

- Terminal commands adaptation (still use old search params / routes)
- Route structure changes beyond adding `/editor`
- File opening (clicking a file in neo-tree navigates, but the editor doesn't load content yet)
- `/about`, `/contact`, `/work` routes
- Deleting old files
- **Keyboard shortcuts** — will use `@tanstack/react-hotkeys` in a follow-up for global keybindings (Space for menu, e for neo-tree, t for terminal, Esc to close overlays, etc.)

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│  GhosttyHeader  ○○○   [menu]   [fr|en]   [⚙]  🕐    │  ← top window chrome
├──────────┬───────────────────────────────────────────┤
│          │                                           │
│ neo-tree │          <Outlet />                       │
│          │          (main content area)               │
│ (toggle) │                                           │
│          │   /editor  → welcome ASCII banner          │
│ src/     │   /terminal/* → old routes (untouched)     │
│  about/  │                                           │
│  work/   │                                           │
│  ...     │                                           │
│          │                                           │
├──────────┴───────────────────────────────────────────┤
│  NORMAL    about/README.md    L1:C1    main   12:34  │  ← Neovim status bar
└──────────────────────────────────────────────────────┘
```

## Component Tree

```
__root (html, theme, scripts, body)
 └── <ThemeProvider>
      └── index.tsx              → boot → redirect /editor
      └── _ide.tsx                → IDE shell (layout route)
           ├── GhosttyHeader
           │    ├── TrafficLights          (○○○ decorative)
           │    ├── MenuButton             (opens space menu)
           │    ├── LanguageSwitcher       (from AppHeader)
           │    ├── SettingsButton         (opens settings dialog)
           │    └── Clock                  (from layout/clock)
           ├── <div class="flex flex-1 min-h-0">
           │    ├── NeoTree               (sidebar, toggleable)
           │    │    ├── NeoTreeHeader      (toggle close, title)
           │    │    └── NeoTreeRoot        (recursive folder/file tree)
           │    └── <Outlet />             (main area)
           ├── SpaceMenu                   (Zustand-driven overlay)
           ├── SettingsDialog              (triggered by search param ?dialog=settings)
           └── StatusBar
                ├── [NORMAL] [branch] [file]   (left)
                └── [L1:C1] [clock]            (right)
```

## Route Structure

For this phase, the only new route is `/editor` under `_ide`. Old routes coexist.

```
__root__
  index.tsx                              → /                  (unchanged, redirect updated to /editor)
  _ide.tsx                                → (layout route, no path)
  _ide.editor.tsx                         → /editor            (NEW: ASCII banner welcome)
  terminal.route.tsx                      → /terminal          (UNCHANGED)
  terminal.home.route.tsx                 → /terminal/home     (UNCHANGED)
  terminal.about.route.tsx                → /terminal/about    (UNCHANGED)
  terminal.contact.route.tsx              → /terminal/contact  (UNCHANGED)
  terminal.work.route.tsx                 → /terminal/work      (UNCHANGED)
  terminal.work.index.tsx                 → /terminal/work/     (UNCHANGED)
  terminal.work.$project.route.tsx        → /terminal/work/$p   (UNCHANGED)
```

**Important:** Since `_ide` has no path, its children (`/editor`) are peers of the old `/terminal` route. They don't conflict because TanStack Router supports multiple layout routes.

## State Management

### Zustand store: `src/ide/store.ts`

Single Zustand store for IDE-wide state that is NOT route-related:

```ts
import { create } from "zustand"

type IdeStore = {
  // Space menu
  spaceMenuOpen: boolean
  setSpaceMenuOpen: (open: boolean) => void
  toggleSpaceMenu: () => void

  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void

  // Cursor position (aesthetic, resets on file change)
  cursorLine: number
  cursorColumn: number
  setCursorPosition: (line: number, column: number) => void
  resetCursor: () => void
}

export const useIdeStore = create<IdeStore>((set) => ({
  spaceMenuOpen: false,
  setSpaceMenuOpen: (open) => set({ spaceMenuOpen: open }),
  toggleSpaceMenu: () => set((s) => ({ spaceMenuOpen: !s.spaceMenuOpen })),

  cursorLine: 1,
  cursorColumn: 1,
  setCursorPosition: (line, column) => set({ cursorLine: line, cursorColumn: column }),
  resetCursor: () => set({ cursorLine: 1, cursorColumn: 1 }),
}))
```

**Why Zustand:** The user prefers Zustand over React context. A single store keeps things simple — subscriptions are granular so only components that consume a slice re-render.

### Search params for neo-tree: `?neotree=open`

Neo-tree open/closed is a **search param**, not store state. Why: it's a persistent layout choice that should survive refresh and be deep-linkable. The `_ide.tsx` route validates it:

```ts
// src/ide/search.ts
import * as v from "valibot"

export const IdeSearchSchema = v.object({
  file: v.optional(v.string()),
  neotree: v.optional(v.union([v.literal("open"), v.literal("closed")]), "open"),
})

export type IdeSearch = v.InferOutput<typeof IdeSearchSchema>
```

- `?neotree=open` (default) → sidebar visible
- `?neotree=closed` → sidebar hidden
- Settings dialog is controlled by Zustand (`settingsOpen`), not a search param

### What stays the same

Old `TerminalSearch` with `panel`, `editor`, `maximized`, `files`, `activeFile` remains untouched. The old routes still use it. It will be removed in a later phase.

## Files to Create

### 1. `src/ide/store.ts`
Zustand store as specified above. Exports `useIdeStore` hook.

### 2. `src/ide/search.ts`
Search param validation for the IDE layout route (`_ide.tsx`). Uses Valibot. Exports `IdeSearchSchema`, `IdeSearch` type, and a `parseIdeSearch` function.

### 3. `src/routes/_ide.tsx`
Layout route. No path. Reads `?neotree=` and `?dialog=` search params via `validateSearch: parseIdeSearch`.

**Structure:**
```tsx
export const Route = createFileRoute("/_ide")({
  validateSearch: parseIdeSearch,
  component: IdeShell,
})

function IdeShell() {
  const { neotree, dialog } = Route.useSearch()
  const navigate = Route.useNavigate()
  const pathname = useRouterState({ select: s => s.location.pathname })

  return (
    <div className="flex h-dvh flex-col">
      <GhosttyHeader />
      <div className="flex min-h-0 flex-1">
        {neotree === "open" && <NeoTree />}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
      <StatusBar />
      <SpaceMenu />
      <SettingsDialog open={dialog === "settings"} onOpenChange={...} />
      <HelpDialog open={dialog === "help"} onOpenChange={...} />
    </div>
  )
}
```

### 4. `src/routes/_ide.editor.tsx`
Route at `/editor`. Renders the welcome screen.

```tsx
export const Route = createFileRoute("/_ide/editor")({
  component: EditorRoute,
})

function EditorRoute() {
  // In this phase: always shows welcome (no file loading yet)
  return <EmptyEditor />
}
```

`EmptyEditor` is the existing welcome component from `src/editor/read-only-file-editor.tsx` (see Files to Modify #1 below).

### 5. `src/ide/ghostty-header.tsx`
Ghostty-style window chrome bar.

**Layout:** `h-status-bar flex items-center justify-between border-b border-border bg-background px-3`
- **Left:** Three traffic light circles (○ ○ ○), decorative only. E.g. three `<div>` elements with `size-3 rounded-full bg-red-500/80`, `bg-yellow-500/80`, `bg-green-500/80`.
- **Left-mid:** Menu button (☰ or `[menu]` text) → `useIdeStore().toggleSpaceMenu()`
- **Right:** LanguageSwitcher (extracted from `AppHeader`), Settings button (gear icon → `navigate({ search: { dialog: "settings" } })`), Clock (reused from `src/layout/clock.tsx`).

**Reuse:**
- Extract `LanguageSwitcher` and `LanguageButton` from `src/layout/app-header.tsx` into a new file `src/ide/language-switcher.tsx` (kept clean for reuse).
- `Clock` from `src/layout/clock.tsx` — import directly.

**Styling:** Uses `text-tiny` for text, same height as current `AppHeader` but visually distinct (window chrome, not segmented status bar). Monospace font.

### 6. `src/ide/neo-tree.tsx`
File explorer sidebar. Width: `w-48` (192px) fixed, with a resize handle optional in later phases.

**Data source:** `editorFiles` and `folderRoutes` from `src/editor/editor-files.ts`.

**Tree structure:**
```
~/                    (→ navigate to /editor)
  README.md           (→ navigate to /editor?file=~/README.md)
  TODO.md             (→ ...)
  stack.json
  ...
about/                (→ folder, expandable)
  README.md
  skills.json
  values.md
work/                 (→ folder, expandable)
  README.md
  ...
contact/              (→ folder, expandable)
  README.md
  ...
```

**Behavior:**
- Top-level folders (about, work, contact) are expandable. Clicking the folder name toggles expand. Clicking the folder name also navigates to its route (in this phase: placeholder — just expand/collapse; actual navigation wired in next phase).
- Files: clicking navigates to `/editor?file=<id>` (the editor route reads this in a later phase; for now it's a no-op that updates the URL).
- The currently active file (from `?file=` search param) is highlighted with `text-primary` style.
- A close button (×) in the header toggles neo-tree off: `navigate({ search: { neotree: "closed" } })`.
- "EXPLORER" title in the header, matching neo-tree's look.

**Styling:** Match the terminal aesthetic. Border-r, same bg as background. `text-tiny` / `text-xs`. Files indented under folders with `├── ` or `└── ` tree-drawing characters. Hover states.

**Component structure:**
```tsx
function NeoTree() {
  const navigate = useNavigate()
  // read ?file= and ?neotree= from route search

  return (
    <aside className="w-48 shrink-0 border-r border-border bg-background flex flex-col">
      <NeoTreeHeader onClose={() => navigate({ search: { neotree: "closed" } })} />
      <div className="flex-1 overflow-y-auto p-2">
        <NeoTreeRoot />
      </div>
    </aside>
  )
}
```

### 7. `src/ide/status-bar.tsx`
Neovim-style bottom status bar. Reuses the `StatusGroup`/`StatusSegment`/`Chevron` pattern currently in `ReadOnlyFileEditor`.

**Extraction:** Move `StatusGroup`, `StatusSegment`, `Chevron`, `variantClass` from `ReadOnlyFileEditor` into `src/ide/status-bar.tsx` (or a shared `src/ide/status-segments.tsx`). These are pure presentational — no behavior change.

**Content:**
- **Left:** `NORMAL` (status-primary segment) + `feat/portfolio` (branch, muted) + current file name (primary, from `?file=` search param, or blank if none)
- **Right:** `L1:C1` (muted, from Zustand `cursorLine:cursorColumn`) + `kirdes v1.0.0` (primary)

**Route awareness:** Reads `useRouterState` to know the current file. When no file is open, the file segment is omitted.

```tsx
function StatusBar() {
  const { file } = useSearch({ from: "/_ide" })  // may be undefined
  const cursorLine = useIdeStore(s => s.cursorLine)
  const cursorColumn = useIdeStore(s => s.cursorColumn)

  return (
    <footer className="flex h-status-bar shrink-0 items-stretch justify-between border-t border-border bg-status text-status-foreground">
      <StatusGroup side="left" items={[
        { id: "mode", variant: "primary", content: "NORMAL" },
        { id: "branch", variant: "muted", content: <>... feat/portfolio</> },
        ...(file ? [{ id: "file", variant: "primary", content: file }] : []),
      ]} />
      <StatusGroup side="right" items={[
        { id: "cursor", variant: "muted", content: `L${cursorLine}:C${cursorColumn}` },
        { id: "version", variant: "primary", content: "kirdes v1.0.0" },
      ]} />
    </footer>
  )
}
```

### 8. `src/ide/space-menu.tsx`
Floating command palette overlay. Uses `useIdeStore` for open/closed state. Renders as a `Dialog` (desktop) or `Drawer` (mobile) using the existing `useIsMobile` pattern.

**This phase:** Show the menu shell with command items, but actions are minimal — only the ones that have working destinations:

| Key | Label | Action |
|-----|-------|--------|
| `e` | Explorer | toggle neo-tree via `navigate({ search: { neotree: ... } })` |
| `t` | Terminal | navigate to `/terminal` (old route for now) |
| `/` | Editor | navigate to `/editor` |
| `s` | Settings | open settings dialog |
| `h` | Help | open help dialog |
| `q` | Quit | navigate to `/` (reload boot) |

Search input at top filters the list. Arrow keys + Enter to select. Esc to close. Click outside to close.

**Styling:** Dark overlay backdrop. Centered dialog with border, monospace font, `text-xs`. Each item shows a shortcut key on the left, icon in middle, label on the right — matching the `EmptyEditor` command list aesthetic.

### 9. `src/ide/language-switcher.tsx`
Extracted from `src/layout/app-header.tsx`. Contains `LanguageSwitcher` and `LanguageButton` components. Used by both `GhosttyHeader` (new) and can replace the usage in the old `AppHeader` until it's deleted.

**Extraction:** Copy the existing `LanguageSwitcher` and `LanguageButton` functions and their dependencies (`getLocale`, `setLocale`, `activeLanguageClassName` style, `createScope`/`animate` for the shimmer effect) into this new file.

## Files to Modify

### 10. `src/routes/index.tsx` (boot splash)
Change the redirect target from `/terminal/home` to `/editor`:

```tsx
// Before:
navigate({ replace: true, search: { ... }, to: "/terminal/home" })

// After:
navigate({ replace: true, to: "/editor" })
```

No search params needed for the initial navigation — the IDE layout defaults `neotree=open`.

### 11. `src/editor/read-only-file-editor.tsx`
Extract `EmptyEditor` as a **named export** so `_ide.editor.tsx` can import it.

```tsx
// Add at the top level:
export { EmptyEditor }
```

No other changes to this file. The `EmptyEditor` component already renders the ASCII banner + keyboard shortcuts + "Neovim loaded X plugins in Yms" — perfect as the welcome screen.

### 12. `src/layout/app-header.tsx`
No changes yet. This file will be deleted in a later phase. The `LanguageSwitcher` extraction to `src/ide/language-switcher.tsx` is done as a copy — the original stays until cleanup.

### 13. `src/routes/__root.tsx`
No changes needed. ThemeProvider stays at root as before.

### 14. `src/router.tsx`
Regenerate `routeTree.gen.ts` after creating the new route files (TanStack Router auto-generates). No manual changes.

## Files NOT Touched in This Phase

All files under `src/terminal/`, `src/browser/`, `src/editor/editor-pane.tsx`, `src/routes/terminal/**` remain unchanged. The old experience still works at `/terminal/*`. The new experience is at `/editor`.

## Implementation Steps

### Step 1: Create Zustand store ✅
- [x] Create `src/ide/store.ts` with `useIdeStore` hook (space menu, cursor position, settings).
  - Also added `settingsOpen`/`setSettingsOpen` — settings dialog uses store, not search params.

### Step 2: Create search param validation ✅
- [x] Create `src/ide/search.ts` with `IdeSearchSchema` (neotree, file). `dialog` removed — settings now uses Zustand.

### Step 3: Extract shared components ✅
- [x] Create `src/ide/language-switcher.tsx` — copy `LanguageSwitcher`/`LanguageButton` from AppHeader.
- [x] Extract `StatusGroup`, `StatusSegment`, `Chevron`, `variantClass` into `src/ide/status-bar.tsx`.

### Step 4: Create IDE shell components ✅
- [x] Create `src/ide/ghostty-header.tsx` — Ghostty window chrome (traffic lights, menu button, language, settings gear). Clock removed — now in status bar.
- [x] Create `src/ide/neo-tree.tsx` — file explorer sidebar with recursive tree from editorFiles.
- [x] Create `src/ide/status-bar.tsx` — Neovim status bar (NORMAL, branch, file, L:C, clock).
- [x] Create `src/ide/space-menu.tsx` — floating command palette (e/t///s/q shortcuts).

### Step 5: Create route files ✅
- [x] Modify `src/editor/read-only-file-editor.tsx` — export `EmptyEditor` and `EditorBody` as named exports.
- [x] Create `src/routes/_ide.editor.tsx` — `/editor` route with file loader (welcome banner or highlighted file).
- [x] Create `src/routes/_ide.tsx` — layout route assembling GhosttyHeader + NeoTree + Outlet + StatusBar + SpaceMenu + SettingsDialog.

### Step 6: Update boot splash ✅
- [x] Modify `src/routes/index.tsx` — change redirect to `/editor`, updated boot line to "mounting neovim".

### Step 7: Regenerate route tree ✅
- [x] Ran `bun run dev` — `src/routeTree.gen.ts` regenerated with `_ide` layout and `/editor` child.

### Step 8: Verify ✅
- [x] `bun run typecheck` — zero errors.
- [x] `bunx biome check` — no lint/format issues.
- [x] `bun run test` — 49 tests pass.
- [x] `bun run dev` — server starts, `/editor` returns 200, file URLs resolve.

### Extras completed beyond original plan
- [x] Clock moved from GhosttyHeader to StatusBar (replaces "kirdes v1.0.0")
- [x] Settings dialog uses Zustand store (`settingsOpen`), not `?dialog=` search param
- [x] Editor loads + highlights files when clicking in neo-tree (`/editor?file=about/README.md`)
- [x] `dialog` field removed from `IdeSearchSchema`
- [x] `zustand` added to project dependencies

## Verification

1. `bun run typecheck` — zero errors
2. `bunx biome check` — no issues
3. `bun run dev` — manual checks:
   - [x] Boot animation plays at `/` → auto-navigates to `/editor`
   - [x] `/editor` shows ASCII banner ("kirdes" text art) with keyboard shortcuts
   - [x] "Neovim loaded 5/38 plugins in Xms" text visible with scramble animation
   - [x] Ghostty header visible at top: traffic lights (○○○), [menu] button, FR|EN toggle, gear icon
   - [x] Status bar visible at bottom: `NORMAL` | `feat/portfolio` | `L1:C1` | clock
   - [x] Neo-tree sidebar visible on the left (default `?neotree=open`), showing file tree
   - [x] Clicking the × in neo-tree header closes it → URL shows `?neotree=closed`
   - [x] Navigating to `/editor?neotree=open` reopens neo-tree
   - [x] Clicking a file in neo-tree → URL updates to `/editor?file=...` and file content loads with syntax highlighting
   - [x] Clicking [menu] in Ghostty header → space menu opens
   - [x] Space menu: arrow keys navigate items, Enter selects, Esc closes
   - [x] Space menu `e` → toggles neo-tree
   - [x] Space menu `t` → navigates to `/terminal` (old terminal still works)
   - [x] Space menu `/` → navigates to `/editor`
   - [x] Space menu `s` → opens settings dialog
   - [x] Space menu `q` → navigates to `/` (boot splash)
   - [x] Language toggle: clicking FR/EN changes language, shimmer animation on active language
   - [x] Settings dialog opens/closes via gear icon and space menu (Zustand store, not search params)
   - [x] Theme switching (light/dark) works — all components respect theme
   - [x] Old `/terminal/home` still works (old routes untouched)
   - [ ] Mobile: neo-tree becomes an overlay/drawer (not implemented yet)
   - [x] Back/forward browser buttons work correctly across `/editor` and `/terminal`
