# Refactor Plan

Goal: reduce indirection, keep domains vertical, avoid generic AI-slop abstractions.

Core rule: code that changes together lives together.

## Current read

Main domains in this repo:

```txt
src/
  terminal/       terminal shell UX: commands, prompt, history, panes, URL state
  portfolio/      actual portfolio content: about, work, contact, section metadata
  editor/         read-only file/code viewer domain
  music/          music dialog/player domain
  games/tetris/   tetris game domain
  design-system/  generic UI primitives only
  theme/          cross-cutting theme concern
  routes/         TanStack Start routing glue
```

`terminal` and `editor` are valid verticals here. They are not just technical categories; they own real product behavior.

## High-priority changes

### 1. Remove `src/pages`

`src/pages` is not required by TanStack Start. Routing lives in `src/routes`.

Current shape:

```txt
src/routes/terminal/about/route.tsx  -> src/pages/About.tsx
src/routes/terminal/contact/route.tsx -> src/pages/Contact.tsx
src/routes/terminal/work/index.tsx   -> src/pages/Work.tsx
src/routes/terminal/work/$project/route.tsx -> src/pages/WorkDetail.tsx
```

Recommended shape:

```txt
src/portfolio/
  about/AboutSection.tsx
  contact/ContactSection.tsx
  work/WorkSection.tsx
  work/WorkDetailSection.tsx
  work/work.data.tsx
```

Routes stay thin framework glue:

```txt
src/routes/terminal/about/route.tsx
src/routes/terminal/contact/route.tsx
src/routes/terminal/work/index.tsx
src/routes/terminal/work/$project/route.tsx
```

Rationale:

- `pages` is ambiguous and Next-ish.
- About/work/contact are portfolio content, not generic pages.
- `portfolio` vertical can be deleted or redesigned as one unit.

### 2. Move portfolio metadata out of `terminal`

Current:

```txt
src/terminal/section-metadata.ts
```

Recommended:

```txt
src/portfolio/portfolio-sections.ts
```

Rationale:

- Section metadata describes portfolio sections, renderers, folders, content files.
- Terminal may consume this data, but should not own it.

Suggested rename:

```ts
SectionMetadata -> PortfolioSection
sectionMetadata -> portfolioSectionsByRoute
getSectionByRoute -> getPortfolioSectionByRoute
getSectionByFolder -> getPortfolioSectionByFolder
getSectionByLabel -> getPortfolioSectionByLabel
```

### 3. Extract duplicated `SourceLinks`

Currently duplicated in multiple files:

```txt
src/pages/About.tsx
src/pages/Contact.tsx
src/pages/Work.tsx
src/pages/WorkDetail.tsx
```

Recommended:

```txt
src/portfolio/SourceLinks.tsx
```

Rationale:

- Same UI and URL-state logic repeated.
- This is portfolio-specific, not design-system.
- Extracting this is real simplification.

Do not put this in `design-system`; it knows about editor files and portfolio sections.

### 4. Split `terminal-command-outputs.tsx`

Current:

```txt
src/terminal/terminal-command-outputs.tsx
```

It mixes:

- generic terminal output UI
- command manual pages
- portfolio/person-specific output
- source-list output
- fake git-ish content

Recommended split:

```txt
src/terminal/commands/manual-pages.ts
src/terminal/commands/terminal-outputs.tsx
src/portfolio/portfolio-command-outputs.tsx
```

Keep in `terminal`:

- `HelpOutput`
- `WelcomeOutput`
- `LsOutput`
- command manual data
- command-not-found style output

Move to `portfolio`:

- `WhoamiOutput`
- `StatusOutput`
- contact/profile-oriented output
- anything that changes when personal positioning changes

Rationale:

- Terminal shell should own shell mechanics.
- Portfolio should own portfolio content.

### 5. Split `useTerminalController`

Current:

```txt
src/terminal/useTerminalController.tsx
```

It owns too much:

- command history
- router navigation
- editor file URL state
- dialog URL state
- mobile panel URL state
- command dispatch context

Recommended:

```txt
src/terminal/useCommandHistory.ts
src/terminal/useTerminalSearchActions.ts
src/terminal/useTerminalController.tsx
```

Responsibilities:

```txt
useCommandHistory.ts
  create/push/clear history
  commandHistoryRef

useTerminalSearchActions.ts
  openFile
  closeFile
  openEditor
  closeEditor
  selectFile
  setMobilePanel
  toggleMaximize
  openDialog
  closeDialog

useTerminalController.tsx
  compose hooks
  build CommandContext
  call dispatch(ctx)
```

