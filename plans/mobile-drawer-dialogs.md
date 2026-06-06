# Mobile Drawer Dialogs Plan

## Context

The app currently has a `#/design-system/dialog` primitive built on `@base-ui/react/dialog`. `HelpDialog` and `SettingsDialog` both render centered dialog popups, which work on desktop but are less suitable on mobile. The requested change is to add a reusable `#/design-system/drawer` primitive using Base UI Drawer gesture support, then render Help and Settings as bottom drawers on mobile while preserving dialog behavior on larger screens.

## Approach

- Add a new `src/design-system/drawer.tsx` primitive modeled after the existing `dialog.tsx` API and the referenced Coss/Base UI drawer pattern.
- Use `@base-ui/react/drawer` gesture features rather than custom pointer handlers:
  - `Root` with `swipeDirection="down"` for bottom drawers.
  - `Backdrop`, `Viewport`, and `Popup` with Base UI gesture CSS variables such as `--drawer-swipe-movement-y`, `--drawer-swipe-progress`, and `--drawer-swipe-strength`.
  - `touch-none` on gesture-controlled layers and `touch-auto` on scrollable content.
  - Optional visible drag handle/bar for mobile affordance.
- Introduce a responsive dialog/drawer wrapper pattern for Help and Settings using a real media-query state, not only CSS hiding:
  - Add/reuse a small `useMediaQuery`/`useIsMobile` helper based on `window.matchMedia("(max-width: 767px)")` or `"(min-width: 768px)"`.
  - Subscribe to the media query `change` event so resizing between mobile and desktop swaps the active primitive immediately.
  - Render only one active shell at a time (`Drawer` on mobile, `Dialog` on desktop) so focus traps, portals, aria modal state, Escape handling, and `onOpenChange` do not conflict.
  - Keep the same `open` and `onOpenChange` props across both shells; if the viewport is resized while open, the current shell unmounts and the new shell mounts with the same open state.
- Factor shared Help/Settings inner content into local components so the content is not duplicated across desktop and mobile shells.
- Add tests that cover rendering, open-state wiring, resize-driven shell switching, mobile drawer markup/classes, and interactive behavior for Settings selections.

## Files to modify

- `src/design-system/drawer.tsx` — new Base UI Drawer primitive.
- `src/design-system/useMediaQuery.ts` or `src/design-system/useIsMobile.ts` — new responsive hook for subscribing to viewport changes.
- `src/terminal/HelpDialog.tsx` — choose mobile drawer or desktop dialog shell via the responsive hook and shared content component.
- `src/settings-dialog.tsx` — choose mobile drawer or desktop dialog shell via the responsive hook and shared content component.
- Test files to add, likely:
  - `src/design-system/drawer.test.tsx`
  - `src/terminal/HelpDialog.test.tsx`
  - `src/settings-dialog.test.tsx`

## Reuse

- `src/design-system/dialog.tsx` — reuse API style, type patterns, `cn`, Base UI portal/backdrop/title/description wrappers.
- `src/design-system/cn.ts` — compose Tailwind classes.
- Coss drawer reference — reuse the Base UI gesture approach: `swipeDirection`, `Viewport`, `Popup`, `Backdrop`, `touch-none`/`touch-auto`, and drawer CSS variables.
- Existing Help/Settings content and message functions in:
  - `src/terminal/HelpDialog.tsx`
  - `src/settings-dialog.tsx`
- Existing theme provider/types for Settings tests:
  - `src/theme/ThemeProvider.tsx`
  - `src/theme/themeTypes.ts`

## Steps

- [ ] Create `src/design-system/drawer.tsx` exporting `Drawer`, `DrawerTrigger`, `DrawerClose`, `DrawerContent`, `DrawerTitle`, `DrawerDescription`, and a small `DrawerHandle`/bar helper if useful.
- [ ] Implement the drawer as a bottom sheet by default, with `BaseDrawer.Root swipeDirection="down"` and gesture-aware popup/backdrop classes.
- [ ] Ensure drawer content supports scrolling on mobile by making the popup a constrained flex column and using `touch-auto overflow-y-auto` for the content area.
- [ ] Add a responsive hook (`useMediaQuery` or `useIsMobile`) that initializes from `matchMedia`, listens for `change`, cleans up listeners on unmount, and returns a deterministic fallback when `window` is unavailable.
- [ ] Refactor `HelpDialog` into shared inner content plus desktop `Dialog` shell and mobile `Drawer` shell, rendering only the shell selected by the responsive hook.
- [ ] Refactor `SettingsDialog` the same way, keeping theme selection logic unchanged.
- [ ] Add tests for the drawer primitive’s open rendering, accessible title/description support, and gesture-related classes/data slots.
- [ ] Add tests for the responsive hook or component behavior by mocking `window.matchMedia`, dispatching a `change` event, and asserting open dialogs switch between desktop dialog and mobile drawer without losing content/open state.
- [ ] Add tests for Help and Settings to verify `onOpenChange`/settings selections still work in the active shell.
- [ ] Run typecheck, lint/check, and tests.

## Verification

- `bun run test`
- `bun run typecheck`
- `bun run check`
- Manual responsive check:
  - Open Help and Settings on desktop and confirm they use centered dialogs.
  - Resize below `md` while still open and confirm the UI switches to a bottom drawer without closing.
  - Resize back to desktop while still open and confirm it switches back to a centered dialog without duplicate overlays/focus traps.
  - On mobile, confirm swipe-down gesture closes/moves the drawer naturally.
  - Confirm content scrolls inside the drawer without fighting the gesture.
