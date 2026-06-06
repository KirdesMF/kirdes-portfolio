# i18n: Translate user-facing app UI

## Context

Paraglide is already set up with `en` and `fr` locales. The existing message file at `messages/{en,fr}.json` only has an example. We need to add real translations for the app's user-facing strings while leaving terminal shell output in English (as is natural for terminal interfaces).

## Approach

Create a new feature branch (`feat/i18n-translations`) for this work. Then add messages to `messages/{en,fr}.json` and use the `m` import (`import { m } from "#/paraglide/messages"`) in components. Only translate **app UI text** — not terminal command outputs, man pages, file content, or technical terminal noise.

## What to translate

### 1. App shell
| Component | Strings |
|---|---|
| `TerminalMobilePanels` | `terminal`, `route`, `editor` button labels |
| `AppHeader` | `aria-label="Open editor"`, `aria-label="Open settings"`, `sr-only` text |
| `TerminalPrompt` | `placeholder="type a command..."` |

### 2. Dialogs
| Component | Strings |
|---|---|
| `SettingsDialog` | Title `Settings`, description, `Light themes` / `Dark themes`, `current`, heading `IDE themes` |
| `HelpDialog` | Title `Help`, description, `ESC close`, `← back` |

### 3. Route pages
| Component | Strings |
|---|---|
| `AboutSection` | `/* about */`, `product engineer / interface builder`, `see cat README.md for details...` |
| `ContactSection` | `/* contacts */`, contact labels (`twitter`, `email`, `github`, `linkedin`), `see cat links.json...` |
| `WorkSection` | `/* work */`, table headers (`NAME`, `VERSION`, `STATUS`, `DESCRIPTION`), `click a project name...` |
| `WorkDetailSection` | `project {name} not found.`, `back to projects`, `work` |

### 4. Terminal profile outputs
| Component | Strings |
|---|---|
| `WelcomeOutput` | `Welcome to kirdes terminal.`, `Type help to list available commands.` |
| `WhoamiOutput` | `product engineer / interface builder`, `for more, visit /about` |
| `InfosOutput` | `[INFORMATIONS]`, `LOCATION`, `Paris, France`, `FOCUS`, `frontend architecture...`, `CONTACT`, `STATUS`, `open for freelance & collaboration` |
| `EmailOutput` | `copy requested` |

<!-- Editor labels and status text are terminal IDE-chrome — keep in English -->

### 6. Command output messages
| Component | Strings |
|---|---|
| `builtins.tsx` — `handleBunDev` | `dev is already running on port 3000` |
| `builtins.tsx` — `handleLang` | `available languages:`, `(current)`, `lang is already set to {target}`, `lang set to {target}` |
| `builtins.tsx` — `handleSettings` | `opened settings` |
| `builtins.tsx` — `handleMode` | `usage: mode <dark\|light>`, `switched to {mode} mode` |
| `builtins.tsx` — `handleHistory` | `no commands in history` |
| `open.ts` | `opening editor`, `opening {target}`, `file not found: {target}` |
| `close.ts` | `file not found: {target}` |
| `source.tsx` | `file not found: {target}` |
| `cat.tsx` | `file not found: {target}` |

### 7. Availability status
| Component | Strings |
|---|---|
| `AvailabilityStatus` | `AVAILABLE` label, `OPEN`/`OFFERS`/`BUSY` status labels, popover title and description for each status |

<!-- Boot screen is a splash/terminal aesthetic — keep in English -->

<!-- SourceLinks shows code-level info — keep in English -->

## What NOT to translate

- Terminal command names (`cat`, `cd`, `ls`, `open`, `close`, etc.) — must stay English
- Man page descriptions (`terminal-command-docs.ts`) — these are documentation in English
- File content displayed in the editor (markdown/JSON in `about.files.ts`, `contact.files.ts`, `work.files.ts`, `root.files.ts`) — this is data
- Social media URLs and handles — locale-independent
- Technical status output like git simulation (`GitOutput`), `ls`/`tree` output — typical terminal UX
- `SourceOutput` — shows code file paths, technical
- **TerminalSessionHeader** — status labels (SESSION, VERSION, BOOT_TIME, etc.) are terminal chrome
- **Editor labels and status** — `EmptyEditor` command labels, `NORMAL` mode, `highlighting file...` etc. are IDE-chrome
- **Boot screen** — `kirdes terminal boot` and boot lines are splash aesthetic
- **SourceLinks** — `implementation`, `renderer:`, `content:` are code-level info
- **Mode labels** (`Light`, `Dark`, `Auto`) — don't translate

## Files to modify

- `messages/en.json` — add all English translations
- `messages/fr.json` — add all French translations
- Components listed above — import `m` and replace hardcoded strings with `m.xxx()`

## Steps

- [x] Create and switch to `feat/i18n-translations` branch
- [x] Add all English message keys to `messages/en.json`
- [x] Add French translations to `messages/fr.json`
- [x] Update `src/layout/AppHeader.tsx` — translate aria-labels and sr-only text
- [x] Update `src/terminal/TerminalMobilePanels.tsx` — translate panel button labels
- [x] Update `src/terminal/TerminalPrompt.tsx` — translate placeholder
- [x] Update `src/settings-dialog.tsx` — translate title, description, theme section headings, `current` badge
- [x] Update `src/terminal/HelpDialog.tsx` — translate title, description, footer hints
- [x] Update `src/portfolio/about/AboutSection.tsx` — translate labels and guidance text
- [x] Update `src/portfolio/contact/ContactSection.tsx` — translate labels and guidance text
- [x] Update `src/portfolio/work/WorkSection.tsx` — translate table headers and guidance text
- [x] Update `src/portfolio/work/WorkDetailSection.tsx` — translate not-found and navigation text
- [x] Update `src/terminal/terminal-command-outputs.tsx` — translate `WelcomeOutput`, `WhoamiOutput`
- [x] Update `src/terminal/terminal-profile-outputs.tsx` — translate `InfosOutput`, `EmailOutput`
- [x] Update `src/terminal/commands/builtins.tsx` — translate user-facing output messages
- [x] Update `src/terminal/commands/open.ts` — translate output messages
- [x] Update `src/terminal/commands/close.ts` — translate output messages
- [x] Update `src/terminal/commands/cat.tsx` — translate output messages
- [x] Update `src/terminal/commands/source.tsx` — translate output messages
- [x] Update `src/portfolio/AvailabilityStatus.tsx` — translate labels and popover content

## Verification

- Run `bun run typecheck` to catch any import/type issues
- Run `bun run test` to ensure existing tests pass
- Switch locale between `en` and `fr` in the app header
- Verify all translated strings appear correctly in both locales
- Verify that terminal command names, man pages, and file content remain in English
