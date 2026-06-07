# File organization and naming plan

## Context

We need to reorganize the codebase around the three main product domains: terminal, browser, and editor. The current `src/` tree mixes domain code with older naming conventions:

- Many component files use PascalCase, for example `src/terminal/TerminalLayout.tsx`, `src/editor/EditorPane.tsx`, and the current browser content file `src/portfolio/home/HomeSection.tsx`.
- Several files use kebab suffixes instead of dotted suffixes, for example `src/terminal/terminal-panel-types.ts`.
- Existing non-domain/shared areas include `design-system`, `theme`, `layout`, `utils`, `workspace`, `routes`, `paraglide`, and generated `routeTree.gen.ts`.
- Browser-domain code currently lives in the old `src/portfolio/*` location plus `TerminalRoutePane` inside `src/terminal/`; the target is to remove the old portfolio folder and place that code directly under `src/browser/`.

## Naming convention

Use lowercase kebab-case for file and folder word separation, with dotted role suffixes:

- Component files: `terminal-layout.tsx`, `editor-pane.tsx`, `home-section.tsx`.
- Hook files: `use-terminal-controller.tsx`, `use-resizable-panels.ts`.
- Type modules: `terminal-panel.types.ts`, `editor-files.types.ts`.
- Test modules: `terminal-path.test.ts`, `drawer.test.tsx`.
- Server/function suffixes stay dotted: `editor-file-highlight.server.ts`, `editor-file-highlight.fn.tsx`.

React component and hook export names stay idiomatic TypeScript/React (`TerminalLayout`, `useTerminalController`); this plan only changes file/folder names and imports.

## Review findings

Current naming/organization issues found in `src/`:

- PascalCase component files exist across domains and shared code, especially `terminal/*`, `editor/*`, the current browser content files, `design-system/*`, `theme/*`, `layout/*`, and `ascii-banner/*`.
- CamelCase utility/hook files exist, for example `useTerminalController.tsx`, `themeBootScript.ts`, and `test-utils/matchMedia.ts`.
- The requested dotted type suffix is already used in `src/editor/editor-files.types.ts`, but `src/terminal/terminal-panel-types.ts` still uses the older `-types` pattern. `src/terminal/commands/types.ts` is generic and can be made more explicit as `command.types.ts`.
- Browser-domain code is split between the old content folder and `src/terminal/TerminalRoutePane.tsx`; the route pane is described in `CONTEXT.md` as the mini browser, so it should move into the browser domain.
- `src/ascii-banner/**` is only used by `ReadOnlyFileEditor.tsx`, so it should move under the editor domain unless we intentionally make it a shared design-system primitive later.

## Approach

Adopt a predictable naming convention and move domain-owned files into domain folders:

- `src/terminal/`: terminal shell, command system, terminal panel, terminal state/search/path/history utilities, terminal-specific tests.
- `src/browser/`: browser pane/window, browser-rendered page sections, browser source links, browser content file definitions, browser-specific tests. No `portfolio` folder remains in the target structure.
- `src/editor/`: read-only editor pane, editor file model/builders/highlighting, editor-specific tests.
- Keep shared infrastructure outside the three domains: `design-system`, `theme`, `layout`, `workspace`, `routes`, `utils`, `test-utils`, `paraglide`.

Use dotted role suffixes:

- `*.types.ts` for shared type modules.
- `*.test.ts` / `*.test.tsx` for tests.
- Existing suffixes like `.server.ts` and `.fn.tsx` can stay dotted.

Generated/framework-convention files should not be manually renamed:

- `src/routeTree.gen.ts` is generated and already excluded from Biome.
- TanStack route files such as `route.tsx`, `index.tsx`, `__root.tsx`, and `$project` directory names are framework conventions.
- `src/paraglide/*` is generated/localization output and should stay as generated.

## Files to modify

Critical move/rename groups:

- Browser domain:
  - Move `src/portfolio/**` to `src/browser/**`.
  - Move/rename `src/terminal/TerminalRoutePane.tsx` to `src/browser/browser-pane.tsx`.
  - Rename browser content files from PascalCase to kebab-case, e.g. `HomeSection.tsx` → `home-section.tsx`, `WorkDetailSection.tsx` → `work-detail-section.tsx`.
  - Keep existing browser subfolders (`home`, `about`, `work`, `contact`) because they align with current routes/content boundaries.
