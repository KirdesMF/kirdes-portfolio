# TODO.md - Portfolio Agent Workbench

## Current stack

- Framework: TanStack Start
- Animation: Motion (`motion/react`)
- Syntax highlighting: Shiki
- Styling: Tailwind CSS v4
- UI primitives: Base UI (`@base-ui/react` installed)
- Language: TypeScript
- Architecture: vertical, feature-owned modules

## Current objective

Build a personal portfolio as an AI-agent-inspired workbench.

Next step: project setup cleanup, then first static workbench shell.

The MVP must work without a live LLM. The scripted agent experience should feel polished first. A real scoped `/ask` mode can be added later.

## Status legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Done
- `[!]` Blocked / needs decision

---

## 0. Project setup

- [x] Create TanStack Start project.
- [x] Enable strict TypeScript configuration.
- [x] Install and configure Tailwind CSS v4.
- [x] Install Base UI package (`@base-ui/react`).
- [ ] Configure Base UI-backed design-system wrappers.
- [x] Install Motion (`motion`).
- [x] Install Shiki.
- [x] Add formatting and linting.
- [x] Add path aliases.
- [x] Add hybrid no-FOUC theme toggle.
- [ ] Add initial README.
- [x] Add `PLAN.md`.
- [x] Add `TODO.md`.

## 1. Architecture rules

Use vertical source structure, but create each vertical only when real implementation needs it.

Rules:

- Keep TanStack file routes in `src/routes`.
- Do not create empty scaffolding folders.
- Do not use barrel files.
- Prefer repo-root `#/*` imports across folders.
- Avoid top-level generic folders like `components`, `hooks`, `utils`, `types`, or `services`.
- Keep feature-specific code inside its owning vertical, for example `src/workbench`, `src/portfolio-agent`, `src/portfolio-content`, `src/code-viewer`, or `src/design-system`.

## 2. Design system foundation

Use Base UI as the accessible primitive layer. Do not use shadcn/ui or generated shadcn components. Keep project-specific composition inside the relevant vertical.

Theme rule:

- Add light/dark/system theme toggle before workbench shell.
- Store selected theme preference in a cookie, not localStorage.
- Read the cookie in the root loader with TanStack server cookie helpers.
- Apply the resolved theme class directly on `<html>` during SSR.
- Avoid FOUC by using TanStack `ScriptOnce` before hydration, especially for `system` preference.
- Update `document.documentElement` and the cookie immediately on client toggle.
- Do not call `router.invalidate()` for theme changes.
- Memoize the theme context value with `useMemo` and stabilize `setTheme` with `useCallback`.
- Keep `suppressHydrationWarning` on `<html>` because the script may mutate class/data attributes before hydration.

Tasks:

- [ ] Define base theme tokens.
- [x] Add no-FOUC theme boot script in root document.
- [x] Add cookie-backed theme storage helper.
- [x] Add theme toggle UI.
- [ ] Wrap selected `@base-ui/react` primitives in `src/design-system` components.
- [ ] Define dark workbench palette.
- [ ] Add button primitive.
- [ ] Add panel primitive.
- [ ] Add tabs primitive.
- [ ] Add badge primitive.
- [ ] Add input primitive.
- [ ] Add scroll-area primitive.
- [ ] Add tooltip primitive.
- [ ] Add command palette primitive or compose one from Base UI primitives.
- [ ] Add visible focus states.
- [ ] Add reduced-motion-safe defaults.

## 3. Static workbench shell

Build the desktop shell first with mock data.

Tasks:

- [ ] Build top bar.
- [ ] Build left project explorer.
- [ ] Build center editor area.
- [ ] Build right inspector panel.
- [ ] Build bottom terminal panel.
- [ ] Add resizable-looking panel dividers.
- [ ] Add tab bar in editor area.
- [ ] Add terminal tabs: `TERMINAL`, `AGENT STREAM`, `LOGS`, `MEMORY`.
- [ ] Add mock selected project state.
- [ ] Add empty states.
- [ ] Add mobile fallback layout.

Done when:

