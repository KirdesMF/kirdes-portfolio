# File organization and naming inventory

Browser:
- `src/portfolio/` -> `src/browser/`
- `src/browser/AvailabilityStatus.tsx` -> `src/browser/availability-status.tsx`
- `src/browser/SourceLinks.tsx` -> `src/browser/source-links.tsx`
- `src/browser/about/AboutSection.tsx` -> `src/browser/about/about-section.tsx`
- `src/browser/contact/ContactSection.tsx` -> `src/browser/contact/contact-section.tsx`
- `src/browser/home/HomeSection.tsx` -> `src/browser/home/home-section.tsx`
- `src/browser/work/WorkDetailSection.tsx` -> `src/browser/work/work-detail-section.tsx`
- `src/browser/work/WorkSection.tsx` -> `src/browser/work/work-section.tsx`
- `src/terminal/TerminalRoutePane.tsx` -> `src/browser/browser-pane.tsx`

Editor:
- `src/ascii-banner/` -> `src/editor/ascii-banner/`
- `src/editor/ascii-banner/AsciiBanner.tsx` -> `src/editor/ascii-banner/ascii-banner.tsx`
- `src/editor/ascii-banner/bannerArt.ts` -> `src/editor/ascii-banner/banner-art.ts`
- `src/editor/ascii-banner/bannerConfig.ts` -> `src/editor/ascii-banner/banner-config.ts`
- `src/editor/ascii-banner/drawAsciiBanner.ts` -> `src/editor/ascii-banner/draw-ascii-banner.ts`
- `src/editor/ascii-banner/useDeviceShimmer.ts` -> `src/editor/ascii-banner/use-device-shimmer.ts`
- `src/editor/EditorPane.tsx` -> `src/editor/editor-pane.tsx`
- `src/editor/ReadOnlyFileEditor.tsx` -> `src/editor/read-only-file-editor.tsx`

Terminal:
- `src/terminal/HelpDialog.tsx` -> `src/terminal/help-dialog.tsx`
- `src/terminal/HelpDialog.test.tsx` -> `src/terminal/help-dialog.test.tsx`
- `src/terminal/TerminalFooter.tsx` -> `src/terminal/terminal-footer.tsx`
- `src/terminal/TerminalLayout.tsx` -> `src/terminal/terminal-layout.tsx`
- `src/terminal/TerminalMobilePanels.tsx` -> `src/terminal/terminal-mobile-panels.tsx`
- `src/terminal/TerminalPane.tsx` -> `src/terminal/terminal-pane.tsx`
- `src/terminal/TerminalPrompt.tsx` -> `src/terminal/terminal-prompt.tsx`
- `src/terminal/TerminalResizeHandle.tsx` -> `src/terminal/terminal-resize-handle.tsx`
- `src/terminal/TerminalResizeHandle.test.tsx` -> `src/terminal/terminal-resize-handle.test.tsx`
- `src/terminal/TerminalRouteList.tsx` -> `src/terminal/terminal-route-list.tsx`
- `src/terminal/TerminalSessionHeader.tsx` -> `src/terminal/terminal-session-header.tsx`
- `src/terminal/terminal-panel-types.ts` -> `src/terminal/terminal-panel.types.ts`
- `src/terminal/commands/types.ts` -> `src/terminal/commands/command.types.ts`
- `src/terminal/useCommandHistory.ts` -> `src/terminal/use-command-history.ts`
- `src/terminal/useResizablePanels.ts` -> `src/terminal/use-resizable-panels.ts`
- `src/terminal/useResizablePanels.test.tsx` -> `src/terminal/use-resizable-panels.test.tsx`
- `src/terminal/useTerminalController.tsx` -> `src/terminal/use-terminal-controller.tsx`
- `src/terminal/useTerminalSearchActions.ts` -> `src/terminal/use-terminal-search-actions.ts`

Shared:
- `src/design-system/Kbd.tsx` -> `src/design-system/kbd.tsx`
- `src/design-system/Menu.tsx` -> `src/design-system/menu.tsx`
- `src/design-system/Popover.tsx` -> `src/design-system/popover.tsx`
- `src/design-system/ScrambleText.tsx` -> `src/design-system/scramble-text.tsx`
- `src/design-system/Separator.tsx` -> `src/design-system/separator.tsx`
- `src/design-system/Tooltip.tsx` -> `src/design-system/tooltip.tsx`
- `src/design-system/useMediaQuery.ts` -> `src/design-system/use-media-query.ts`
- `src/design-system/useScrambleRef.ts` -> `src/design-system/use-scramble-ref.ts`
- `src/layout/AppHeader.tsx` -> `src/layout/app-header.tsx`
- `src/layout/Clock.tsx` -> `src/layout/clock.tsx`
- `src/test-utils/matchMedia.ts` -> `src/test-utils/match-media.ts`
- `src/theme/ThemeProvider.tsx` -> `src/theme/theme-provider.tsx`
- `src/theme/ThemeToggle.tsx` -> `src/theme/theme-toggle.tsx`
- `src/theme/themeBootScript.ts` -> `src/theme/theme-boot-script.ts`
- `src/theme/themeTypes.ts` -> `src/theme/theme.types.ts`
- `src/theme/themeTypes.test.ts` -> `src/theme/theme.types.test.ts`
