import { useRouter, useRouterState } from "@tanstack/react-router";
import { type CSSProperties, type ReactNode, useRef } from "react";
import { cn } from "#/design-system/cn";
import { EditorPane } from "#/editor/EditorPane";
import type { EditorFileName } from "#/editor/editor-files";
import { AppHeader } from "#/layout/AppHeader";
import { HelpDialog } from "#/terminal/HelpDialog";
import { useTheme } from "#/theme/ThemeProvider";
import { getMobilePanel, TerminalMobilePanels } from "./TerminalMobilePanels";
import { TerminalPane } from "./TerminalPane";
import { TerminalResizeHandle } from "./TerminalResizeHandle";
import { TerminalRoutePane } from "./TerminalRoutePane";
import type { MaximizedPanel, TerminalPanelName } from "./terminal-panel-types";
import { getTerminalRoutePath } from "./terminal-routes";
import { setDialogSearch, showTerminalPanelSearch, toggleMaximizedSearch } from "./terminal-search-transitions";
import { useResizablePanels } from "./useResizablePanels";
import { useTerminalController } from "./useTerminalController";

export function TerminalLayout({
	activeEditor,
	activeFileName,
	activePanel,
	children,
	dialog,
	highlightedEditorFile,
	maximized,
	openFileNames,
}: {
	activeEditor: "open" | "closed" | undefined;
	activeFileName?: EditorFileName;
	activePanel: TerminalPanelName;
	children: ReactNode;
	dialog?: "settings" | "help";
	highlightedEditorFile: ReactNode | null;
	maximized?: MaximizedPanel;
	openFileNames: Array<EditorFileName>;
}) {
	const router = useRouter();
	const currentTerminalRoute = useRouterState({
		select: (state) => getTerminalRoutePath(state.location.pathname),
	});
	const isTerminalOnlyRoute = useRouterState({
		select: (state) => state.matches.at(-1)?.routeId === "/terminal",
	});
	const hasEditorPanel = activeEditor === "open";
	const hasRightPanel = !isTerminalOnlyRoute || hasEditorPanel;
	const mobilePanel = getMobilePanel(activePanel, hasEditorPanel, isTerminalOnlyRoute);
	const { setAppearance, appearance } = useTheme();
	const layoutRef = useRef<HTMLDivElement | null>(null);
	const rightPaneRef = useRef<HTMLElement | null>(null);
	const resizablePanels = useResizablePanels();
	const terminal = useTerminalController({
		activeFileName,
		currentTerminalRoute,
		isTerminalOnlyRoute,
		openFileNames,
		setMode: (mode) => setAppearance({ ...appearance, mode }),
	});

	function setHelpOpen(open: boolean) {
		void router.navigate({
			to: currentTerminalRoute,
			search: (previous) => setDialogSearch(previous, open ? "help" : undefined),
		});
	}

	function toggleMaximize(panel: MaximizedPanel) {
		void router.navigate({
			to: currentTerminalRoute,
			search: (previous) => toggleMaximizedSearch(previous, panel),
		});
	}

	const isTerminalHidden = maximized !== undefined;
	const isRouteMaximized = maximized === "route";
	const isEditorMaximized = maximized === "editor";
	const canResizeTerminal = hasRightPanel && maximized === undefined;
	const canResizeRouteEditor = hasEditorPanel && !isTerminalOnlyRoute && maximized === undefined;
	const layoutStyle = {
		"--terminal-pane-size": `${resizablePanels.terminalPaneSize}%`,
	} as CSSProperties;
	const rightPaneStyle = {
		"--route-pane-size": `${resizablePanels.routePaneSize}%`,
	} as CSSProperties;

	return (
		<div className="flex h-dvh flex-col">
			<AppHeader />
			<HelpDialog open={dialog === "help"} onOpenChange={setHelpOpen} />
			<TerminalMobilePanels
				activeFileName={activeFileName}
				activePanel={activePanel}
				hasEditorPanel={hasEditorPanel}
				isTerminalOnlyRoute={isTerminalOnlyRoute}
				onCloseEditor={terminal.closeEditor}
				onCloseRoute={() =>
					void router.navigate({
						search: showTerminalPanelSearch,
						to: "/terminal",
					})
				}
				onSelectPanel={terminal.setMobilePanel}
			/>
			<div className="flex min-h-0 flex-1" ref={layoutRef} style={layoutStyle}>
				<TerminalPane
					className={cn(
						mobilePanel === "terminal" ? "flex" : "hidden",
						"md:flex",
						canResizeTerminal && "md:basis-(--terminal-pane-size) md:flex-none",
						isTerminalHidden && "md:hidden",
					)}
					currentRoute={currentTerminalRoute}
					hasRightPanel={hasRightPanel}
					history={terminal.history}
					onSubmit={terminal.handleSubmit}
				/>
				{canResizeTerminal ? (
					<TerminalResizeHandle
						axis="horizontal"
						value={resizablePanels.terminalPaneSize}
						onKeyResize={(delta) =>
							resizablePanels.resizeByKeyboard({
								container: layoutRef.current,
								delta,
								target: "terminal",
							})
						}
						onResizeStart={(event) =>
							resizablePanels.startResize({
								axis: "horizontal",
								container: layoutRef.current,
								event,
								target: "terminal",
							})
						}
					/>
				) : null}
				{hasRightPanel ? (
					<aside
						className={cn(
							"min-w-0 flex-1 overflow-hidden text-xs",
							"md:grid",
							mobilePanel === "terminal" ? "hidden md:grid" : "grid",
							canResizeTerminal && "md:basis-[calc(100%-var(--terminal-pane-size))] md:flex-none",
							canResizeRouteEditor
								? "md:grid-rows-[var(--route-pane-size)_auto_minmax(0,1fr)]"
								: "md:grid-rows-1",
						)}
						ref={rightPaneRef}
						style={rightPaneStyle}
					>
						{isTerminalOnlyRoute ? null : (
							<TerminalRoutePane
								className={cn(
									mobilePanel === "route" ? "flex" : "hidden",
									"md:flex",
									isEditorMaximized && "md:hidden",
								)}
								hasEditorPanel={hasEditorPanel && !isEditorMaximized}
								isMaximized={isRouteMaximized}
								onToggleMaximize={() => toggleMaximize("route")}
							>
								{children}
							</TerminalRoutePane>
						)}
						{canResizeRouteEditor ? (
							<TerminalResizeHandle
								axis="vertical"
								value={resizablePanels.routePaneSize}
								onKeyResize={(delta) =>
									resizablePanels.resizeByKeyboard({
										container: rightPaneRef.current,
										delta,
										target: "route",
									})
								}
								onResizeStart={(event) =>
									resizablePanels.startResize({
										axis: "vertical",
										container: rightPaneRef.current,
										event,
										target: "route",
									})
								}
							/>
						) : null}
						{hasEditorPanel ? (
							<EditorPane
								activeFileName={activeFileName}
								className={cn(
									mobilePanel === "editor" ? "flex" : "hidden",
									"md:flex",
									isRouteMaximized && "md:hidden",
								)}
								highlightedEditorFile={highlightedEditorFile}
								isMaximized={isEditorMaximized}
								onCloseEditor={terminal.closeEditor}
								onCloseFile={terminal.closeFile}
								onOpenFile={(fileName) => {
									void terminal.openFile(fileName);
								}}
								onSelectFile={terminal.selectFile}
								onToggleMaximize={() => toggleMaximize("editor")}
								openFileNames={openFileNames}
							/>
						) : null}
					</aside>
				) : null}
			</div>
		</div>
	);
}