- [ ] The app visually reads as an IDE/agent workbench.
- [ ] The layout is usable without real data.
- [ ] The desktop and mobile layouts do not break.

## 4. Portfolio content model

Tasks:

- [ ] Define `ArtifactKind`.
- [ ] Define `PortfolioArtifact`.
- [ ] Define `PortfolioProject`.
- [ ] Define `DecisionArtifact`.
- [ ] Define `SourceReference`.
- [ ] Create artifact lookup helpers.
- [ ] Add tests for artifact lookup helpers.

Initial content:

- [ ] `candidate/profile.md`
- [ ] `candidate/experience.md`
- [ ] `candidate/strengths.md`
- [ ] `candidate/weaknesses.md`
- [ ] `candidate/contact.md`
- [ ] `projects/portfolio-workbench.md`
- [ ] `projects/design-system.md`
- [ ] `projects/motion-lab.md`
- [ ] `projects/frontend-audit.md`
- [ ] `decisions/architecture.md`
- [ ] `decisions/accessibility.md`
- [ ] `decisions/performance.md`
- [ ] `decisions/animation.md`
- [ ] `decisions/llm-scope.md`

Done when:

- [ ] The explorer can list real projects and artifacts.
- [ ] The editor can render selected markdown artifacts.
- [ ] The inspector reflects the selected artifact/project.

## 5. Workbench state

Tasks:

- [ ] Define selected project state.
- [ ] Define opened tabs state.
- [ ] Define active tab state.
- [ ] Define focused artifact range state.
- [ ] Define terminal history state.
- [ ] Define agent run state.
- [ ] Define inspector context state.
- [ ] Add pure helpers for opening tabs.
- [ ] Add pure helpers for focusing an artifact range.
- [ ] Add tests for non-trivial state helpers.

Done when:

- [ ] Selecting a project updates editor and inspector.
- [ ] Opening an artifact creates or activates a tab.
- [ ] Agent events can update the workbench state.

## 6. Scripted agent core

The scripted agent is the MVP. It must not depend on a live LLM.

Tasks:

- [ ] Define `AgentEvent`.
- [ ] Define `ScriptedScenario`.
- [ ] Define `AgentCommand`.
- [ ] Implement command parser.
- [ ] Implement scenario runner.
- [ ] Implement event stream timing.
- [ ] Implement terminal output rendering.
- [ ] Implement event-to-workbench-state reducer.
- [ ] Add tests for command parser.
- [ ] Add tests for scenario runner.
- [ ] Add tests for event reducer.

Initial commands:

- [ ] `/help`
- [ ] `/audit`
- [ ] `/projects`
- [ ] `/open <project>`
- [ ] `/explain <decision>`
- [ ] `/show-tradeoffs`
- [ ] `/weaknesses`
- [ ] `/contact`

Done when:

- [ ] Running `/audit` streams a believable trace.
- [ ] Agent events open relevant artifacts.
- [ ] Agent events update the inspector.
- [ ] The terminal feels useful, not decorative.

## 7. Scripted scenarios

Create these first:

### `/audit`

- [ ] Read candidate profile.
- [ ] Inspect project index.
- [ ] Review architecture decisions.
- [ ] Check UI polish evidence.
- [ ] Look for weaknesses.
- [ ] Generate recommendation.

### `/projects`

- [ ] List projects.
- [ ] Suggest opening a project.
- [ ] Highlight selected project in explorer.

### `/open portfolio-workbench`

- [ ] Open project artifact.
- [ ] Open architecture notes.
- [ ] Update inspector with role, stack, evidence, and trade-offs.

### `/explain architecture`

- [ ] Open architecture decision artifact.
- [ ] Focus relevant lines.
- [ ] Explain key trade-offs.

### `/weaknesses`

- [ ] Open weaknesses artifact.
- [ ] Present honest limitations.
- [ ] Suggest related evidence.

### `/contact`

- [ ] Open contact artifact.
- [ ] Show safe contact methods.
- [ ] Provide call-to-action.

Done when:

- [ ] Each scenario feels intentionally authored.
- [ ] Each scenario changes more than terminal text.

## 8. Code viewer with Shiki

Tasks:

