# Terminal Portfolio — Plan

## Vision

A personal portfolio that looks and feels like a modern terminal emulator (Ghostty-style). Visitors land on a terminal screen, can open files/projects in tabs, split panels, and explore content through a familiar terminal UI — all clickable, no CLI knowledge required.

## Principles

- **Terminal aesthetic first** — every visual decision must serve the terminal metaphor. CRT glow, monospace, panels, tabs, status bar.
- **Clickable by default** — every interactive element works with mouse. No hidden keyboard shortcuts required.
- **SEO-friendly** — use real TanStack routes for every content page. No hash-based SPAs. Content is crawlable.
- **Dark/light/system** — both modes must feel authentic to the terminal metaphor. Not a generic theme swap.
- **Progressive complexity** — simple first, fancy later. Core layout and navigation work before animations or easter eggs.
- **Discuss before coding** — we agree on approach for each task before writing code.

## Stack

- TanStack Start (SSR routing, SEO)
- Tailwind CSS v4 (styling, `@theme` tokens)
- `@base-ui/react` (accessible primitives for menus, tabs, dialogs)
- Motion (subtle transitions)
- Lucide (icons)
- Shiki (syntax highlighting)

## Route design

Every piece of content gets its own route:

```
/                     → terminal boot screen → home
/terminal             → full terminal view with split panels
/terminal/:tabId      → specific tab content
/projects             → project list
/projects/:projectId  → single project detail
/about                → about me
/contact              → contact / links
```

## Content model

- **About** — short bio, role, stack, personality
- **Projects** — 3–5 key projects with summary, stack, decisions
- **Contact** — safe contact methods, GitHub, LinkedIn
- **Skills** — technical strengths, preferred work style

## Non-goals (for now)

- Live LLM agent mode
- Command palette search
- Terminal games (Tetris, etc.)
- Resizable panels (first iteration: fixed splits)
