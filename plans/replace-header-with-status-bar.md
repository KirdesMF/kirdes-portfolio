# Plan: Replace Header with Status-Bar Style

## Context

The current `AppHeader` (terminal-style with folder icon, breadcrumb nav, "LET'S BUILD" button) doesn't match the editor-status-bar aesthetic used in the sibling `portfolio` project. The goal is to replace it with a compact status-bar layout — left side navigation, right side clock + language toggle + theme toggle — using the same chevron-segment visual language as `portfolio/src/status-bar.tsx`.

## Approach

Create a new `AppStatusBar` component modeled after `portfolio/src/status-bar.tsx`, adapting its chevron-segment pattern to house the existing navigation and controls from `AppHeader`. The existing `AppHeaderNavigation`, `AppHeaderTime`, locale switcher, and `ThemeToggle` are all reusable — they just need to be re-housed in the new status-bar shell.

## Files to Modify

| File | Change |
|------|--------|
| `src/layout/AppStatusBar.tsx` | **New.** Status-bar shell with chevron segments, ported from `portfolio/src/status-bar.tsx` |
| `src/layout/AppHeader.tsx` | Replace content with `AppStatusBar` (or delete and rename references) |
| `src/terminal/TerminalLayout.tsx` | Update import from `AppHeader` to `AppStatusBar` |
| `src/styles.css` | Add `--color-status-*` CSS variables for light/dark themes |
| `src/theme/themeBootScript.ts` (or equivalent) | Wire status CSS variables into both theme variants |

## Reuse

- `AppHeaderNavigation` (`src/layout/AppHeaderNavigation.tsx`) — reuse as-is for left-side nav content
- `AppHeaderTime` (`src/layout/AppHeaderTime.tsx`) — reuse as-is for the clock slot
- `ThemeToggle` (`src/theme/ThemeToggle.tsx`) — reuse as-is for theme control
- Locale buttons (`FR`/`EN` in `AppHeader.tsx`) — reuse as-is for the lang slot
- `portfolio/src/status-bar.tsx` — reference implementation for the chevron-segment pattern
- `portfolio/src/styles.css` — reference for `--status-*` CSS variable values

## Steps

- [ ] **1. Add status CSS variables** — Define `--color-status`, `--color-status-foreground`, `--color-status-primary`, `--color-status-primary-foreground`, `--color-status-muted`, `--color-status-muted-foreground` in both theme variants in `src/styles.css`. Use the portfolio project's values as a starting point, tuned to kirdes-portfolio's existing color palette.
- [ ] **2. Create `AppStatusBar` component** — Port the chevron-segment pattern from `portfolio/src/status-bar.tsx`. Left group: `AppHeaderNavigation`. Right group: clock (`AppHeaderTime`), locale switcher (`FR`/`EN`), separator, `ThemeToggle`. Use Tailwind `bg-status` / `text-status-*` classes (or inline style with CSS vars).
- [ ] **3. Wire into layout** — Replace `<AppHeader />` with `<AppStatusBar />` in `src/terminal/TerminalLayout.tsx`. Either delete `AppHeader.tsx` or gut it to delegate to `AppStatusBar`.
- [ ] **4. Remove unused imports** — Clean up any imports no longer needed (e.g., `Folder`, `MoveRight`, `Separator` from the old header).

## Open Questions

1. Should the status-bar chevron background colors use the portfolio's exact oklch values, or should I derive them from the existing kirdes-portfolio theme variables to match the current palette?
2. Should I keep the "LET'S BUILD" button somewhere, or does the new status-bar replace it entirely?
3. Which side of the status-bar should the locale switcher go — right side between clock and theme, or somewhere else?
4. The current header is 40px (`h-10`). The portfolio status-bar uses `text-sm` with no explicit height. Should I match the current header height or let it be content-defined?
