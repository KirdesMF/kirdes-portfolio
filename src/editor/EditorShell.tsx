import { Link, useSearch } from "@tanstack/react-router";
import { ChevronDown, Terminal } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "#/design-system/cn";
import { toggleTerminalSearch } from "#/editor/editor-search";

const editorShellGridClassNameByPanelState = {
	closed: "grid-cols-editor-shell-closed",
	left: "grid-cols-editor-shell-left",
	right: "grid-cols-editor-shell-right",
	both: "grid-cols-editor-shell-both",
} as const;

const editorContentGridClassNameByTerminalState = {
	closed: "grid-rows-editor-terminal-closed",
	open: "grid-rows-editor-terminal-open",
} as const;

type EditorShellPanelState = keyof typeof editorShellGridClassNameByPanelState;

function getEditorShellPanelState({
	isLeftPanelOpen,
	isRightPanelOpen,
}: {
	isLeftPanelOpen: boolean;
	isRightPanelOpen: boolean;
}): EditorShellPanelState {
	if (isLeftPanelOpen && isRightPanelOpen) return "both";
	if (isLeftPanelOpen) return "left";
	if (isRightPanelOpen) return "right";
	return "closed";
}

export function EditorShell({ children }: { children: ReactNode }): ReactNode {
	const search = useSearch({ from: "/editor" });
	const panelState = getEditorShellPanelState({
		isLeftPanelOpen: search.left === "open",
		isRightPanelOpen: search.right === "open",
	});
	const terminalState = search.terminal === "open" ? "open" : "closed";

	return (
		<div
			className={cn(
				"grid min-h-0 overflow-hidden transition-[grid-template-columns] duration-200 ease-editor-shell motion-reduce:transition-none",
				editorShellGridClassNameByPanelState[panelState],
			)}
		>
			<aside className="min-w-0 overflow-hidden border-r border-border bg-sidebar">
				<div className="w-70 p-2 text-muted-foreground text-xs">Left panel</div>
			</aside>
			<div
				className={cn(
					"grid min-w-0 overflow-hidden transition-[grid-template-rows] duration-200 ease-editor-shell motion-reduce:transition-none",
					editorContentGridClassNameByTerminalState[terminalState],
				)}
			>
				<div className="min-h-0 overflow-hidden">{children}</div>
				<section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden border-t border-border bg-sidebar">
					<header className="flex h-7 items-center justify-between border-b border-border px-2 text-muted-foreground text-xs">
						<div className="flex items-center gap-1.5">
							<Terminal className="size-3.5" />
							<span>Terminal</span>
						</div>
						<Link
							aria-label="Close terminal panel"
							className="inline-flex size-5 items-center justify-center rounded-sm transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
							from="/editor"
							search={toggleTerminalSearch}
						>
							<ChevronDown className="size-3.5" />
						</Link>
					</header>
					<div className="min-h-0 overflow-hidden p-2 text-muted-foreground text-xs">Terminal</div>
				</section>
			</div>
			<aside className="min-w-0 overflow-hidden border-l border-border bg-sidebar">
				<div className="w-80 p-2 text-muted-foreground text-xs">Right panel</div>
			</aside>
		</div>
	);
}
