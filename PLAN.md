# Plan: Replace App Header With Status-Bar Style

## Context
- The current project uses `src/layout/AppHeader.tsx` as the top header in `src/terminal/TerminalLayout.tsx`.
- The reference project at `../../code/portfolio/` has a chevron-segment `StatusBar` in `src/status-bar.tsx`.
- Desired layout for this project: left side = navigation; right side = language switcher, theme controls, clock.

## Approach
- Keep the existing `AppHeader` entry point so `TerminalLayout` does not need to change.
- Recreate the reference status-bar segmented/chevron style inside this project’s header, adapted to this project’s existing navigation, clock, locale, and theme components.
- Remove current header-only decorative items (`Folder` icon and `LET'S BUILD` CTA) from the rendered header.
- Add status-bar color tokens to the current Tailwind theme variables, mapped from the project’s existing theme colors so light/dark continue to work.

## Files to modify
- `src/layout/AppHeader.tsx`
- `src/layout/AppHeaderNavigation.tsx`
- `src/styles.css`

## Reuse
- Reuse reference implementation patterns from `../../code/portfolio/src/status-bar.tsx`:
  - `StatusGroup`, `StatusSegment`, `Chevron` structure
  - `bg-status`, `bg-status-primary`, `bg-status-muted`, corresponding foreground/fill classes
  - left/right overlap with negative margins for chevron stacking
- Reuse existing project utilities/components:
  - `cn` from `src/design-system/cn.ts`
  - `AppHeaderNavigation` from `src/layout/AppHeaderNavigation.tsx`
  - `AppHeaderTime` from `src/layout/AppHeaderTime.tsx`
  - `setLocale` from `src/paraglide/runtime`
  - `ThemeToggle` from `src/theme/ThemeToggle.tsx`

## Steps
- [ ] Refactor `AppHeader.tsx` to render a status-bar-style header with two `StatusGroup`s.
- [ ] Define local `StatusItem`, `StatusGroup`, `StatusSegment`, and `Chevron` helpers in `AppHeader.tsx` or extract to a small layout helper if the file becomes too large.
- [ ] Configure left items to contain one navigation segment using `AppHeaderNavigation`.
- [ ] Configure right items in order from left to right: language buttons (`FR | EN` using `setLocale`), theme (`ThemeToggle`), clock (`AppHeaderTime`).
- [ ] Update `AppHeaderNavigation.tsx` link classes so navigation fits inside a status segment and active/hover states work on the segmented background.
- [ ] Add `--status`, `--status-primary`, `--status-primary-foreground`, `--status-muted`, and `--status-muted-foreground` CSS variables to `:root` and `.dark` in `src/styles.css`.
- [ ] Expose those variables in `@theme inline` as Tailwind colors: `--color-status`, `--color-status-primary`, `--color-status-primary-foreground`, `--color-status-muted`, `--color-status-muted-foreground`.

## Verification
- [ ] Run `bun run typecheck`.
- [ ] Run `bun run lint` or `bun run check`.
- [ ] Start the dev server and manually verify:
  - header has the reference status-bar chevron style
  - left side contains navigation only
  - right side order is language, theme, clock
  - route navigation active state still works
  - language buttons still switch locale
  - theme toggle still switches light/dark/system
  - layout behaves acceptably on narrow screens
