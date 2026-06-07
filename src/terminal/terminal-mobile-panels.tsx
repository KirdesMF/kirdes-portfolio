import { X } from "lucide-react";
import { cn } from "#/design-system/cn";
import { type EditorFileName, getDisplayFileName } from "#/editor/editor-files";
import { m } from "#/paraglide/messages";
import type { TerminalPanelName } from "./terminal-panel.types";

export function getMobilePanel(
	activePanel: TerminalPanelName,
	hasEditorPanel: boolean,
	isTerminalOnlyRoute: boolean,
): TerminalPanelName {
	if (activePanel === "editor" && hasEditorPanel) return "editor";
	if (activePanel === "route" && !isTerminalOnlyRoute) return "route";

	return "terminal";
}

export function TerminalMobilePanels({
	activeFileName,
	activePanel,
	hasEditorPanel,
	isTerminalOnlyRoute,
	onCloseEditor,
	onCloseRoute,
	onSelectPanel,
}: {
	activeFileName?: EditorFileName;
	activePanel: TerminalPanelName;
	hasEditorPanel: boolean;
	isTerminalOnlyRoute: boolean;
	onCloseEditor: () => void;
	onCloseRoute: () => void;
	onSelectPanel: (panel: TerminalPanelName) => void;
}) {
	const panel = getMobilePanel(activePanel, hasEditorPanel, isTerminalOnlyRoute);
	const editorLabel = activeFileName
		? getDisplayFileName(activeFileName)
		: m.mobile_panel_editor_fallback();

	return (
		<div className="flex min-h-status-bar shrink-0 items-center gap-2 overflow-x-auto border-b border-border bg-background/60 px-2 py-1 md:hidden">
			<MobilePanelBadge
				active={panel === "terminal"}
				label={m.mobile_panel_terminal()}
				onSelect={() => onSelectPanel("terminal")}
			/>
			{isTerminalOnlyRoute ? null : (
				<MobilePanelBadge
					active={panel === "route"}
					label={m.mobile_panel_route()}
					onClose={onCloseRoute}
					onSelect={() => onSelectPanel("route")}
				/>
			)}
			{hasEditorPanel ? (
				<MobilePanelBadge
					active={panel === "editor"}
					label={editorLabel}
					onClose={onCloseEditor}
					onSelect={() => onSelectPanel("editor")}
				/>
			) : null}
		</div>
	);
}

function MobilePanelBadge({
	active,
	label,
	onClose,
	onSelect,
}: {
	active: boolean;
	label: string;
	onClose?: () => void;
	onSelect: () => void;
}) {
	return (
		<div
			className={cn(
				"flex h-5 max-w-40 shrink-0 items-center overflow-hidden rounded-sm border border-border bg-background/80 text-tiny text-muted-foreground shadow-sm",
				active && "border-primary/50 bg-primary/10 text-foreground",
			)}
		>
			<button
				className="flex h-full min-w-0 items-center gap-1.5 px-2"
				type="button"
				onClick={onSelect}
			>
				<span
					className={cn(
						"size-1.5 shrink-0 rounded-full bg-muted-foreground/40",
						active && "animate-pulse bg-primary",
					)}
				/>
				<span className="truncate">{label}</span>
			</button>
			{onClose ? (
				<button
					aria-label={`Close ${label}`}
					className="flex h-full shrink-0 items-center px-1.5 text-muted-foreground hover:text-foreground"
					type="button"
					onClick={onClose}
				>
					<X className="size-3" />
				</button>
			) : null}
		</div>
	);
}