- [ ] Create `CodeFileViewer`.
- [ ] Create `highlightCode`.
- [ ] Add TypeScript highlighting.
- [ ] Add TSX highlighting.
- [ ] Add JSON highlighting.
- [ ] Add Markdown highlighting.
- [ ] Add shell highlighting.
- [ ] Add line numbers.
- [ ] Add active line support.
- [ ] Add focused range support.
- [ ] Add copy button.
- [ ] Add file path header.
- [ ] Add language badge.
- [ ] Add tests for language/path helpers.

Security rule:

- [ ] Only render Shiki HTML from trusted portfolio artifacts.

Done when:

- [ ] The agent can open highlighted code files.
- [ ] The code viewer looks integrated into the workbench.

## 9. Motion animation layer

Use Motion (`motion/react`) for choreography, not logic.

Tasks:

- [ ] Add reduced-motion helper.
- [ ] Add file-open line reveal.
- [ ] Add focused-line pulse.
- [ ] Add diff-line enter animation.
- [ ] Add terminal event stream animation.
- [ ] Add inspector card transition.
- [ ] Add tab open transition.
- [ ] Ensure animations are skipped or simplified with reduced motion.
- [ ] Add tests for reduced-motion helper.

Done when:

- [ ] Motion helps explain agent actions.
- [ ] Motion does not make the interface noisy.

## 10. Diff and replay features

This can come after the core MVP.

Tasks:

- [ ] Define `CodeDiff`.
- [ ] Define diff line model.
- [ ] Add diff artifact type.
- [ ] Render added/removed/context lines.
- [ ] Animate added lines.
- [ ] Dim removed lines.
- [ ] Create `/replay refactor portfolio-agent-router`.
- [ ] Consider Shiki Magic Move for special before/after moments.

Done when:

- [ ] The app can tell a technical story through code changes.

## 11. Command palette

Tasks:

- [ ] Add keyboard shortcut.
- [ ] List available commands.
- [ ] Search commands.
- [ ] Run selected command.
- [ ] Show command descriptions.
- [ ] Show command scope.
- [ ] Add accessible keyboard navigation.

Done when:

- [ ] A visitor does not need to guess terminal commands.

## 12. Optional live LLM mode

Do this only after the scripted workbench is excellent.

Tasks:

- [ ] Add `/ask <question>` command.
- [ ] Define `QuestionScope`.
- [ ] Implement scope classifier.
- [ ] Refuse out-of-scope questions locally.
- [ ] Implement local retrieval over portfolio artifacts.
- [ ] Implement structured LLM response schema.
- [ ] Validate LLM response.
- [ ] Require at least one source for answered responses.
- [ ] Add source display in inspector.
- [ ] Add rate limiting.
- [ ] Add caching.
- [ ] Add budget fallback.
- [ ] Add tests for classifier.
- [ ] Add tests for retrieval.
- [ ] Add tests for answer validation.

Done when:

- [ ] The LLM answers only about Cedric, the portfolio, projects, skills, experience, or contact.
- [ ] Out-of-scope questions are refused.
- [ ] Every answer is grounded in visible sources.

## 13. Accessibility checklist

- [ ] Keyboard navigation works in explorer.
- [ ] Keyboard navigation works in tabs.
- [ ] Keyboard navigation works in terminal input.
- [ ] Keyboard navigation works in command palette.
- [ ] Focus states are visible.
- [ ] Reduced motion is respected.
- [ ] Color contrast is acceptable.
- [ ] Buttons have accessible names.
- [ ] Tabs use appropriate semantics.
- [ ] Terminal output is readable by assistive technologies.
- [ ] No essential information relies only on color.

## 14. Performance checklist

- [ ] Avoid highlighting large files on every render.
- [ ] Cache highlighted HTML.
- [ ] Keep animated code excerpts short.
- [ ] Lazy-load heavy visual sections.
- [ ] Avoid running Motion animations on hidden panels.
- [ ] Avoid unnecessary client-side LLM state.
- [ ] Keep initial load focused on shell and first artifact.
- [ ] Verify mobile performance.

## 15. Content quality checklist

For each project:

