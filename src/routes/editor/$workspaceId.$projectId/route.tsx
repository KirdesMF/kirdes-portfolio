import { createFileRoute, Outlet } from "@tanstack/react-router";
import { GitBranch } from "lucide-react";

import { getEditorProjectInWorkspace, isEditorWorkspaceValue } from "#/editor/editor-projects";

export const Route = createFileRoute("/editor/$workspaceId/$projectId")({
	component: EditorProjectRoute,
});

function EditorProjectRoute(): React.ReactNode {
	const { projectId, workspaceId } = Route.useParams();
	const project = isEditorWorkspaceValue(workspaceId)
		? getEditorProjectInWorkspace(workspaceId, projectId)
		: undefined;

	if (!project) {
		return (
			<main className="grid h-full place-items-center overflow-hidden bg-background p-6 text-muted-foreground text-sm">
				Unknown project: {workspaceId}/{projectId}
			</main>
		);
	}

	return (
		<main className="grid h-full grid-rows-editor-panel overflow-hidden bg-background">
			<header className="flex h-10 items-center justify-between border-b border-border px-3 text-sm">
				<div className="min-w-0">
					<h1 className="truncate font-medium">{project.label}</h1>
					<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
						<GitBranch className="size-3" />
						<span className="truncate">{project.branch}</span>
					</div>
				</div>
				<div className="flex items-center gap-2 text-xs">
					<span className="text-selected-folder-indicator">+{project.additions}</span>
					<span className="text-destructive">-{project.deletions}</span>
				</div>
			</header>
			<Outlet />
		</main>
	);
}
