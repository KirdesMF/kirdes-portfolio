# Help Dialog Keybindings — Plan

## Goal

Add an IDE help dialog that opens with the `h` shortcut and shows this app's keybindings. Keep it styled like the existing settings/help dialogs. Small, local change only.

## Findings

- `src/ide/store.ts` already has `helpOpen` and `setHelpOpen`.
- `src/ide/app-header.tsx` already has a `[help]` button that calls `setHelpOpen(true)`, but no IDE help dialog is mounted.
- `src/routes/_ide.tsx` is the global IDE shell and owns global shortcuts (`Space`, `:`) and dialog mounting.
- Existing dialog style to copy: `src/settings-dialog.tsx`.
- Do not use `src/terminal/help-dialog.tsx`; it is deprecated.
- Existing responsive pattern: `useIsMobile()` switches between `Dialog` and `Drawer`, with shared inner content.
- Existing tests for this pattern: `src/settings-dialog.test.tsx`.

## Files to Change

| File | Change |
| --- | --- |
| `src/ide/help-dialog.tsx` | New IDE help/keybindings dialog using existing `Dialog`/`Drawer` style. |
| `src/ide/help-dialog.test.tsx` | New focused component tests for desktop/mobile rendering and Escape close. |
| `src/routes/_ide.tsx` | Mount the IDE help dialog; wire `h` shortcut; include `helpOpen` in shortcut guards. |

No store change planned: `helpOpen` already exists.

## Keybindings to Show

Use a small static list that documents current app-level shortcuts:

- `h` — Help
- `Space` — Command menu
- `:` — Command mode
- `f` — Find file
- `g` — Find text
- `r` — Recent files
- `p` — Projects
- `c` — Config/settings
- `m` — Email
- `s` — Social medias / settings where applicable
- `q` — Quit / leave editor
- `Shift+R` — Reload

Group labels can be simple: `Global`, `Editor`, `Command menu`.

## Implementation Steps

1. Create `src/ide/help-dialog.tsx`.
   - Copy the responsive `Dialog`/`Drawer` structure from `SettingsDialog` only.
   - Use the same bordered card/title styling as `SettingsDialog`.
   - Render grouped rows with `Kbd`.
   - Footer: `ESC close`.
   - Do not import from or mirror `src/terminal/help-dialog.tsx`.

2. Update `src/routes/_ide.tsx`.
   - Import `HelpDialog`.
   - Read `helpOpen` and `setHelpOpen` from `useIdeStore`.
   - Add `h` hotkey via `useHotkeys` to call `setHelpOpen(true)`.
   - Do not trigger `h` when inputs or other dialogs/menus are active.
   - Add `helpOpen` to existing shortcut guards for `Space` and `:`.
   - Render `<HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />` with the other dialogs.

3. Add `src/ide/help-dialog.test.tsx`.
   - Assert desktop dialog renders keybinding rows.
   - Assert open dialog switches to mobile drawer on resize.
   - Assert Escape calls `onOpenChange(false)`.

## Verification

Run cheapest relevant checks:

```bash
bunx vitest run src/ide/help-dialog.test.tsx
bun run typecheck
```

If time permits or touched files suggest it:

```bash
bun run test
bun run lint
```

## After Approval Workflow

- Implementation agent: `worker-cheap` (localized, low-risk React changes).
- Pass this plan path: `/Users/kirdes/code/kirdes-portfolio/PLAN.md`.
- Then run `reviewer` on changed files.
- Main agent performs final verification and final fixes if needed.

## Token Usage Note

At final response, report token usage for main agent and subagents if the harness exposes it. If exact usage is not available from Pi/subagent output, state that exact token usage was not exposed and list the agents used.
