# Refactor Execution Plan

Operational checklist for `REFACTOR.md`.

Use `REFACTOR.md` for rationale. Use this file to execute safely.

## Rules

- One phase at a time.
- One phase should be one commit.
- No behavior changes during move-only phases.
- Do not rename and rewrite in the same step.
- No barrel files.
- Aggregation files are allowed only when they create a concrete runtime object, registry, or config used by the app.
- Run validation after each phase before continuing.

## Validation

```sh
bun run check
bun run typecheck
bun run test
bun run build
```

If a phase touches only docs, validation can be skipped or limited.

## Phase 0 — Safety tests

Goal: protect current URL/search/file behavior before moving code.

- [x] Add tests for `src/terminal/terminal-search.ts`.
- [x] Add tests for `src/terminal/terminal-routes.ts`.
- [x] Add tests for `src/editor/editor-files.ts`.
- [x] Cover invalid search normalization.
- [x] Cover `files` query dedupe and unknown-file removal.
- [x] Cover active-file fallback to first open file.
- [x] Cover terminal route parsing for current behavior.
- [x] Cover file resolver priority: current folder, root, global.
- [x] Run validation.
- [ ] Commit.

## Phase 1 — Import cleanup

Goal: make vertical boundaries visible before moving files.

- [x] Replace cross-vertical parent-relative imports with `#/...`.
- [x] Keep `./...` imports for same-folder files.
- [x] Do not move files in this phase.
- [x] Run validation.
- [ ] Commit.

## Phase 2 — Portfolio vertical base

Goal: remove `src/pages` without changing behavior.

- [x] Create `src/portfolio`.
- [x] Move `src/pages/work.data.tsx` to `src/portfolio/work/work.data.tsx`.
- [x] Move `src/pages/About.tsx` to `src/portfolio/about/AboutSection.tsx`.
- [x] Move `src/pages/Contact.tsx` to `src/portfolio/contact/ContactSection.tsx`.
- [x] Move `src/pages/Work.tsx` to `src/portfolio/work/WorkSection.tsx`.
- [x] Move `src/pages/WorkDetail.tsx` to `src/portfolio/work/WorkDetailSection.tsx`.
- [x] Fix route imports.
- [x] Keep component behavior unchanged.
- [x] Remove `src/pages` once empty.
- [x] Run validation.
- [ ] Commit.

## Phase 3 — Portfolio-owned editor files

Goal: put file definitions next to owning sections while keeping editor mechanics in editor.

- [x] Create `src/editor/editor-files.types.ts`.
- [x] Move editor file types from `editor-files.ts` to `editor-files.types.ts`.
- [x] Create `src/portfolio/root.files.ts`.
- [x] Create `src/portfolio/about/about.files.ts`.
- [x] Create `src/portfolio/work/work.files.tsx`.
- [x] Create `src/portfolio/contact/contact.files.ts`.
- [x] Move matching file definitions out of `src/editor/editor-files.content.ts`.
- [x] Create `src/editor/editor-file-registry.ts`.
- [x] Ensure `editor-file-registry.ts` creates a concrete runtime registry; no re-export-only barrel.
- [x] Keep resolver behavior unchanged.
- [x] Run validation.
- [ ] Commit.

## Phase 4 — SourceLinks extraction

Goal: remove duplicated portfolio-specific source link UI.

- [x] Create `src/portfolio/SourceLinks.tsx`.
- [x] Replace duplicated `SourceLinks` in about/contact/work/detail sections.
- [x] Keep search-param behavior unchanged (added optional `to` prop for work variant).
- [x] Run validation.
- [ ] Commit.

## Phase 5 — Portfolio section metadata

Goal: move portfolio metadata out of terminal ownership.

- [x] Move `src/terminal/section-metadata.ts` to `src/portfolio/portfolio-sections.ts`.
- [x] Fix imports.
- [x] Optional: rename symbols only if small and mechanical.
- [x] Run validation.
- [ ] Commit.

## Phase 6 — Command output ownership

Goal: split terminal output mechanics from portfolio content.

- [ ] Split `src/terminal/terminal-command-outputs.tsx`.
- [ ] Keep shell/manual/list outputs in terminal.
- [ ] Move profile/contact/status outputs to portfolio.
- [ ] Keep dispatch behavior unchanged.
- [ ] Run validation.
- [ ] Commit.

## Phase 7 — Availability status ownership

Goal: move business status out of terminal.

