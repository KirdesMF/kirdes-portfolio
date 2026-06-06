# Mobile navigation: replace inline links with drawer

## Context

On mobile the `AppHeader` shows all route links inline with chevron segments, which eats up horizontal space and overflows on small screens. The existing `Drawer` component (bottom-sheet pattern) is already built. We need to:

- On mobile (`md:hidden`): show only a "menu" chevron segment + the editor icon in the header
- Clicking "menu" opens a drawer containing the routes in a vertical layout
- The vertical route list uses the same chevron-segment styling (alternating primary/muted, alternating direction)
- The drawer content uses `border-2 border-border border-glow` matching the dialog styling

## Approach

### 1. Update `AppHeader.tsx`

The current `leftItems` array builds all route links inline. Split into two groups:

- **Desktop** (`hidden md:flex`) — keep current behavior: all horizontal chevron segments
- **Mobile** (`md:hidden`) — only two items:
  1. A "menu" chevron segment (variant `primary`) containing a button that opens a `Drawer`
  2. The existing editor link segment

Use the `Drawer` (bottom-sheet) from `#/design-system/drawer` with `swipeDirection="down"`.

### 2. Create `MobileNavDrawer` content

Inside the drawer, render a vertical list of routes. Each route row is a chevron segment:
- Alternating `"primary"` / `"muted"` variants (same as horizontal header)
- Alternating chevron directions: first → right, second → left, third → right, last → left
- Each row is a `Link` (full-width, using `showRoutePanelSearch`)
- The drawer content container uses `rounded border-2 border-border border-glow bg-popover p-4`

The Drawer already has a handle bar (`DrawerHandle`). The nav rows go below it.

### 3. Styling

Drawer content wrapper:
```
rounded border-2 border-border border-glow bg-popover p-4 text-popover-foreground
```

Each route row mirrors the chevron pattern from `StatusSegment`:
- Background: `bg-status-primary` or `bg-status-muted`
- Text: `text-status-*-foreground`
- Chevron fill: `fill-status-primary` or `fill-status-muted`
- Chevron polygon points: `"0,0 16,10 0,20"` for right, `"16,0 0,10 16,20"` for left
- Negative margin overlap (`-ms-2.5` or `-me-2.5`) between segments

The drawer dismisses on route click (auto-close via `onOpenChange`).

### Additional details

- Chevrons in the drawer are wrapped in `max-h-8` containers to cap their size
- Routes are laid out in a `grid gap-2.5 p-2.5` instead of overlapping negative margins
- The home route (label `~`) displays as `terminal` in the drawer

## Files to modify

- `src/layout/AppHeader.tsx` — add mobile drawer trigger, import `Drawer` components, conditionally render nav
- `src/layout/AppHeaderNavigation.tsx` — repurpose or create `MobileNavDrawer` component

## Steps

- [x] Import `Drawer`, `DrawerTrigger`, `DrawerContent`, `DrawerHandle` in `AppHeader.tsx`
- [x] Add mobile-only "menu" chevron segment + editor link (wrapped in `md:hidden`)
- [x] Keep existing desktop nav in `hidden md:flex`
- [x] Build `MobileNavDrawer` component with vertical chevron rows
- [x] Wire drawer open/close state (trigger on "menu" click, close on route navigation)
- [x] Style drawer content with `border-2 border-border border-glow`
- [x] Cap chevron size with `max-h-8` wrapper
- [x] Use `grid gap-2.5` instead of negative margins
- [x] Show "terminal" for home route label
- [x] Run `bun run check` and `bun run test`

## Verification

- On narrow viewport (< 768px): header shows only "menu" chevron + editor icon
- Clicking "menu" opens a bottom-sheet drawer with route links
- Routes have alternating colors and chevron directions
- Clicking a route navigates and closes the drawer
- Desktop view remains unchanged
- `bun run check` passes, tests pass
