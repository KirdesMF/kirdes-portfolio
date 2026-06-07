# Header and terminal workspace UX plan

## Context

The current header mixes route navigation with workspace controls. The first left navigation item (`~`) points to `/terminal`, which effectively closes/hides the browser route pane because the terminal is always rendered. This makes the item feel like a terminal toggle even though the terminal is the base layer.

Target UX:
- `/` plays the boot intro, then redirects to `/terminal/home`.
- `/terminal/home` is the default shareable workspace route with terminal + browser/home pane.
- `/terminal` remains the terminal-only state after closing the browser pane.
- Users can close browser and editor panes, leaving only the terminal.
- Header left is route navigation; header right is tools/utilities.

## Approach

Create a real `/terminal/home` route and make `home/` a normal browser route. Keep the terminal as the always-visible base panel. Move the editor control from the left navigation group to the right actions group so the header has a clearer model:

- Left: `home/`, `about/`, `work/`, `contact/`
- Right: `editor`, language, settings, clock

Closing the browser pane continues to navigate to `/terminal` and clean the URL. Clicking any left nav item reopens the browser pane at that route.

After plan approval, create a new git branch before making code changes.

## Files to modify

- `src/routes/index.tsx`
  - Change boot redirect target from `/terminal` to `/terminal/home`.
- `src/routes/terminal/home/route.tsx` or `src/routes/terminal/home/index.tsx`
  - Add new home route content.
- `src/terminal/terminal-routes.ts`
  - Change home navigation item from `{ command: "/home", label: "~", to: "/terminal" }` to a real `/terminal/home` route with a `home` label.
- `src/layout/AppHeader.tsx`
  - Remove editor item from desktop/mobile left navigation groups.
  - Add editor button/link to the right-side `HeaderActions` group.
  - Ensure route links still call `showRoutePanelSearch` so clicking left nav reopens/selects the browser pane on mobile.
- `src/terminal/TerminalLayout.tsx`
  - Revisit `isHomeRoute` logic so it means terminal-only route (`/terminal`) rather than home content route.
  - Ensure `/terminal/home` counts as having a right/browser pane.
- `src/terminal/TerminalMobilePanels.tsx`
  - Revisit `getMobilePanel` and route tab visibility naming/logic if `isHomeRoute` currently means terminal-only.
- Potentially related tests under `src/terminal/*.test.tsx` if route expectations include `/home -> /terminal`.

## Reuse

- Reuse existing pane close behavior:
  - `showTerminalPanelSearch` in `src/terminal/terminal-search-transitions.ts`
  - route pane close link in `src/terminal/TerminalRoutePane.tsx`
- Reuse route navigation data:
  - `terminalNavigationItems`, `parseTerminalRouteTarget`, `getTerminalRoutePath` in `src/terminal/terminal-routes.ts`
- Reuse existing terminal layout/panel architecture:
  - `TerminalLayout` in `src/terminal/TerminalLayout.tsx`
  - `TerminalMobilePanels` in `src/terminal/TerminalMobilePanels.tsx`
- Reuse existing portfolio/home-ish content if available; otherwise create a small home section consistent with `AboutSection`, `WorkSection`, and `ContactSection`.

## Steps

- [ ] Create a new branch after plan approval.
- [ ] Add real `/terminal/home` route and content.
- [ ] Update boot redirect from `/` to `/terminal/home`.
- [ ] Update `terminalNavigationItems` so `/home` resolves to `/terminal/home` and displays as `home`/`home/`.
- [ ] Update route/path helpers and tests so terminal-only `/terminal` is distinct from home route `/terminal/home`.
- [ ] Update `TerminalLayout` naming/logic from `isHomeRoute` to terminal-only semantics where appropriate.
- [ ] Update mobile panel logic so route tab appears for `/terminal/home` and hides only for `/terminal`.
- [ ] Move editor control from left navigation into right header actions.
- [ ] Verify close browser pane navigates to `/terminal` and leaves terminal-only state.
- [ ] Verify clicking `home/`, `about/`, `work/`, or `contact/` reopens browser pane.

## Verification

- Run `bun run typecheck`.
- Run relevant tests, likely `bun run test` or targeted terminal route tests.
- Manual checks:
  - Visit `/`: boot intro redirects to `/terminal/home`.
  - Header left shows route links only: `home/ about/ work/ contact/`.
  - Header right shows editor plus language/settings/clock.
  - Closing browser pane changes URL to `/terminal` and shows only terminal if editor is also closed.
  - Clicking `home/` from `/terminal` opens `/terminal/home` browser pane.
  - Clicking `editor` opens editor pane without changing route unexpectedly.
  - Mobile panel tabs behave correctly for terminal-only, route-only, editor, and combined states.
