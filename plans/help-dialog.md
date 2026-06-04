# Help Dialog Plan

## Context

- The current `help` command writes `<HelpOutput />` into the terminal history in `src/terminal/commands/builtins.tsx`.
- `HelpOutput` renders command/route lists from `src/terminal/terminal-command-outputs.tsx` inside `src/terminal/TerminalPane.tsx` history output.
- Settings already uses search-param driven dialog state (`dialog=settings`), so help should use the same pattern with `dialog=help`.

## Approach

- Add `help` as a supported `dialog` search value alongside `settings`.
- Render a terminal-scoped help dialog from the layout, deriving open state from `search.dialog === "help"`.
- Change the `help` command to navigate to the current route with `{ dialog: "help" }` instead of pushing `HelpOutput` into terminal history.
- Reuse existing command/route documentation data where possible; extract reusable command docs if needed so `HelpDialog`, `HelpOutput`, and `ManOutput` do not drift.

## Files to modify

- `src/terminal/terminal-search.ts` — accept `dialog=help`.
- `src/terminal/commands/builtins.tsx` — update `help` command behavior.
- `src/terminal/TerminalLayout.tsx` — render `HelpDialog` and close it by removing `dialog`.
- `src/terminal/HelpDialog.tsx` (new) — dialog UI for command help.
- `src/terminal/terminal-command-outputs.tsx` — optionally refactor/reuse help/man command docs.
- `src/terminal/terminal-command-docs.ts` (new, if useful) — shared command docs metadata.

## Reuse

- `src/design-system/dialog.tsx` — dialog primitives already used by settings.
- `src/terminal/terminal-commands.ts` — canonical command list for autocomplete/help.
- `src/terminal/terminal-routes.ts` — canonical route list.
- Existing `manPages`/`HelpOutput` content in `src/terminal/terminal-command-outputs.tsx`.
- Existing search-param dialog pattern used by settings (`dialog=settings`).

## Steps

- [ ] Extend terminal search parsing so `dialog` can be `"settings" | "help"`.
- [ ] Add a `HelpDialog` component using design-system dialog primitives.
- [ ] Refactor command documentation into reusable data if needed, preserving `ManOutput` behavior.
- [ ] Render `HelpDialog` in `TerminalLayout` with open state from search params.
- [ ] Implement close behavior by removing `dialog` while preserving all other search params.
- [ ] Update `help` command to set `dialog: "help"` via `ctx.navigate(ctx.currentRoute, ...)`.
- [ ] Keep `man <command>` terminal output unchanged.
- [ ] Ensure existing `settings`/`config` dialog behavior still works.

## Verification

- [ ] Run `bun run typecheck`.
- [ ] Run `bun run test`.
- [ ] Run `bun run lint`.
- [ ] Manually type `help` and verify the help dialog opens.
- [ ] Verify URL contains `dialog=help` while open.
- [ ] Verify closing the dialog removes `dialog` and preserves other search params.
- [ ] Verify browser back closes the dialog.
- [ ] Verify `settings`/`config` still opens settings.
- [ ] Verify `man help` and other `man <command>` output still works in terminal history.
