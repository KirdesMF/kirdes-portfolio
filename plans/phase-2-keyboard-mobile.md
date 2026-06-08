# Phase 2 — Keyboard shortcuts

## Context

Phase 1 built the IDE shell. Navigation works with mouse/touch but has no keyboard shortcuts. This phase adds the core Neovim-style keybindings.

## Design

### Shortcuts

| Key | Condition | Action |
|-----|-----------|--------|
| `Space` | Menu closed, not in input | Open space menu |
| `Escape` | Menu open | Close space menu |
| `Escape` | File open in editor | Close file → return to welcome |
| `e` | Menu closed, not in input | Toggle neo-tree (`?neotree=open` / `closed`) |
| `t` | Menu closed, not in input | Navigate to `/terminal` |
| `/` | Menu closed, not in input | Navigate to `/editor` |

### Context rules

- Shortcuts **do not fire** when focus is inside an input/textarea (prevents conflicts with terminal prompt typing)
- Space menu open: only `Escape` is active (the menu handles its own `↑↓`/`Enter`/`Escape`)
- Detecting "not in input": check `document.activeElement?.tagName` or use `enableOnFormTags: false` option in the hotkeys library

### No provider needed

`@tanstack/react-hotkeys`'s `useHotkeys` works standalone. No `HotkeysProvider` — just call the hook in `_ide.tsx`.

## Files to Create

### 1. (none needed — no separate keyboard file)

The hotkeys hook is called directly in `_ide.tsx`. Simple enough that extraction isn't necessary.

## Files to Modify

### 2. `src/routes/_ide.tsx`
Add `useHotkeys` from `@tanstack/react-hotkeys`. Read Zustand store for `spaceMenuOpen`. Use `useRouter`/`useNavigate` for route changes.

```tsx
import { useHotkeys } from "@tanstack/react-hotkeys"

function IdeShell() {
  // ... existing code ...
  
  useHotkeys([
    ["Space", () => { if (!spaceMenuOpen) toggleSpaceMenu() }],
    ["Escape", () => { 
      if (spaceMenuOpen) { setSpaceMenuOpen(false); return }
      if (file) { navigate({ to: "/editor", search: {} }); return }
    }],
    ["e", () => { if (!spaceMenuOpen) toggleNeoTree() }],
    ["t", () => { if (!spaceMenuOpen) navigate({ to: "/terminal" }) }],
    ["/", () => { if (!spaceMenuOpen) navigate({ to: "/editor" }) }],
  ], { enableOnFormTags: false }) // don't fire when typing in terminal prompt
}
```

Switch from `useNavigate` / `useRouter` — `useRouter().navigate` is fine for imperative calls.

### 3. `src/routes/_ide.editor.tsx`
No changes needed for Escape-close-file — it's handled in `_ide.tsx` since `file` is read from search params in the parent layout.

### 4. `src/ide/store.ts`
Add `toggleNeoTree` to navigate helper or handle it in the `_ide.tsx` hotkeys handler directly (since neo-tree toggle needs `useNavigate`).

Actually, neo-tree toggle is a search param. We already have `neotree` in the route search. The hotkey handler in `_ide.tsx` can toggle it via `navigate`.

### 5. `package.json`
No changes. `@tanstack/react-hotkeys` is already listed as `@tanstack/react-hotkeys` in package.json? Need to check — if not, install it.

Actually, `@tanstack/react-hotkeys` might be a separate package. Let me check: it's `@tanstack/react-hotkeys` on npm. Need to `bun add`.

Wait — looking at the TanStack docs, the package is actually called `@tanstack/react-hotkeys` — no, it was renamed. Let me check: the package is `@tanstack/react-hotkeys` in the TanStack Router ecosystem? No, hotkeys is separate. 

Actually, I need to verify the package name. The user mentioned `https://tanstack.com/hotkeys/latest/docs/installation`. The package is probably `@tanstack/react-hotkeys` — but let me check if it exists in the project already or needs installing.

Let me add a step to check the package name and install it.

## Implementation Steps

- [ ] 1. Check if `@tanstack/react-hotkeys` is in package.json; if not, install it
- [ ] 2. Add `useHotkeys` to `src/routes/_ide.tsx` with the 6 shortcuts
- [ ] 3. Regenerate route tree, run typecheck, biome, tests
- [ ] 4. Manual walkthrough

## Verification

- `bun run typecheck` — zero errors
- `bunx biome check` — no issues
- `bun run test` — all passing
- `bun run dev` — manual checks:
  - [ ] Press `Space` → space menu opens
  - [ ] Press `Escape` with menu open → menu closes
  - [ ] Press `Escape` with file open → returns to welcome
  - [ ] Press `e` → neo-tree toggles
  - [ ] Press `t` → navigates to `/terminal`
  - [ ] Press `/` → navigates to `/editor`
  - [ ] Typing in terminal prompt → shortcuts do NOT fire
