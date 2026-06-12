# Clickable Markdown Links — Plan

## Context

Markdown project files now include links such as `[Atlas Notes](./atlas-notes.md)`. The editor renders Shiki token data through a client-side `CodeFileEditor`, so links currently appear as plain text. We want markdown links clickable now, while keeping the design extensible enough to support links in other file types later.

## Findings

- `src/editor/editor-file-highlight.server.ts` tokenizes files with Shiki and returns plain token data (`FileTokenLine[]`). This is safe because it avoids raw HTML.
- `src/editor/code-file-editor.tsx` is the interactive client renderer with cursor/focus/keyboard behavior. Links should be rendered here so they can navigate on click.
- Shiki can split markdown link syntax across multiple tokens, so link detection must operate on the full line text, then map link ranges back onto token fragments.
- Existing helpers can be reused:
  - `findEditorFile()` / `resolveFile()` from `src/editor/editor-files.ts` for known editor files.
  - `useNavigate()` from TanStack Router for internal navigation.
- Current editor file selection uses search params (`/editor?file=...&neotree=open`). Keep that model for this feature; prettier file URLs can be planned separately later.
- Current cursor math uses raw text lengths; clickable rendering must preserve the exact visible source text (`[label](target)`) so cursor positioning remains stable.

## Approach

Add range-based link detection and rendering without changing Shiki tokenization or using `dangerouslySetInnerHTML`.

1. Create a small pure helper module for link detection/resolution.
   - Detect markdown inline links on full line text: `[label](target)`.
   - Return ranges `{ start, end, target }` using raw source-text offsets.
   - Keep this helper generic enough that future non-markdown link detectors can return the same range shape.

2. Render clickable ranges in `CodeFileEditor`.
   - Concatenate each line’s token text.
   - Find link ranges for markdown files only for now.
   - While rendering tokens, split token text at range boundaries.
   - Wrap link fragments in accessible clickable elements while preserving exact source text.
   - Cursor overlay remains independent and should continue using raw text.

3. Resolve click targets safely.
   - External safe protocols: `https:`, `http:`, `mailto:` render as `<a href target="_blank" rel="noreferrer noopener">`.
   - Relative links (`./x.md`, `../x.md`) resolve against the current file folder and open only if `findEditorFile()` finds a known file.
   - Absolute file-like links (`/work/projects/x.md`) open only if they resolve to a known editor file.
   - App routes (`/about`, `/work`, `/contact`, `/editor`, `/terminal`) navigate via router.
   - Reject unsafe protocols such as `javascript:`, `data:`, and `vbscript:`.

4. Keep current architecture.
   - Do not reintroduce server-rendered HTML or `dangerouslySetInnerHTML`.
   - Do not convert markdown to rendered markdown; the editor should still show source text.

## Files to modify

- `src/editor/markdown-links.ts` — new pure helper for link range detection and safe target classification/resolution.
- `src/editor/markdown-links.test.ts` — unit tests for link ranges and safe target handling.
- `src/editor/code-file-editor.tsx` — render link ranges over existing token text and navigate/copy safely.
- `src/routes/_ide.editor.tsx` — pass `result.language` to `CodeFileEditor` so link detection is markdown-only for now.
- `src/editor/editor-file-highlight.server.ts` — likely no behavior change; only update/export types if needed for `language`/metadata compatibility.

## Reuse

- `findEditorFile()` from `src/editor/editor-files.ts` for internal file validation.
- `useNavigate()` from `@tanstack/react-router` for internal navigation.
- Existing `CodeFileEditor` token rendering and cursor overlay.
- Existing markdown project files in `src/browser/work/work.files.tsx` for manual smoke testing.

## Steps

- [ ] Add `markdown-links` helper with `findMarkdownLinkRanges(lineText)` and safe target classification.
- [ ] Add focused tests for markdown link detection, unsafe protocol rejection, external links, app routes, and relative editor-file links.
- [ ] Update `CodeFileEditor` props to include `language` and use link rendering only when `language === "markdown"`.
- [ ] In `CodeFileEditor`, render token fragments intersecting link ranges as clickable links while preserving the exact source text.
- [ ] For internal file links, keep the current search-param URL model and navigate to `/editor` with `{ file, neotree: "open" }`; for app routes, navigate to that route; for external safe links, use normal anchor behavior.
- [ ] Pass `result.language` from `src/routes/_ide.editor.tsx` into `CodeFileEditor`.

## Verification

- Run `bun run check`.
- Run `bun run typecheck`.
- Run `bun run test src/editor/markdown-links.test.ts`.
- Manual smoke checks:
  - Open `work/projects/index.md`.
  - Click `[Atlas Notes](./atlas-notes.md)` and verify it opens `work/projects/atlas-notes.md`.
  - Verify cursor position/line layout does not shift around links.
  - Verify external links open safely with `noopener noreferrer` behavior.
