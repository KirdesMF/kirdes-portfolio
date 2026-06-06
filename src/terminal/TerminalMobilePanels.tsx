import { X } from "lucide-react";
import { cn } from "#/design-system/cn";
import { type EditorFileName, getDisplayFileName } from "#/editor/editor-files";
import { m } from "#/paraglide/messages";
import type { TerminalPanelName } from "./terminal-panel-types";

export function getMobilePanel(
	activePanel: TerminalPanelName,
	hasEditorPanel: boolean,
	isHomeRoute: boolean,
): TerminalPanelName {
	if (activePanel === "editor" && hasEditorPanel) return "editor";
	if (activePanel === "route" && !isHomeRoute) return "route";

	return "terminal";
}

export function TerminalMobilePanels({
	activeFileName,
	activePanel,
	hasEditorPanel,
	isHomeRoute,
	onCloseEditor,
	onCloseRoute,
	onSelectPanel,
}: {
	activeFileName?: EditorFileName;
	activePanel: TerminalPanelName;
	hasEditorPanel: boolean;
	isHomeRoute: boolean;
	onCloseEditor: () => void;
	onCloseRoute: () => void;
	onSelectPanel: (panel: TerminalPanelName) => void;
}) {
	const panel = getMobilePanel(activePanel, hasEditorPanel, isHomeRoute);
	const editorLabel = activeFileName
		? getDisplayFileName(activeFileName)
		: m.mobile_panel_editor_fallback();

	return (
		<div className="flex h-status-bar shrink-0 items-center border-b border-border bg-background/60 md:hidden">
			<div
				className={cn(
					"flex h-full shrink-0 items-center border-r border-border text-tiny text-muted-foreground hover:bg-muted/30 hover:text-foreground",
					panel === "terminal" && "bg-muted/40 text-foreground",
				)}
			>
				<button
					className="flex h-full min-w-0 items-center gap-1.5 px-3"
					type="button"
					onClick={() => onSelectPanel("terminal")}
				>
					{m.mobile_panel_terminal()}
				</button>
			</div>
			{isHomeRoute ? null : (
				<div
					className={cn(
						"flex h-full shrink-0 items-center border-r border-border text-tiny text-muted-foreground hover:bg-muted/30 hover:text-foreground",
						panel === "route" && "bg-muted/40 text-foreground",
					)}
				>
					<button
						className="flex h-full min-w-0 items-center gap-1.5 px-3"
						type="button"
						onClick={() => onSelectPanel("route")}
					>
						{m.mobile_panel_route()}
					</button>
					<button
						aria-label="Close route"
						className="flex h-full items-center px-2 text-muted-foreground hover:text-foreground"
						type="button"
						onClick={onCloseRoute}
					>
						<X className="size-3" />
					</button>
				</div>
			)}
			{hasEditorPanel ? (
				<div
					className={cn(
						"flex h-full max-w-40 shrink-0 items-center border-r border-border text-tiny text-muted-foreground hover:bg-muted/30 hover:text-foreground",
						panel === "editor" && "bg-muted/40 text-foreground",
					)}
				>
					<button
						className="flex h-full min-w-0 items-center gap-1.5 truncate px-3"
						type="button"
						onClick={() => onSelectPanel("editor")}
					>
						<span className="truncate">{editorLabel}</span>
					</button>
					<button
						aria-label="Close editor"
						className="flex h-full items-center px-2 text-muted-foreground hover:text-foreground"
						type="button"
						onClick={onCloseEditor}
					>
						<X className="size-3" />
					</button>
				</div>
			) : null}
		</div>
	);
}
