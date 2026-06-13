# Plan: Empty editor contacts/settings commands

## Context
- In `src/editor/read-only-file-editor.tsx`, the empty editor command list currently includes separate `Config`, `Email`, and `Social Medias` commands.
- Desired change: group email/social links under a `Contacts` command, rename `Config` to `Settings`, adjust shortcuts, and add an always-visible GitHub link above the app status bar.
- Current relevant shortcuts: `Config` uses `c`, `Email` uses `m`, `Social Medias` displays `s`; only `Email` currently has behavior. `Settings` in the global command menu already uses `s`.
- User decision: do not add a top-level direct GitHub command/shortcut; keep GitHub in Contacts and add a bottom-right `[github]` app link instead.

## Approach
- Keep the change surgical and centered on the empty editor UI plus any minimal shared dialog/store plumbing needed.
- Add a contacts command dialog that opens from the empty editor `Contacts` command and lists keyboard-arrow-navigable items:
  - email
  - x.com
  - linkedin
  - github
- Rename the empty editor `config` command to `settings`/`Settings` and assign shortcut `s`.
- Assign the empty editor `Contacts` command shortcut to `c`.
- Do not add a direct GitHub empty-editor command or shortcut; keep `g` mapped to Find Text.
- Add a persistent bottom-right `[github]` anchor in the IDE shell, positioned just above the status bar, linking to GitHub and using the same shimmer animation style as the active language button.

## Files to modify
- `src/editor/read-only-file-editor.tsx`
- Likely `src/ide/store.ts`
- Likely `src/routes/_ide.tsx`
- Likely new small dialog component, e.g. `src/ide/contacts-dialog.tsx`
- New contact data file, e.g. `src/contact/contact-info.ts`
- Potentially a small new component such as `src/ide/github-link.tsx`, or inline JSX in `src/routes/_ide.tsx` if simpler.

## Reuse
- Reuse `CommandDialog`, `CommandList`, `CommandGroup`, and `CommandItem` from `src/design-system/command.tsx` so Contacts can be navigated with arrow keys rather than tabbing.
- Reuse the active language shimmer pattern from `src/ide/language-switcher.tsx` for the persistent `[github]` link; extract a tiny shared shimmer label helper only if needed to avoid duplication.
- Store canonical contact values in a new shared data file:
  - email: `cedgourville@gmail.com`
  - x.com handle: `@cedricgourville` / URL `https://x.com/cedricgourville`
  - linkedin: `https://www.linkedin.com/in/cedric-gourville/`
  - github: `kirdesmf` / URL `https://github.com/kirdesmf`
- Reuse `copyToClipboard` and `toastManager` patterns from the existing email command in `src/editor/read-only-file-editor.tsx` if the email item copies to clipboard.

## Steps
- [ ] Add `contactsOpen` state and setter to the IDE store.
- [ ] Create a shared contact info module with the new contact values and consume it from the contacts dialog and GitHub link.
- [ ] Render a new `ContactsDialog` from the IDE shell alongside existing dialogs.
- [ ] Implement `ContactsDialog` with the command component primitives so arrow keys move through email/x.com/LinkedIn/GitHub items and Enter activates the selected item.
- [ ] Add a bottom-right shimmered `[github]` link in the IDE shell just above `<StatusBar />`, using `target="_blank"` and `rel="noreferrer"`.
- [ ] In `EmptyEditor`, include `contactsOpen` in hotkey blocking.
- [ ] Replace `config` command with `settings` (`Settings`, shortcut `s`) and update command handler/hotkey.
- [ ] Replace the separate `email` and `social-medias` entries with one `contacts` command (`Contacts`, shortcut `c`) that opens the contacts dialog.
- [ ] Build the contacts dialog list using existing command-dialog styling and shared contact URLs.
- [ ] Make the email item copy `cedgourville@gmail.com` to clipboard with the existing toast pattern; make x.com/LinkedIn/GitHub items open their URLs in a new tab/window.

## Verification
- [ ] Run `bun run typecheck` and `bun run check`.
- [ ] Manually open the editor empty state and confirm the command list shows `Contacts c` and `Settings s`.
- [ ] Press `c` and verify contacts dialog opens and lists email, x.com, LinkedIn, and GitHub.
- [ ] Verify contacts dialog supports ArrowUp/ArrowDown selection and Enter activation.
- [ ] Press `s` and verify settings opens.
- [ ] Confirm `g` still opens Find Text and no shortcut conflict is introduced.
- [ ] Confirm `[github]` is visible at bottom right above the status bar, has the active-language-style shimmer, and opens `https://github.com/kirdesmf`.
