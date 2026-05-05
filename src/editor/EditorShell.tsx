import { useSearch } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { cn } from "#/design-system/cn";

const editorShellGridClassNameByPanelState = {
	closed: "grid-cols-editor-shell-closed",
	left: "grid-cols-editor-shell-left",
	right: "grid-cols-editor-shell-right",
	both: "grid-cols-editor-shell-both",
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
			<div className="min-w-0 overflow-hidden">{children}</div>
			<aside className="min-w-0 overflow-hidden border-l border-border bg-sidebar">
				<div className="w-80 p-2 text-muted-foreground text-xs">Right panel</div>
			</aside>
		</div>
	);
}