- [ ] Clear summary.
- [ ] Your role.
- [ ] Stack.
- [ ] Problem solved.
- [ ] Constraints.
- [ ] Technical decisions.
- [ ] Evidence.
- [ ] Trade-offs.
- [ ] Limitations.
- [ ] What you would improve now.

For candidate profile:

- [ ] Strong short bio.
- [ ] Frontend positioning.
- [ ] Technical strengths.
- [ ] Honest weaknesses.
- [ ] Preferred work style.
- [ ] Contact information.
- [ ] Links.

## 16. Open decisions

- [ ] Final app name: `Cédric Workbench`, `Portfolio Agent OS`, or another name.
- [ ] Final hosting provider.
- [ ] Whether `/ask` ships in MVP or later.
- [ ] Whether the first release uses a real LLM.
- [ ] Whether to include real CV download.
- [ ] Whether to include GitHub links.
- [ ] Whether to include analytics.
- [ ] Whether to include a public changelog.

## 17. MVP definition

The MVP is complete when:

- [ ] The app has a polished workbench layout.
- [ ] There are at least three real projects.
- [ ] `/audit` works end-to-end.
- [ ] Agent events open artifacts and update the UI.
- [ ] The inspector shows meaningful evidence.
- [ ] Code highlighting works with Shiki.
- [ ] Motion animations enhance key moments.
- [ ] The contact path is obvious.
- [ ] The app is usable on mobile.
- [ ] The app remains useful without a live LLM.

## 18. First build order

Recommended order:

1. [x] Hybrid no-FOUC theme toggle.
2. [ ] Project setup cleanup.
3. [ ] Static workbench shell, creating `src/workbench` only when first workbench file is added.
4. [ ] Portfolio content model.
5. [ ] Artifact viewer.
6. [ ] Scripted terminal commands.
7. [ ] `/audit` scenario.
8. [ ] Inspector wiring.
9. [ ] Shiki code viewer.
10. [ ] Motion animation.
11. [ ] Content polish.
12. [ ] Accessibility pass.
13. [ ] Optional `/ask`.

## 19. Working log

Use this section while building.

### Entry template

```md
### YYYY-MM-DD

Done:

- ...

Next:

- ...

Blocked:

- ...
```

### 2026-05-04

Done:

- Defined concept: portfolio as agent workbench.
- Chosen stack: TanStack Start, Motion, Shiki, Tailwind CSS v4, Base UI.
- Created planning direction.
- Created TODO tracking document.

Next:

- Create the TanStack Start project.
- Build the static workbench shell.
- Write the first real portfolio artifacts.

Blocked:

- None.

### 2026-05-05

Done:

- Verified `package.json`: TanStack Start, React 19, Tailwind CSS v4, Base UI, Lucide, Biome, Vitest, Wrangler installed.
- Confirmed `@base-ui/react` is installed.
- Confirmed Motion and Shiki are not installed yet.
- Checked `motion` npm package: latest `12.38.0`, supports React 18/19, install command `npm install motion`.
- Installed `motion@12.38.0` and `shiki@4.0.2` with Bun.
- Removed shadcn direction from planning docs.

Next:

- Fix project setup cleanup items, especially Vitest/Cloudflare config conflict.
- Create Base UI-backed `src/design-system` wrappers only when first primitive is used.
- Configure Motion usage in animation layer when implementing workbench UI.
- Configure Shiki highlighting in code-viewer phase.

Blocked:

- None.

### 2026-05-05

Done:

- Created `feature/theme-toggle` branch.
- Implemented hybrid theme strategy: SSR reads theme cookie with TanStack server helpers, `<html>` gets resolved class, TanStack `ScriptOnce` boot script prevents FOUC, client toggle updates DOM and cookie immediately.
- Added memoized `ThemeProvider` and `ThemeToggle`.
- Confirmed `bun run check` and `bun run build` pass.

Next:

- Fix project setup cleanup items, especially Vitest/Cloudflare config conflict.
- Start static workbench shell and create vertical folders only when real files are added.

Blocked:

- `bun run test` still blocked by existing Cloudflare Vite plugin/Vitest environment conflict.

```

```