Rationale:

- URL-state update logic is repeated and easy to break.
- Controller becomes readable.
- Command behavior remains terminal-owned.

## Medium-priority changes

### 6. Reassess `src/layout`

Current:

```txt
src/layout/AppHeader.tsx
src/layout/AppHeaderNavigation.tsx
src/layout/AppHeaderTime.tsx
```

If header is only for terminal shell, move it to:

```txt
src/terminal/AppHeader.tsx
src/terminal/AppHeaderNavigation.tsx
src/terminal/AppHeaderTime.tsx
```

If reused by tetris or future non-terminal routes, keep `layout` or rename to `app-shell`.

Decision rule:

- terminal-only chrome -> `src/terminal`
- app-wide chrome -> `src/app-shell`
- generic UI primitive -> `src/design-system`

### 7. Separate editor mechanics from portfolio file ownership

Current large file:

```txt
src/editor/editor-files.content.ts
```

It contains portfolio-facing content, source snapshots, and editor file definitions. This mixes ownership.

Editor should own mechanics:

- file input/entry types
- building IDs
- resolving files
- listing visible files
- editor UI
- syntax highlighting

Portfolio sections should own their files/content:

```txt
src/portfolio/root.files.ts
src/portfolio/about/about.files.ts
src/portfolio/work/work.files.tsx
src/portfolio/contact/contact.files.ts
```

Editor can compose those files into a registry:

```txt
src/editor/editor-files.types.ts
src/editor/editor-file-registry.ts
src/editor/editor-files.ts
```

Suggested responsibilities:

```txt
editor-files.types.ts
  EditorFileInput
  EditorFileEntry
  FolderRoute

editor-file-registry.ts
  imports concrete section file arrays
  builds the actual app editor file registry
  exports editorFileInputs / folderRoutes

editor-files.ts
  buildEntry
  findEditorFile
  isEditorFileName
  resolveFile
  lsFiles
  getVisibleFileNames
```

Important: `editor-file-registry.ts` is allowed only if it creates a concrete runtime registry. It must not become a barrel file.

Allowed aggregation:

```ts
import { aboutFiles } from "#/portfolio/about/about.files";
import { contactFiles } from "#/portfolio/contact/contact.files";
import { workFiles } from "#/portfolio/work/work.files";
import type { EditorFileInput } from "#/editor/editor-files.types";

export const editorFileInputs = [
  ...aboutFiles,
  ...workFiles,
  ...contactFiles,
] satisfies ReadonlyArray<EditorFileInput>;
```

Not allowed:

```ts
export { aboutFiles } from "#/portfolio/about/about.files";
export { workFiles } from "#/portfolio/work/work.files";
```

Rationale:

- About files change with about section.
- Work files change with work section.
- Contact files change with contact section.
- Editor remains responsible for editor behavior, not portfolio content authoring.

Caution: do this when touching editor/content next. Avoid large content moves without tests around file resolution.

### 8. Consolidate scramble text animation

Current scramble behavior is duplicated in several files:

```txt
src/design-system/ScrambleTitle.tsx
src/terminal/TerminalSessionHeader.tsx
src/terminal/AvailabilityStatus.tsx
src/terminal/TerminalFooter.tsx
src/routes/index.tsx
```

`TerminalSessionHeader` does not use `ScrambleTitle`; it directly calls `animate(... scrambleText(...))` with `stagger(75)`.

Current `ScrambleTitle` issues:

- It is used only in `src/pages/Work.tsx`.
- Name is too narrow; it animates text, not only titles.
- It accepts `ReactNode`, but implementation mutates `innerHTML`; this should be string-only unless intentionally supporting markup.
- It has no reduced-motion guard.
- It cannot animate characters with stagger.
- It does not rerun when text changes.

Recommended direction:

```txt
src/design-system/ScrambleText.tsx
src/design-system/useScrambleText.ts
```

Keep this in `design-system` because the effect is intended for route/page content too, not only the terminal shell. Keep API generic; terminal-specific defaults can still live near terminal usage if needed.

Suggested component API:

```tsx
<ScrambleText text={entry.name} />
<ScrambleText text={entry.name} by="char" staggerMs={35} />
```

Suggested props:

```ts
type ScrambleTextProps = {
  text: string;
  className?: string;
  cursor?: string;
  delayMs?: number;
  staggerMs?: number;
  by?: "element" | "char";
};
```

Use cases:

- Replace `ScrambleTitle` in work list.
- Use for project title in `WorkDetailSection` if visual consistency is desired.
- Replace direct repeated animation in `TerminalSessionHeader`, `AvailabilityStatus`, and `TerminalFooter` where a component fits.
- For grouped header/footer labels, prefer a hook or group component that animates `[data-scramble]` children with `stagger()`.

Do not overuse it. Scramble should highlight identity/interactive text, not every label.

### 9. Centralize command history

Current command history is split:

```txt
src/terminal/useTerminalController.tsx  terminal output history + `history` command data
src/terminal/TerminalPrompt.tsx        input history for ArrowUp / ArrowDown
```

This can diverge. A command can appear in prompt history but not in the `history` command output, or vice versa.

Recommended:

```txt
src/terminal/useCommandHistory.ts
```

Own:

- visible terminal entries
- executed command list
- prompt history navigation state
- `history` command data

`TerminalPrompt` should receive history/navigation behavior from terminal controller instead of keeping its own private command list.

Rationale:

- One source of truth for command history.
- Easier to test.
- Less hidden state in prompt component.

### 10. Add clipboard failure handling

Current clipboard writes are fire-and-forget:

```ts
navigator.clipboard.writeText("cedric@kirdes.dev");
```

Affected areas:

```txt
src/terminal/commands/builtins.tsx
src/terminal/terminal-command-outputs.tsx
```

Problems:

- Clipboard can fail outside secure context.
- Browser permission can deny writes.
- UI currently says copied even if copy failed.

Recommended:

```txt
src/terminal/clipboard.ts
```

or, if reused outside terminal:

```txt
src/design-system/clipboard.ts
```

Behavior:

- return success/failure result
- command output should say copied only after success
- fallback should still print value visibly

Example output:

```txt
cedric@kirdes.dev
copied to clipboard
```

or:

```txt
cedric@kirdes.dev
copy failed: browser denied clipboard access
```

### 11. Fix dialog double-close pattern

Current `MusicDialog` closes from two paths:

```tsx
<Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
...
<DialogClose onClick={onClose}>close</DialogClose>
```

`DialogClose` can trigger `onOpenChange(false)`, so `onClose` may run twice.

Recommended:

```tsx
<DialogClose className="...">close</DialogClose>
```

Let `Dialog` root own close propagation through `onOpenChange`.

Rationale:

- avoids duplicate navigation/search updates
- keeps dialog behavior centralized

### 12. Extract terminal path helpers

Terminal path formatting is duplicated with string replacements like:

```ts
route.replace("/terminal/", "")
```

Seen in:

```txt
src/terminal/TerminalPrompt.tsx
src/terminal/TerminalSessionHeader.tsx
src/terminal/commands/builtins.tsx
src/editor/editor-files.ts
```

Recommended:

```txt
src/terminal/terminal-path.ts
```

Functions:

```ts
formatTerminalCwd(pathname: string): string
getTerminalFolder(pathname: string): string
```

Rationale:

- Small shared domain helper.
- Avoid route formatting bugs when terminal routes change.
- Keeps terminal path semantics in terminal vertical.

### 13. Improve default 404

Current router default:

```tsx
defaultNotFoundComponent: () => <div>Not Found</div>
```

This does not match app identity.

Recommended:

- terminal-themed not-found output
- or route-pane 404 that says route/command not found
- keep it lightweight; no routing rewrite needed

### 14. Consider stricter editor-file validation

Current server function validates only non-empty string, then `highlightToHtml` checks `findEditorFile`.

This is safe because files are resolved from local in-memory entries, not filesystem paths. Still, validation could be clearer:

```ts
fileName -> isEditorFileName(fileName)
```

Do this only if it improves clarity without fighting Valibot typing.

### 15. Move `AvailabilityStatus` to portfolio ownership

Current:

```txt
src/terminal/AvailabilityStatus.tsx
```

It encodes portfolio/business status:

```ts
"open-to-work" | "open-to-offers" | "busy"
```

Recommended:

```txt
src/portfolio/AvailabilityStatus.tsx
```

Terminal footer can still render it, but portfolio owns the meaning.

Rationale:

- Availability changes with personal/professional positioning.
- Terminal shell should display status, not own status semantics.

