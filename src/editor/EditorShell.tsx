import { Link, useSearch } from "@tanstack/react-router";
import { ChevronDown, Maximize2, Minimize2, Terminal } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "#/design-system/cn";
import { EditorExplorer } from "#/editor/EditorExplorer";
import { EditorRightPanel } from "#/editor/EditorRightPanel";
import { closeTerminalSearch, toggleTerminalFullscreenSearch } from "#/editor/editor-search";

const editorShellGridClassNameByPanelState = {
	closed: "grid-cols-editor-shell-closed",
	left: "grid-cols-editor-shell-left",
	right: "grid-cols-editor-shell-right",
	both: "grid-cols-editor-shell-both",
} as const;

const editorContentGridClassNameByTerminalState = {
	closed: "grid-rows-editor-terminal-closed",
	open: "grid-rows-editor-terminal-open",
	fullscreen: "grid-rows-editor-terminal-fullscreen",
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
	const isTerminalFullscreen = search.terminal === "fullscreen";

	return (
		<div
			className={cn(
				"grid min-h-0 overflow-hidden transition-editor-shell-columns duration-200 ease-editor-shell motion-reduce:transition-none",
				editorShellGridClassNameByPanelState[panelState],
			)}
		>
			<aside className="min-w-0 overflow-hidden border-e border-border bg-sidebar">
				<EditorExplorer />
			</aside>
			<div
				className={cn(
					"grid min-w-0 grid-areas-editor-center overflow-hidden transition-editor-shell-rows duration-200 ease-editor-shell motion-reduce:transition-none",
					editorContentGridClassNameByTerminalState[search.terminal],
				)}
			>
				<div className="area-editor-main min-h-0 overflow-hidden">{children}</div>
				<section className="area-editor-terminal grid min-h-0 grid-rows-editor-panel overflow-hidden border-t border-border bg-sidebar">
					<header className="flex h-7 items-center justify-between border-b border-border px-2 text-muted-foreground text-xs">
						<div className="flex items-center gap-1.5">
							<Terminal className="size-3.5" />
							<span>Terminal</span>
						</div>
						<div className="flex items-center gap-1">
							<Link
								aria-label={
									isTerminalFullscreen ? "Restore terminal panel" : "Expand terminal panel"
								}
								className="inline-flex size-5 items-center justify-center rounded-sm transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
								search={toggleTerminalFullscreenSearch}
								to="."
							>
								{isTerminalFullscreen ? (
									<Minimize2 className="size-3.5" />
								) : (
									<Maximize2 className="size-3.5" />
								)}
							</Link>
							<Link
								aria-label="Close terminal panel"
								className="inline-flex size-5 items-center justify-center rounded-sm transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
								search={closeTerminalSearch}
								to="."
							>
								<ChevronDown className="size-3.5" />
							</Link>
						</div>
					</header>
					<div className="min-h-0 overflow-hidden p-2 text-muted-foreground text-xs">Terminal</div>
				</section>
			</div>
			<aside className="min-w-0 overflow-hidden border-s border-border bg-sidebar">
				<EditorRightPanel />
			</aside>
		</div>
	);
}
