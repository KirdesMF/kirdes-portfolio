# Theme Settings Plan

## Context

- Current app has `src/layout/AppHeader.tsx` with right-side language buttons, `ThemeToggle`, and clock segments.
- Requested change: replace the theme toggle segment with a settings icon that opens a dialog.
- Dialog should include IDE theme selection plus light/dark/auto mode. Language controls remain in `AppHeader` and are not included in the dialog.
- Current theme system stores a single `theme` cookie (`light | dark | system`), applies `.light/.dark` classes, and sets `data-theme` to the preference.
- Portfolio project has the desired multi-theme model: separate appearance mode and IDE theme cookies, `data-theme` set to concrete IDE theme ids, and CSS blocks keyed by `[data-theme="..."]`.

## Approach

- Adapt the portfolio theme architecture into the current app while preserving the current app's structure and naming conventions.
- Replace the single current `ThemePreference` with an appearance settings model:
  - mode: `light | dark | system` (UI label can say “Auto” for system)
  - light IDE theme: one of the portfolio light theme ids
  - dark IDE theme: one of the portfolio dark theme ids
- Continue applying `.light` / `.dark` classes for current Tailwind `dark:` behavior and Shiki editor styles, while also setting `data-theme` to the resolved concrete IDE theme (for example `github-light` or `tokyo-night`).
- Add a header-controlled settings dialog based on the portfolio `SettingsDialog`, but remove the language section.
- Copy/adapt the portfolio CSS `[data-theme="..."]` token blocks into current `src/styles.css`, keeping current app-only tokens/utilities such as Tetris variables, `--spacing-status-bar`, CRT overlay, and Shiki editor styles.

## Files to modify

- `src/layout/AppHeader.tsx` — add settings state, replace `ThemeToggle` segment with settings icon trigger, render dialog.
- `src/settings-dialog.tsx` (new) — appearance mode + IDE theme dialog, adapted from `../../code/portfolio/src/settings-dialog.tsx` with no language controls.
- `src/design-system/dialog.tsx` (new) — Base UI dialog wrapper adapted from `../../code/portfolio/src/ui/dialog.tsx`, using existing `#/design-system/cn`.
- `src/theme/themeTypes.ts` — replace/extend theme preference types with appearance mode, light/dark theme ids/options/labels, defaults, validation helpers.
- `src/theme/theme.functions.ts` — load and persist appearance settings cookies with TanStack server functions.
- `src/theme/ThemeProvider.tsx` — manage full appearance settings, resolve active theme from mode + system preference, apply classes/dataset/color-scheme.
- `src/theme/themeBootScript.ts` — pre-hydration resolver for cookies, system mode, `.light/.dark`, and resolved `data-theme`.
- `src/routes/__root.tsx` — load initial appearance settings and pass them to `ThemeProvider`; set initial html attributes consistently.
- `src/styles.css` — add portfolio IDE theme token blocks and update/merge `@theme inline` mappings if needed.
- `src/theme/ThemeToggle.tsx` — remove if unused, or leave unused if cleanup is not desired.
- `src/theme/themeTypes.test.ts` — update tests for new appearance/theme validation and resolution helpers.

## Reuse

- `src/design-system/cn.ts` — reuse for conditional classes in the dialog.
- `../../code/portfolio/src/theme/index.ts` — reuse theme ids/options/labels/defaults, cookie-based server functions, resolver script logic.
- `../../code/portfolio/src/theme/theme-provider.tsx` — reuse appearance resolution and provider state pattern.
- `../../code/portfolio/src/settings-dialog.tsx` — reuse mode buttons, IDE theme lists, and theme palette swatches; omit language handling.
- `../../code/portfolio/src/ui/dialog.tsx` — reuse accessible dialog wrapper pattern; current app already has `@base-ui/react` dependency.
- Current app `src/styles.css` — preserve app-specific CSS: font import, status-bar sizing, Tetris tokens, CRT scanline overlay, scrollbar styles, and Shiki editor styles.

## Steps

- [ ] Update theme types to define `AppearanceMode`, light/dark `ThemeId`s, options, labels, defaults, validation, and resolver helpers.
- [ ] Update server functions to read/write mode, light IDE theme, and dark IDE theme cookies.
- [ ] Update boot script and root HTML attributes to prevent flash of incorrect theme before hydration.
- [ ] Update `ThemeProvider` to apply `.light/.dark`, `data-mode`, `data-theme`, and `colorScheme`, and to respond to system preference changes in auto mode.
- [ ] Add the design-system dialog wrapper.
- [ ] Add settings dialog UI with “Mode” (`Light`, `Dark`, `Auto`) and “IDE themes” (light/dark theme lists with palette previews); do not include language.
- [ ] Update `AppHeader` to import `SettingsIcon`, manage dialog open state, replace `ThemeToggle` with a settings icon button, keep language buttons unchanged, and render `SettingsDialog`.
- [ ] Merge portfolio `[data-theme]` CSS token blocks into current `src/styles.css`, including editor/status variables, while keeping current custom CSS.
- [ ] Update/remove existing `ThemeToggle` usage and adjust tests to the new model.

## Verification

- [ ] Run `bun run typecheck`.
- [ ] Run `bun run test`.
- [ ] Run `bun run lint` or `bun run check`.
- [ ] Manually verify the settings icon opens/closes the dialog from the app header.
- [ ] Manually verify language buttons still appear in the header and are not in the dialog.
- [ ] Manually verify Light, Dark, and Auto modes apply the expected resolved IDE theme and persist across reloads.
- [ ] Manually verify each light/dark IDE theme changes the site CSS tokens and status bar colors.
- [ ] Manually verify Shiki/editor dark styles still work because `.dark` remains applied for dark resolved mode.
