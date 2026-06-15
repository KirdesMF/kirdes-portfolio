# Plan: route-based editor files

## Context

- The app currently opens files through `/editor?file=<file-id>`.
- Only one file is displayed at a time, so the selected file can be represented by the pathname instead of a `file` search param.
- `/` should remain the intro/splash route.
- `neotree=open|closed` can stay as a search param because it is UI/layout state, not selected-content state.

## Approach

- Replace `?file=` selection with route-based file pages.
- Keep the existing IDE shell/layout parent internally, but expose clean public paths.
- Keep `/` as intro.
- Add `/home` as the editor home screen with `AsciiBanner`.
- Map root files under `/home/*`.
- Map section files under their section routes.
- Keep `?neotree=open|closed` as the only editor UI search param.

## Proposed routes

```txt
/                  -> intro route
/home              -> home editor screen / ASCII banner
/home/readme       -> ~/README.md
/home/todo         -> ~/TODO.md
/home/agents       -> ~/AGENTS.md
/home/config       -> ~/profile.ts
/home/package      -> ~/package.json

/about             -> about/route.tsx
/about/skills      -> about/skills.json
/about/values      -> about/values.md

/projects          -> projects/index.md
/projects/atlas    -> projects/atlas-notes.md
/projects/signal   -> projects/signal-forge.md
/projects/orbit    -> projects/orbit-ui.md

/contact           -> contact/contact.md or contact/route.tsx
/contact/links     -> contact/links.json
```

Example with NeoTree state:

```txt
/projects/atlas?neotree=open
/about/values?neotree=closed
```

## Files to modify

- `src/ide/search.ts` — remove `file` from route search state, keep `neotree`.
- `src/routes/_ide.editor.tsx` — likely replace/remove with route-based file route(s).
- New/updated route files under `src/routes/` for `/home`, `/home/*`, `/about/*`, `/projects/*`, `/contact/*`.
- `src/editor/editor-files.ts` / file catalogue types — add route/path metadata for each editor file.
- `src/ide/neo-tree.tsx` — navigate to file routes instead of `/editor?file=...`.
- `src/editor/read-only-file-editor.tsx` — project/home shortcuts navigate to routes.
- `src/ide/command-menu.tsx` — update project/editor/open-preview actions.
- `src/editor/markdown-links.ts` — resolve markdown links to route paths instead of `file` search params.
- Tests in `src/editor/*.test.ts`, `src/terminal/*.test.ts` as needed.

## Reuse

- Keep `CodeFileEditor` and Shiki highlighting pipeline.
- Keep `findEditorFile`, but add route lookup helpers such as `findEditorFileByRoute(pathname)`.
- Keep `AsciiBanner` for `/home` empty/home screen.
- Keep `neotree` search param and existing open/closed behavior.
- Keep the NeoTree data model, but store/navigate route paths per file.

## Steps

- [x] Add route metadata to each editor file entry, e.g. `route: "/projects/atlas"`.
- [x] Add helper functions: `findEditorFileByRoute`, `getEditorFileRoute`, and maybe `getDisplayRouteName`.
- [x] Create route-based editor loader that resolves the active file from the active file route.
- [x] Add `/home` route showing `AsciiBanner` when no specific home file is selected.
- [x] Add file routes for home/about/projects/contact.
- [x] Update NeoTree item IDs/active state to use route paths instead of `file` search param.
- [x] Update all navigation shortcuts to route paths, keeping `neotree` in search.
- [x] Update markdown link resolution so relative links navigate to the target file route.
- [x] Remove legacy `/editor?file=` usage once all links/actions are migrated.
- [x] Optionally keep `/editor` as a temporary redirect to `/home`.

## Verification

- Run `bun run typecheck`.
- Run `bun run lint`.
- Run `bun run test`.
- Run `bun run build`.
- Manually verify:
  - `/` still shows intro.
  - `/home` shows the ASCII banner.
  - `/home/readme`, `/about/values`, `/projects/atlas`, `/contact/links` render the right files.
  - NeoTree highlights and expands the current route.
  - `?neotree=open|closed` still works on all file routes.
  - Markdown links between project files work.
  - Back/forward navigation works naturally between files.