- Terminal domain:
  - Rename PascalCase terminal components/hooks to kebab-case, e.g. `TerminalLayout.tsx` → `terminal-layout.tsx`, `useTerminalController.tsx` → `use-terminal-controller.tsx`.
  - Rename `terminal-panel-types.ts` → `terminal-panel.types.ts`.
  - Rename `commands/types.ts` → `commands/command.types.ts` for a clearer dotted type module.
  - Keep already-kebab files such as `terminal-routes.ts`, `terminal-search.ts`, and `commands/builtins.tsx` unless they need only suffix cleanup.
- Editor domain:
  - Rename `EditorPane.tsx` → `editor-pane.tsx` and `ReadOnlyFileEditor.tsx` → `read-only-file-editor.tsx`.
  - Keep `editor-files.types.ts` because it already follows kebab-case + dotted suffix.
  - Move `src/ascii-banner/**` into `src/editor/ascii-banner/**` and rename its CamelCase files to kebab-case, because it is currently editor-only.
- Shared code:
  - Rename PascalCase/CamelCase design-system files, theme files, layout files, and `test-utils/matchMedia.ts` to kebab-case.
  - Use dotted type names in shared type modules where applicable, e.g. `themeTypes.ts` → `theme.types.ts` and `themeTypes.test.ts` → `theme.types.test.ts`.
  - Keep `workspace` shared; `workspace-catalogue.ts` is already kebab-case and can stay as-is.
- Imports/raw source references:
  - Update all `#/...` imports and raw `?raw` imports in `workspace-catalogue` after file moves.
  - Update route modules under `src/routes/terminal/**` to import browser components from the new browser paths.

## Reuse

Existing code to preserve and reuse while moving:

- `src/workspace/workspace-catalogue.ts` as the central catalogue tying browser views and editor files together.
- `src/editor/editor-files.ts` and editor highlight modules as the editor file model/source resolution layer.
- `src/terminal/terminal-search-transitions.ts` for opening/closing browser/editor panes through search params.
- `src/terminal/terminal-routes.ts` and terminal route tests for command/navigation behavior.
- Existing TanStack route files under `src/routes/terminal/**`; only their imports should change.
- Existing Biome and TypeScript scripts in `package.json` for verification.

## Steps

- [ ] Create a concrete rename/move inventory and apply moves in domain order: browser, editor, terminal, shared.
- [ ] Move browser-owned code from the old content folder and `TerminalRoutePane` into `src/browser`, leaving no `src/portfolio` folder in the target structure.
- [ ] Move editor-only ascii banner code into `src/editor/ascii-banner`.
- [ ] Rename terminal PascalCase/CamelCase files to kebab-case, change `terminal-panel-types.ts` to `terminal-panel.types.ts`, and change `commands/types.ts` to `commands/command.types.ts`.
- [ ] Rename editor PascalCase files to kebab-case while preserving existing `editor-files.types.ts` dotted suffix.
- [ ] Rename shared PascalCase/CamelCase files in `design-system`, `theme`, `layout`, and `test-utils` to kebab-case.
- [ ] Update all imports, route imports, raw `?raw` imports, and test imports.
- [ ] Run TanStack route generation if imports/route discovery require `src/routeTree.gen.ts` to refresh; do not manually edit the generated file.
- [ ] Run formatting, typecheck, tests, and build.

## Verification

- Run `bun run format` or `bun run check` after mass import/path updates.
- Run `bun run typecheck`.
- Run `bun run test`.
- Run `bun run build` if typecheck/tests pass.
- Manual smoke checks:
  - `/` and `/terminal/home` still render.
  - Terminal commands still work: `ls`, `cat`, `open`, route navigation commands.
  - Browser pane content still renders for home/about/work/contact/project detail.
  - Editor opens all catalogue files and source files.
  - Close/maximize behavior still works for browser and editor panes.
