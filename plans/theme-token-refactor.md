# Theme Token Refactor Plan

## Context

The current theme color tokens are concentrated in `src/styles.css` and appear to mix generic UI tokens (`--primary`, `--accent`, `--muted`), feature-specific aliases (`--status-*`, `--ascii-banner-*`), and ambiguous semantic tokens like `--highlight`. This makes it hard to know which token to reuse when adding color-dependent features.

Initial findings:
- Tailwind v4 is used via `@import "tailwindcss"`, `@theme inline`, and CSS custom properties in `src/styles.css`.
- `src/styles.css` defines root/dark default tokens, duplicate `original-*` tokens, and 10 additional named theme blocks (`catppuccin-*`, `nord-*`, `github-light`, `tokyo-night`, `ayu-*`, `sage-*`).
- `--highlight` is consumed as `text-highlight` in `src/editor/ReadOnlyFileEditor.tsx` for empty-editor command shortcut text, so its current meaning is not purely “text selection/highlight”.
- Most named themes set `--highlight: var(--editor-cursor)`, confirming the confusing coupling between shortcut/accent text and editor cursor color.
- Named themes define editor-specific tokens (`--editor`, `--editor-foreground`, `--editor-line`, `--editor-selection`, `--editor-cursor`) that are exported through `@theme inline`, but default root/dark and `original-*` themes currently do not define the full editor token set.
- `--status-foreground` is defined in named themes and exported as `--color-status-foreground`, but root/dark and `original-*` only define `--status`, `--status-primary`, `--status-primary-foreground`, `--status-muted`, and `--status-muted-foreground`.
- Status bar utilities are reused by `src/editor/ReadOnlyFileEditor.tsx`, `src/layout/AppHeader.tsx`, and `src/layout/AppHeaderNavigation.tsx`.
- Shiki code highlighting is handled in `src/editor/editor-file-highlight.server.ts` with light/dark GitHub Shiki themes and `defaultColor: false`; CSS selectors in `src/styles.css` switch Shiki variables based on `.dark`, independent of named theme palettes.
- Theme IDs and labels are centralized in `src/theme/themeTypes.ts`.

## Approach

Refactor the token system around clearer semantic layers, with permission to adjust colors where current token reuse produces confusing visuals:
1. Keep standard app/UI tokens compatible with Tailwind/shadcn-style usage (`background`, `foreground`, `card`, `primary`, etc.).
2. Treat editor, status bar, ASCII banner, and portfolio availability dots as feature token groups with explicit meanings.
3. Replace ambiguous `--highlight` with a purpose-specific token for the current usage, e.g. `--command-shortcut` / `--color-command-shortcut`, and update `text-highlight` usage to the new utility.
4. Stop using `--editor-cursor` as a generic highlight/accent. Keep it only for cursor/editor visuals.
5. Normalize token coverage across `:root`, `.dark`, `original-*`, and all named themes so every exported token has a value in every theme path.
6. Keep Shiki syntax highlighting as-is for this pass; only preserve the surrounding editor theme tokens and CSS selectors.
7. Add concise documentation comments in `src/styles.css` explaining token categories and when to add feature-specific tokens.

## Files to modify

Likely:
- `src/styles.css`
- `src/editor/ReadOnlyFileEditor.tsx`

Potentially, if token names are consolidated or status token docs/types are added:
- `src/layout/AppHeader.tsx`
- `src/layout/AppHeaderNavigation.tsx`
- `src/portfolio/AvailabilityStatus.tsx`
- `src/ascii-banner/bannerConfig.ts`
- `src/theme/themeTypes.ts`

## Reuse

Existing utilities/patterns to reuse:
- Tailwind v4 utility generation from `@theme inline` in `src/styles.css` (`text-*`, `bg-*`, `border-*`, `fill-*`).
- Existing feature groups as the pattern for explicit tokens: `--editor-*`, `--status-*`, and `--ascii-banner-*`.
- Theme application via `document.documentElement.dataset.theme` and `.dark` in `src/theme/ThemeProvider.tsx`.
- Theme ID lists in `src/theme/themeTypes.ts` as the source of truth for which `data-theme` blocks must be covered.
- Existing verification scripts in `package.json`: `bun run check`, `bun run typecheck`, `bun run build`, `bun run test`.

## Steps

- [x] Create and switch to branch `refactor/theme-color-tokens`.
- [x] Inventory all color tokens declared in `src/styles.css`, grouped by core UI, editor, status bar, ASCII banner, portfolio availability, chart/sidebar, and unused/ambiguous.
- [x] Confirm every theme ID from `src/theme/themeTypes.ts` has complete token coverage in `src/styles.css`.
- [x] Define the token taxonomy in comments near the theme declarations: core UI tokens, feature tokens, and Tailwind export tokens.
- [x] Add missing `--editor-*` and `--status-foreground` values for `:root`, `.dark`, `original-light`, and `original-dark` so exported tokens never rely on undefined variables.
- [x] Replace `--highlight` with a purpose-specific command shortcut/accent text token and export it in `@theme inline`.
- [x] Update `src/editor/ReadOnlyFileEditor.tsx` from `text-highlight` to the new command shortcut text utility.
- [x] For named themes, choose command shortcut colors intentionally; do not automatically alias them to `--editor-cursor` unless it is visually the right color for that theme.
- [x] Keep `--editor-cursor` scoped to editor/cursor semantics and keep `--editor-selection` for actual selection/highlight surfaces.
- [x] Decide whether unused `--status-foreground` should be used by status containers or removed from export; keep only if it has a clear purpose.
- [x] Keep portfolio availability colors as explicit semantic tokens, but consider moving their raw OKLCH values out of `@theme inline` into normal custom properties if they need per-theme customization later.
- [x] Remove `--color-highlight` export after all `text-highlight`/`--highlight` usages are gone.

## Verification

- [x] Run `bun run check`.
- [x] Run `bun run typecheck`.
- [x] Run `bun run build`.
- [x] Manually inspect theme switching and the terminal/editor UI in light, dark, and named themes.
- [x] Confirm code highlighting, empty-editor command shortcut colors, status bar/header segments, ASCII banner, availability dots, and editor cursor/selection visuals remain intentional.
- [x] Search for removed tokens: `grep -R "highlight\|--highlight\|text-highlight" src` should show no stale usage, except documentation if intentionally retained.

## Decisions

- Colors may be adjusted where current token reuse is visually confusing.
- Backward-compatible aliases for ambiguous tokens are not needed unless implementation reveals a risky migration path; prefer removing `--highlight` once usage is migrated.

## Branch

Requested branch name: `refactor/theme-color-tokens`.

Planning note: current branch is `main`. No branch has been created during planning mode because the planning phase is limited to markdown-only changes. `git status --short` also shows a pre-existing `D PLAN.md`; avoid overwriting/removing it during implementation unless intentionally cleaning old plans.
