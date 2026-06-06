import { useRouter, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "#/design-system/cn";
import { EditorPane } from "#/editor/EditorPane";
import type { EditorFileName } from "#/editor/editor-files";
import { AppHeader } from "#/layout/AppHeader";
import { HelpDialog } from "#/terminal/HelpDialog";
import { useTheme } from "#/theme/ThemeProvider";
import { getMobilePanel, TerminalMobilePanels } from "./TerminalMobilePanels";
import { TerminalPane } from "./TerminalPane";
import { TerminalRoutePane } from "./TerminalRoutePane";
import type { MaximizedPanel, TerminalPanelName } from "./terminal-panel-types";
import { getTerminalRoutePath } from "./terminal-routes";
import { setDialogSearch, toggleMaximizedSearch } from "./terminal-search-transitions";
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
	activeEditor: "open" | undefined;
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
	const isHomeRoute = useRouterState({
		select: (state) => state.matches.at(-1)?.routeId === "/terminal",
	});
	const hasEditorPanel = activeEditor === "open";
	const hasRightPanel = !isHomeRoute || hasEditorPanel;
	const mobilePanel = getMobilePanel(activePanel, hasEditorPanel, isHomeRoute);
	const { setAppearance, appearance } = useTheme();
	const terminal = useTerminalController({
		activeFileName,
		currentTerminalRoute,
		isHomeRoute,
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

	return (
		<div className="flex h-dvh flex-col">
			<AppHeader />
			<HelpDialog open={dialog === "help"} onOpenChange={setHelpOpen} />
			<TerminalMobilePanels
				activeFileName={activeFileName}
				activePanel={activePanel}
				hasEditorPanel={hasEditorPanel}
				isHomeRoute={isHomeRoute}
				onSelectPanel={terminal.setMobilePanel}
			/>
			<div className="flex min-h-0 flex-1">
				<TerminalPane
					className={cn(
						mobilePanel === "terminal" ? "flex" : "hidden",
						"md:flex",
						isTerminalHidden && "md:hidden",
					)}
					currentRoute={currentTerminalRoute}
					hasRightPanel={hasRightPanel}
					history={terminal.history}
					onSubmit={terminal.handleSubmit}
				/>
				{hasRightPanel ? (
					<aside
						className={cn(
							"min-w-0 flex-1 overflow-hidden text-xs",
							"md:grid",
							mobilePanel === "terminal" ? "hidden md:grid" : "grid",
							!isTerminalHidden && "md:w-1/2 md:flex-none",
							hasEditorPanel && !isHomeRoute && !isRouteMaximized && !isEditorMaximized
								? "md:grid-rows-2"
								: "md:grid-rows-1",
						)}
					>
						{isHomeRoute ? null : (
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