### 16. Keep command help/manuals in sync with handlers

Current help output manually lists commands while handlers live elsewhere. Easy to desync.

Affected areas:

```txt
src/terminal/terminal-command-outputs.tsx
src/terminal/commands/builtins.tsx
src/terminal/commands/dispatch.ts
src/terminal/terminal-commands.ts
src/terminal/terminal-routes.ts
```

Recommended lightweight fix:

- keep one command metadata list for names/descriptions/manual text
- derive `help` output from metadata
- keep dispatch pipeline if it stays simple

Do not introduce class-based command objects unless command behavior grows significantly.

Rationale:

- Avoid stale help text.
- Keep command UX honest.

### 17. Add pure-function tests

Current tests are thin. Highest-value cheap tests are pure functions:

```txt
src/terminal/terminal-search.ts
src/terminal/terminal-routes.ts
src/editor/editor-files.ts
src/terminal/terminal-path.ts       after extraction
```

Test cases to cover:

- invalid search params normalize safely
- `files` query dedupes and drops unknown files
- active file falls back to first open file
- terminal route parsing accepts `/about`, `about`, `~`, `/`
- file resolver prefers current folder, then root, then global
- terminal cwd formatting is stable

Rationale:

- These functions protect URL state and command behavior.
- They are cheap to test and unlikely to require React testing utilities.

### 18. Note generated Paraglide files

Current generated files live in:

```txt
src/paraglide/
```

Keep them, but treat as generated code.

Recommended:

- do not manually edit `src/paraglide/*`
- keep refactors away from generated output
- if needed, add a short note in project docs or comments near i18n setup

### 19. Normalize cross-vertical imports

Prefer `#/...` imports for cross-vertical boundaries.

Current examples include parent-relative imports across domains:

```ts
import type { EditorFileName } from "../editor/editor-files";
```

Recommended:

```ts
import type { EditorFileName } from "#/editor/editor-files";
```

Keep `./...` imports for same-folder files.

Rationale:

- Makes vertical boundaries easier to see.
- Avoids fragile `../..` paths during moves.
- Matches project import convention.

### 20. Review `/` splash fallback

Current `/` route uses animation completion to navigate to `/terminal`.

This is fine for the portfolio aesthetic, but if animation or JS fails, user may get stuck.

Optional improvement:

- add visible fallback link to `/terminal`
- or add independent timeout fallback separate from animation completion

Do this only if reliability matters more than pure splash experience.

### 21. Pin `latest` dependencies

Current `package.json` uses `latest` for TanStack packages.

Recommended: pin exact or caret versions.

Rationale:

- Portfolio deploys should be reproducible.
- `latest` can break builds without code changes.

Packages to review:

```txt
@tanstack/react-devtools
@tanstack/react-router
@tanstack/react-router-devtools
@tanstack/react-start
@tanstack/devtools-vite
```

### 22. Check Vite plugin order if build weirdness appears

Current config has several plugins before `tanstackStart()`.

TanStack docs usually expect Start plugin before React. This project also has Paraglide, Cloudflare, Tailwind, RSC, and devtools, so plugin order may be intentional.

Action: do not churn blindly. If route generation, server functions, or RSC bundling act weird, inspect plugin order first.

## Suggested target tree

```txt
src/
  routes/
    __root.tsx
    index.tsx
    terminal/
      route.tsx
      about/route.tsx
      contact/route.tsx
      work/
        route.tsx
        index.tsx
        $project/route.tsx
    lab/
      tetris/route.tsx

  terminal/
    commands/
      builtins.tsx
      cat.tsx
      cd.ts
      close.ts
      dispatch.ts
      git.tsx
      man.tsx
      manual-pages.ts
      open.ts
      rm.ts
      route.ts
      source.tsx
      terminal-outputs.tsx
      types.ts
    AvailabilityStatus.tsx
    TerminalFooter.tsx
    TerminalLayout.tsx
    TerminalMobilePanels.tsx
    TerminalPane.tsx
    TerminalPrompt.tsx
    TerminalRouteList.tsx
    TerminalRoutePane.tsx
    TerminalSessionHeader.tsx
    terminal-commands.ts
    clipboard.ts
    terminal-history.tsx
    terminal-panel-types.ts
    terminal-path.ts
    terminal-routes.ts
    terminal-search.ts
    useCommandHistory.ts
    useTerminalController.tsx
    useTerminalSearchActions.ts

  portfolio/
    AvailabilityStatus.tsx
    SourceLinks.tsx
    portfolio-command-outputs.tsx
    portfolio-sections.ts
    about/
      AboutSection.tsx
    contact/
      ContactSection.tsx
    root.files.ts
    about/
      about.files.ts
      AboutSection.tsx
    contact/
      contact.files.ts
      ContactSection.tsx
    work/
      work.files.tsx
      WorkSection.tsx
      WorkDetailSection.tsx
      work.data.tsx

  editor/
    editor-file-highlight.fn.tsx
    editor-file-highlight.server.ts
    editor-file-registry.ts
    editor-files.types.ts
    editor-files.ts
    EditorPane.tsx
    ReadOnlyFileEditor.tsx

  games/
    tetris/
      board.ts
      grid.ts
      pieces.ts
      TetrisGame.tsx

  design-system/
    ScrambleText.tsx
    useScrambleText.ts
  dialogs/
  music/
  theme/
```