- [ ] Move `src/terminal/AvailabilityStatus.tsx` to `src/portfolio/AvailabilityStatus.tsx`.
- [ ] Fix footer import.
- [ ] Keep rendered UI unchanged.
- [ ] Run validation.
- [ ] Commit.

## Phase 8 — Scramble animation consolidation

Goal: centralize scramble effect and add stagger support.

- [ ] Create `src/design-system/useScrambleText.ts`.
- [ ] Create `src/design-system/ScrambleText.tsx`.
- [ ] Support string-only text.
- [ ] Support `by="char"` and `staggerMs`.
- [ ] Add reduced-motion guard.
- [ ] Replace `ScrambleTitle` usage.
- [ ] Replace direct scramble setup in `TerminalSessionHeader` if hook/component fits.
- [ ] Replace direct scramble setup in `AvailabilityStatus` if hook/component fits.
- [ ] Replace direct scramble setup in `TerminalFooter` if hook/component fits.
- [ ] Remove old `ScrambleTitle.tsx` if unused.
- [ ] Run validation.
- [ ] Commit.

## Phase 9 — Terminal path helper

Goal: remove duplicated terminal path string manipulation.

- [ ] Create `src/terminal/terminal-path.ts`.
- [ ] Add `formatTerminalCwd(pathname: string)`.
- [ ] Add `getTerminalFolder(pathname: string)`.
- [ ] Replace duplicated `route.replace("/terminal/", "")` usage.
- [ ] Add/extend tests.
- [ ] Run validation.
- [ ] Commit.

## Phase 10 — Clipboard handling

Goal: stop claiming clipboard success when copy fails.

- [ ] Create `src/terminal/clipboard.ts` or a design-system helper if reused elsewhere.
- [ ] Return success/failure result from copy attempts.
- [ ] Update `email` command output.
- [ ] Update `github` command output.
- [ ] Keep copied value visible even on failure.
- [ ] Run validation.
- [ ] Commit.

## Phase 11 — Dialog close cleanup

Goal: avoid double close side effects.

- [ ] Remove `onClick={onClose}` from `DialogClose` in `MusicDialog`.
- [ ] Let `Dialog` root `onOpenChange` own close propagation.
- [ ] Verify URL/search state updates once.
- [ ] Run validation.
- [ ] Commit.

## Phase 12 — Command metadata sync

Goal: avoid stale help/manual command text.

- [ ] Create one command metadata source for names/descriptions/manuals.
- [ ] Derive help output from metadata.
- [ ] Keep dispatch pipeline unless command behavior gets much more complex.
- [ ] Run validation.
- [ ] Commit.

## Phase 13 — Controller/history cleanup

Goal: centralize command history and reduce controller responsibilities.

- [ ] Create or expand `src/terminal/useCommandHistory.ts`.
- [ ] Move visible terminal history logic there.
- [ ] Move prompt history navigation there if practical.
- [ ] Create `src/terminal/useTerminalSearchActions.ts`.
- [ ] Move editor/dialog/panel URL-state actions there.
- [ ] Keep `useTerminalController.tsx` as composition layer.
- [ ] Run validation.
- [ ] Commit.

## Phase 14 — Small polish fixes

Goal: low-risk cleanup after structural work.

- [ ] Improve `defaultNotFoundComponent`.
- [ ] Consider stricter editor-file validation for highlight server function.
- [ ] Add a short note that `src/paraglide/*` is generated.
- [ ] Review `/` splash fallback link or timeout.
- [ ] Pin `latest` TanStack dependencies.
- [ ] Check Vite plugin order only if build/server behavior is weird.
- [ ] Run validation.
- [ ] Commit.

## Done checklist

- [ ] `src/pages` no longer exists.
- [ ] Portfolio content lives under `src/portfolio`.
- [ ] Portfolio editor files live next to their owning sections.
- [ ] `editor-file-registry.ts` creates a concrete runtime registry and is not a barrel.
- [ ] Terminal owns shell behavior, not personal content.
- [ ] Repeated `SourceLinks` implementation exists once.
- [ ] Scramble text behavior is centralized.
- [ ] Terminal path formatting lives in one helper.
- [ ] Clipboard commands report success/failure honestly.
- [ ] Dialog close actions fire once.
- [ ] Command help/manual output stays in sync with command metadata.
- [ ] Pure-function tests cover search params, route parsing, and file resolution.
- [ ] Cross-vertical imports use `#/...` instead of parent-relative paths.
- [ ] `bun run check` passes.
- [ ] `bun run typecheck` passes.
- [ ] `bun run test` passes.
- [ ] `bun run build` passes.
