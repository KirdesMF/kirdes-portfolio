import { cn } from "#/design-system/cn";
import type { EditorFileName } from "../editor/editor-files";
import type { TerminalPanelName } from "./terminal-panel-types";

export function getMobilePanel(
	activePanel: TerminalPanelName,
	hasEditorPanel: boolean,
): TerminalPanelName {
	if (activePanel === "editor" && hasEditorPanel) return "editor";
	if (activePanel === "route") return "route";

	return "terminal";
}

export function TerminalMobilePanels({
	activeFileName,
	activePanel,
	hasEditorPanel,
	onSelectPanel,
}: {
	activeFileName?: EditorFileName;
	activePanel: TerminalPanelName;
	hasEditorPanel: boolean;
	onSelectPanel: (panel: TerminalPanelName) => void;
}) {
	const panel = getMobilePanel(activePanel, hasEditorPanel);

	return (
		<div className="flex shrink-0 items-center gap-1 border-b border-border px-2 py-1 md:hidden">
			<button
				className={cn(
					"rounded border border-transparent px-2 py-1 text-tiny text-muted-foreground",
					panel === "terminal" && "border-primary/40 bg-primary/10 text-primary",
				)}
				type="button"
				onClick={() => onSelectPanel("terminal")}
			>
				terminal
			</button>
			<button
				className={cn(
					"rounded border border-transparent px-2 py-1 text-tiny text-muted-foreground",
					panel === "route" && "border-primary/40 bg-primary/10 text-primary",
				)}
				type="button"
				onClick={() => onSelectPanel("route")}
			>
				route
			</button>
			{hasEditorPanel ? (
				<button
					className={cn(
						"max-w-36 truncate rounded border border-transparent px-2 py-1 text-tiny text-muted-foreground",
						panel === "editor" && "border-primary/40 bg-primary/10 text-primary",
					)}
					type="button"
					onClick={() => onSelectPanel("editor")}
				>
					{activeFileName ?? "editor"}
				</button>
			) : null}
		</div>
	);
}