## Migration order

Do this incrementally. No big-bang rewrite.

1. Create `src/portfolio`.
2. Move `work.data.tsx` first. Fix imports.
3. Move portfolio-owned editor file definitions next to their sections (`about.files.ts`, `work.files.tsx`, `contact.files.ts`, `root.files.ts`).
4. Create `src/editor/editor-file-registry.ts` as a real runtime registry, not a barrel.
5. Move page components from `src/pages` to `src/portfolio/*`. Fix route imports.
6. Move `section-metadata.ts` to `src/portfolio/portfolio-sections.ts`. Fix imports.
7. Extract `SourceLinks`.
8. Split `terminal-command-outputs.tsx` only after tests/build pass.
9. Move `AvailabilityStatus` to portfolio ownership.
10. Consolidate scramble text animation (`ScrambleTitle`, `TerminalSessionHeader`, `AvailabilityStatus`, `TerminalFooter`).
11. Extract terminal path helpers.
12. Add clipboard failure handling.
13. Fix dialog double-close pattern.
14. Centralize command history.
15. Add pure-function tests for search/routes/file resolution.
16. Split `useTerminalController` last; this has highest regression risk.
17. Run checks after each step:

```sh
bun run check
bun run typecheck
bun run test
bun run build
```

## Boundary rules

Desired dependency direction:

```txt
routes -> terminal / portfolio / editor / games
terminal -> portfolio / editor / music / design-system
portfolio -> editor / design-system
editor -> design-system
music -> design-system
portfolio -> terminal   avoid, unless strictly URL helper; prefer moving shared helper
editor -> terminal      avoid
```

Important nuance: `terminal -> portfolio` is acceptable here because terminal commands expose portfolio content. But `portfolio -> terminal` should be minimized. If portfolio needs URL/search helpers, extract a small shared helper or pass callbacks/props.

## What not to do

- Do not create `src/components`, `src/hooks`, `src/utils`, or `src/types` catch-all folders.
- Do not move `SourceLinks` to `design-system`.
- Do not add barrel `index.ts` files.
- Do not add any file whose only job is re-exporting symbols.
- Aggregation files are allowed only when they create a concrete runtime object, registry, or config used by the app.
- Do not abstract every command into classes or registries unless command count grows a lot.
- Do not rewrite routing just to make the tree pretty.
- Do not split files only because they are over an arbitrary line count; split when ownership is mixed.

## Acceptance criteria

Refactor is successful if:

- `src/pages` no longer exists.
- Portfolio content lives under `src/portfolio`.
- Terminal owns shell behavior, not personal content.
- Repeated `SourceLinks` implementation exists once.
- Portfolio editor files live next to their owning sections.
- `editor-file-registry.ts` creates a concrete runtime registry and is not a barrel.
- Scramble text behavior is centralized; `TerminalSessionHeader` no longer duplicates raw `animate(... scrambleText(...))` setup.
- Terminal path formatting lives in one helper.
- Clipboard commands report success/failure honestly.
- Dialog close actions fire once.
- Availability status lives in portfolio ownership.
- Help/manual command output is derived from or kept in sync with command metadata.
- Pure-function tests cover search params, route parsing, and file resolution.
- Cross-vertical imports use `#/...` instead of parent-relative paths.
- URL search-state behavior remains unchanged.
- `bun run check`, `bun run typecheck`, `bun run test`, and `bun run build` pass.
