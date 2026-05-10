import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "#/design-system/cn";
import { DialogHost } from "#/dialogs/DialogHost";
import { EditorPane } from "#/editor/EditorPane";
import { AppHeader } from "#/layout/AppHeader";
import type { EditorFileName } from "../editor/editor-files";
import { getMobilePanel, TerminalMobilePanels } from "./TerminalMobilePanels";
import { TerminalPane } from "./TerminalPane";
import { TerminalRoutePane } from "./TerminalRoutePane";
import type { TerminalPanelName } from "./terminal-panel-types";
import { getTerminalRoutePath } from "./terminal-routes";
import { useTerminalController } from "./useTerminalController";

export function TerminalLayout({
	activeDialog,
	activeEditor,
	activeFileName,
	activePanel,
	children,
	highlightedEditorFile,
	openFileNames,
}: {
	activeDialog: "music" | undefined;
	activeEditor: "open" | undefined;
	activeFileName?: EditorFileName;
	activePanel: TerminalPanelName;
	children: ReactNode;
	highlightedEditorFile: ReactNode | null;
	openFileNames: Array<EditorFileName>;
}) {
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
						className={cn(mobilePanel === "terminal" ? "flex" : "hidden", "md:flex")}
						hasRightPanel={hasRightPanel}
						history={terminal.history}
						onSubmit={terminal.handleSubmit}
					/>
					{hasRightPanel ? (
						<aside
							className={cn(
								"min-w-0 flex-1 overflow-hidden text-xs md:grid md:w-1/2 md:flex-none",
								mobilePanel === "terminal" ? "hidden md:grid" : "grid",
								hasEditorPanel && !isHomeRoute ? "md:grid-rows-2" : "md:grid-rows-1",
							)}
						>
							{isHomeRoute ? null : (
								<TerminalRoutePane
									className={cn(mobilePanel === "route" ? "block" : "hidden", "md:block")}
									hasEditorPanel={hasEditorPanel}
								>
									{children}
								</TerminalRoutePane>
							)}
							{hasEditorPanel ? (
								<EditorPane
									activeFileName={activeFileName}
									className={cn(mobilePanel === "editor" ? "block" : "hidden", "md:block")}
									highlightedEditorFile={highlightedEditorFile}
									onCloseEditor={terminal.closeEditor}
									onCloseFile={terminal.closeFile}
									onOpenFile={(fileName) => {
										void terminal.openFile(fileName);
									}}
									onSelectFile={terminal.selectFile}
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
