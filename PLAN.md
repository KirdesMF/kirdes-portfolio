# Intro Animation Revamp — Plan

## Context

The current intro (`/` route, `src/routes/index.tsx`) is a minimal boot screen with 3 scrambled text lines and a loading bar that auto-redirects to `/editor`. It doesn't reflect the terminal-centric design of the rest of the app.

**Goal:** Replace it with a cinematic terminal-style intro that simulates a developer's terminal session — typing commands, seeing real-looking outputs, then launching `nvim .` which transitions into the app (`/editor`).

**Two-phase approach:** Build the static (non-animated) terminal transcript first, then layer on a timeline animation for typing / output reveals.

---

## Approach

### Phase 1 — Static Terminal Transcript

Create a self-contained component that renders a **non-interactive** terminal view (styled like the existing `TerminalPane`) with pre-defined command/output pairs.

**Command sequence (Option B — Git workflow):**
1. `git branch` → output from existing `GitOutput` component
2. `git log --oneline -3` → output from existing `GitOutput` component
3. `ls` → output from existing `LsOutput` / `TerminalRouteList` component
4. `nvim .` → a custom "launching neovim" output, then triggers redirect

All outputs already exist as React components in the terminal module — we reuse them directly.

**Files to create/modify:**
- `src/routes/index.tsx` — replace current boot screen with static intro, then add animation
- (Optionally) `src/terminal/intro-content.tsx` — the static layout + content, if extracted

### Phase 2 — Typing Animation Timeline

Use **animejs v4 `createTimeline`** (already in the project) to animate the static content:

1. **Type each command** character-by-character into a prompt line
2. **Pause** (simulate processing time)
3. **Reveal output** (fade-in or instant)
4. **Repeat** for next command
5. After `nvim .` output is shown, **navigate to `/editor`**

For the typewriter effect: use a React state variable holding the current "typed" text, driven by animejs timeline `call()` callbacks that append characters at a controlled rate. This avoids needing a custom DOM text-splitter.

Alternatively, use animejs `TextSplitter` to split text into characters, then stagger-opacity animate them (more performant but more complex DOM structure).

**Recommendation:** Use the state-driven approach for simplicity — the intro only runs once and has ~4 short commands.

---

## Files to Modify

| File | What changes |
|------|-------------|
| `src/routes/index.tsx` | Replace entire component: new static terminal layout + animation timeline |
| `src/terminal/intro-content.tsx` (new, optional) | Static transcript layout (command prompts + outputs), extracted for clarity |

## Files to Reuse (no changes needed)

| File | What we reuse |
|------|-------------|
| `src/terminal/terminal-command-outputs.tsx` | `GitOutput` component for git branch / git log outputs |
| `src/terminal/terminal-route-list.tsx` | `TerminalRouteList` for `ls` output (folders + files) |
| `src/editor/editor-files.ts` | `editorFiles`, `folderRoutes` data for `ls` |
| `src/terminal/terminal-pane.tsx` | Visual patterns: prompt line structure (`~/code on feat/portfolio`, move-right icon, git branch icon) |
| `src/terminal/terminal-history.tsx` | `TerminalHistoryEntry` type pattern |
| `src/design-system/cn.ts` | `cn` utility |
| `animejs` (`createTimeline`, `stagger`, etc.) | Animation engine (already v4.4.1 in `package.json`) |

---

## Steps

- [x] **1. Create static intro component** — Build a non-interactive terminal view with all 4 command prompts and their outputs rendered statically (everything visible at once). Match the visual style of `TerminalPane` (prompt line, branch name, arrow icon, monospace font, colors).

- [x] **2. Add the `nvim .` output** — Custom output for the final command (e.g., a "Launching Neovim..." message or a Vim startup screen ASCII art). This is the cue before redirect.

- [x] **3. Wire static component into `src/routes/index.tsx`** — Replace the current boot animation with the static transcript. At this point the page shows all content immediately (no animation).

- [x] **4. Implement typewriter animation hook** — Create a reusable hook or inline logic that types text character-by-character into a state variable, driven by animejs timeline `call()` steps. Support configurable typing speed and pauses.

- [x] **5. Build the animation timeline** — Sequence the 4 commands with: type command → short pause → reveal output → longer pause → next command. After the final `nvim .` output appears, call `navigate({ replace: true, to: "/editor" })`.

- [x] **6. Polish timing and feel** — Tune typing speed, inter-command pauses, output fade-in duration. Ensure the intro doesn't drag but feels deliberate (~4-6 seconds total). Add a subtle cursor blink at the end of each typed command.

- [x] **7. Handle reduced motion** — Respect `prefers-reduced-motion`: if set, show the static version immediately (skip animation) and redirect after a short delay.

---

## Verification

1. **Static check:** Before animation is added, visit `/` — all 4 commands and their outputs are visible at once, styled like the terminal.
2. **Animation check:** After animation is added, visit `/` — commands type out one by one, outputs appear after each, and after `nvim .` the page redirects to `/editor`.
3. **Reduced motion:** Enable `prefers-reduced-motion` in devtools — the static content appears immediately, then redirects after ~1.5s.
4. **No regressions:** Navigate to `/editor`, `/terminal`, `/about`, `/contact`, `/work` — all existing routes work normally.
5. **Reload command:** The `reload` command in the terminal still redirects to `/` and the intro plays again.
