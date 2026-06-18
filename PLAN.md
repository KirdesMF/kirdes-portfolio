# Plan: Remove Shiki and convert editor files to plain TSX pages

## Context
- The current file editor uses Shiki tokenization through `src/editor/editor-file-highlight.server.ts` and `src/editor/editor-file-highlight.fn.tsx`.
- Workspace routes load highlighted tokens with `getFileTokens` and render `RouteFileEditor`/`CodeFileEditor`/`MarkdownFileViewer`.
- `src/styles.css` has both `.markdown-file-viewer` styles and a `/* Shiki editor-code */` section with token/cursor/line styles.
- Browser content is currently split between `src/browser/*.files.ts` virtual file data and `src/browser/*/*-section.tsx` source files imported as raw strings by `src/workspace/workspace-catalogue.ts`.
- The goal is to remove Shiki entirely, stop treating visible files as highlighted code/markdown documents, and make the editor area render plain TSX page components with placeholder content for now.
- `src/ide/neo-tree.tsx` should keep the same tree structure, but route/content files should be named `.md` even though opening them renders real TSX pages.
- `README.md` and `ROADMAP.md` stay as root `.md` files; `config.ts` should be removed from the visible workspace entirely.

## Approach
- Replace Shiki-backed editor rendering with a small plain React page wrapper and route-local placeholder page components.
- Keep route navigation, workspace tabs, terminal catalogue lookup, and NeoTree behavior, but change route/content virtual file metadata/display names to `.md` and remove the `/config` file entry.
- Remove Shiki-specific token types, server functions, token styling, markdown parser/viewer, markdown link helpers, and dependency entries.
- Collapse/clean `src/browser/` and `src/editor/` so they no longer contain duplicated source-as-string content or syntax-highlighted editor infrastructure.

## Files to modify
- `package.json`
- `bun.lock`
- `src/styles.css`
- `src/ide/neo-tree.tsx`
- `src/editor/*`
- `src/browser/*`
- `src/workspace/workspace-catalogue.ts`
- `src/routes/_app/_workspace/*.tsx` including removal of `config.tsx`
- `src/routes/_app/_workspace/**/index.tsx`
- `src/routes/_app/_workspace/projects/*.tsx`

## Reuse
- Reuse `src/ide/neo-tree.tsx` tree/navigation structure and only change file names/lookups as needed.
- Reuse `src/editor/editor-files.ts` route lookup helpers and adapt their file IDs/routes to `.md` display names.
- Reuse `src/routes/_app/_workspace.tsx` tab-opening flow; it already maps the current route back to `findEditorFileByRoute`.
- Reuse the existing TanStack routes under `src/routes/_app/_workspace/` as the place to render the new plain TSX placeholder pages.
- Reuse non-Shiki editor shell UI from `src/editor/read-only-file-editor.tsx` if a status/tabs wrapper is still needed.

## Steps
- [ ] Remove the `shiki` dependency from `package.json` and regenerate/update `bun.lock` during implementation.
- [ ] Delete or replace Shiki-specific files: `editor-file-highlight.server.ts`, `editor-file-highlight.fn.tsx`, `editor-file-tokens.ts`, and the token-based `code-file-editor.tsx` path.
- [ ] Replace route loaders that call `getFileTokens` with direct TSX route components rendering placeholder page content.
- [ ] Update `RouteFileEditor` or replace it with a simpler TSX page wrapper that no longer expects highlighted tokens.
- [ ] Update `src/browser/*.files.ts` catalogues (or move them out of `browser/`) so route/content files such as about/contact/projects index are `.md` while routes continue to open the corresponding real pages.
- [ ] Remove the root `config.ts` entry from `src/browser/root.files.ts`, `fileRoutesById`, NeoTree root files, terminal-visible files, and related tests/references.
- [ ] Remove the `/config` workspace route file (`src/routes/_app/_workspace/config.tsx`) and rely on route generation to drop it.
- [ ] Remove `workspaceSourceFiles` and raw `?raw` imports from `src/workspace/workspace-catalogue.ts` unless another feature still needs source-file search entries.
- [ ] Keep `src/ide/neo-tree.tsx` structurally the same, but change explicit filenames such as `about.tsx`, `contact.tsx`, and `index.tsx` to their new `.md` display names/IDs.
- [ ] Update terminal/search tests or outputs that mention `src/browser/`, `.tsx` virtual source files, or syntax-highlighted markdown.
- [ ] Clear Shiki/editor-code and markdown-viewer CSS from `src/styles.css`; keep only styles still used by the new editor/page shell.
- [ ] Clean unused browser/editor files and imports after the new TSX page path is in place.
- [ ] Run typecheck/tests/lint and fix references to removed Shiki/editor modules.

## Verification
- Run `bun run typecheck`.
- Run `bun run test`.
- Run `bun run lint` or `bun run check`.
- Manually open the app, navigate files through NeoTree, and confirm route/content files are named `.md`, `README.md`/`ROADMAP.md` remain, `config.ts` is gone, and each opened file renders a TSX placeholder page.
- Search for `shiki`, `getFileTokens`, `FileTokenLine`, and `editor-code` to confirm Shiki/token rendering is gone.
