# TODO.md — Terminal Portfolio

Status legend: `[ ]` not started, `[~]` in progress, `[x]` done

---

## 1. Terminal design

- [ ] Define CSS tokens for terminal theme (background, foreground, border, accent, surface)
- [ ] Configure `@theme` in `styles.css` with terminal-appropriate palette (dark + light)
- [ ] Set font to Geist Mono / monospace globally
- [ ] Add CRT-like glow or subtle scanline effect (keep it tasteful)
- [ ] Style scrollbars for terminal look
- [ ] Add terminal green/data-green accent variant

## 2. Dark / light / system mode

- [ ] Reuse existing theme toggle infrastructure (cookie, FOUC script, ThemeProvider)
- [ ] Ensure dark mode feels like a dark terminal (not inverted light mode)
- [ ] Ensure light mode feels like a light terminal (not inverted dark mode)
- [ ] Add terminal accent colors for each mode

## 3. Split panels

- [ ] Design panel layout: main terminal area + sidebar or split views
- [ ] Implement grid-based panel container
- [ ] Add URL-backed panel state (which panels are open, their split ratio)
- [ ] Add toggle buttons for panels
- [ ] Ensure panels work on mobile (stack vertically)

## 4. Tabs

- [ ] Design tab bar (terminal-style, compact, monospace)
- [ ] Implement tab open/close/select via route params
- [ ] Add "new tab" button
- [ ] Sync active tab with URL route
- [ ] Add tab content pages (projects, about, contact)

## 5. Loading state / first impression

- [ ] Design terminal boot screen (logo, loading dots, initial prompt)
- [ ] Add fade-in after boot
- [ ] Show default terminal prompt on first load
- [ ] Ensure smooth transition from boot to interactive state

## 6. Content pages

- [ ] Home: terminal boot → project list / prompt
- [ ] Projects list: `/projects`
- [ ] Project detail: `/projects/:id`
- [ ] About: `/about`
- [ ] Contact: `/contact`

## 7. Polish

- [ ] Add terminal-style cursor blink
- [ ] Add subtle page transitions with Motion
- [ ] Ensure all content is keyboard-accessible
- [ ] Final SEO pass (meta tags, structured data)
