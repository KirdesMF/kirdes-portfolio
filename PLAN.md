# Plan: first try mobile wrapping with current Shiki renderer

## Context

- Current editor file rendering uses `getFileTokens` → `highlightFileTokens`, backed by Shiki server-side tokenization in `src/editor/editor-file-highlight.server.ts`.
- `CodeFileEditor` (`src/editor/code-file-editor.tsx`) renders Shiki tokens as inline `<span>` elements inside one block per source line.
- The mobile pain is horizontal scrolling caused mainly by code-style CSS in `src/styles.css`, especially `.editor-code pre { min-width: max-content; }`.
- The files are intended to be simple/readable review files: markdown, JSON, TS/TSX/HTML-like content with JSX tags and text nodes, not full application source with imports and complex code.
- Before building a custom renderer, first test whether the existing Shiki output can wrap well enough by changing CSS only/minimally.

## Approach

- Keep Shiki and the current token pipeline unchanged.
- First adjust editor CSS so Shiki token spans can wrap on mobile instead of forcing horizontal scroll.
- Let browser wrapping handle text nodes naturally. For TSX/HTML-like content such as:

  ```tsx
  <p>
    hello there my name is Cedric
  </p>
  ```

  acceptable mobile display is:

  ```tsx
  <p>
    hello there my
    name is Cedric
  </p>
  ```

- Do not introduce `/lab/renderer` or a custom engine yet. After testing the Shiki wrapping behavior, decide whether a custom renderer is still needed.
- Keep cursor and line numbers for now, but treat them as part of the experiment: if wrapping makes cursor/line-number behavior too awkward, that becomes evidence for the later simplified custom renderer.

## Files to modify

- `src/styles.css` — adjust `.editor-code`/Shiki CSS to allow wrapping and reduce horizontal scrolling.
- Possibly `src/editor/code-file-editor.tsx` — only if a small class/data attribute is needed to scope wrapping by language or viewport; avoid token/rendering refactors in this first step.

## Reuse

- Existing Shiki tokenization in `src/editor/editor-file-highlight.server.ts`.
- Existing `CodeFileEditor` rendering and markdown link handling in `src/editor/code-file-editor.tsx`.
- Existing editor theme variables in `src/styles.css`.

## Steps

- [x] Remove or override `min-width: max-content` for mobile/wrapping mode.
- [x] Add wrapping-friendly CSS to the current editor output, likely using `white-space: pre-wrap`, `overflow-wrap`, and `tab-size: 2`.
- [x] Preserve indentation as much as possible without JS line splitting.
- [x] Ensure Shiki token spans still inherit their light/dark colors correctly.
- [x] Test whether line numbers, active line background, scrolling, and cursor overlay remain acceptable when a source line wraps visually.
- [x] If the CSS-only approach is good enough, keep Shiki for now and skip the custom renderer.
- [x] If cursor/line numbers/text wrapping are still a poor fit, plan the next step: a separate `/lab/renderer` prototype without cursor or line numbers and with semantic CSS token classes.

## Verification

- Run `bun run typecheck`.
- Run `bun run lint` or `bun run check`.
- Manually open markdown, JSON, TSX, and HTML-like/JSX files in the existing editor.
- Manually test narrow/mobile widths: text should wrap instead of forcing page/editor horizontal scrolling.
- Verify simple JSX text nodes wrap naturally while tags/attributes remain readable.
- Verify dark/light Shiki colors still work.
- Verify cursor, line numbers, active line, hover background, and markdown links remain acceptable enough for the current editor experience.
