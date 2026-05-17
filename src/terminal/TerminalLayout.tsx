import { useRouter, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "#/design-system/cn";
import { DialogHost } from "#/dialogs/DialogHost";
import { EditorPane } from "#/editor/EditorPane";
import type { EditorFileName } from "#/editor/editor-files";
import { AppHeader } from "#/layout/AppHeader";
import { getMobilePanel, TerminalMobilePanels } from "./TerminalMobilePanels";
import { TerminalPane } from "./TerminalPane";
import { TerminalRoutePane } from "./TerminalRoutePane";
import type { MaximizedPanel, TerminalPanelName } from "./terminal-panel-types";
import { getTerminalRoutePath } from "./terminal-routes";
import { useTerminalController } from "./useTerminalController";

export function TerminalLayout({
	activeDialog,
	activeEditor,
	activeFileName,
	activePanel,
	children,
	highlightedEditorFile,
	maximized,
	openFileNames,
}: {
	activeDialog: "music" | undefined;
	activeEditor: "open" | undefined;
	activeFileName?: EditorFileName;
	activePanel: TerminalPanelName;
	children: ReactNode;
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
	const terminal = useTerminalController({
		activeFileName,
		currentTerminalRoute,
		isHomeRoute,
		openFileNames,
	});

	function toggleMaximize(panel: MaximizedPanel) {
		const isCurrentlyMaximized = maximized === panel;

		router.navigate({
			to: currentTerminalRoute,
			search: (previous) => ({
				activeFile: previous.activeFile,
				dialog: previous.dialog,
				editor: previous.editor,
				files: previous.files ?? [],
				maximized: isCurrentlyMaximized ? undefined : panel,
				panel: previous.panel ?? "terminal",
			}),
		});
	}

	const isTerminalHidden = maximized !== undefined;
	const isRouteMaximized = maximized === "route";
	const isEditorMaximized = maximized === "editor";

	return (
		<>
			<DialogHost dialog={activeDialog} onClose={terminal.closeDialog} />
			<div className="flex h-dvh flex-col">
				<AppHeader />
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
		</>
	);
}
