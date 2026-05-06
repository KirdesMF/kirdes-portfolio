import { createFileRoute, redirect } from "@tanstack/react-router";

import { getEditorWorkspace, isEditorProjectInWorkspace } from "#/editor/editor-projects";

export const Route = createFileRoute("/editor/")({
	beforeLoad: ({ search }) => {
		const workspace = getEditorWorkspace("1");
		const rememberedProjectId = search.selected[workspace.id];
		const projectId =
			rememberedProjectId && isEditorProjectInWorkspace(rememberedProjectId, workspace.id)
				? rememberedProjectId
				: workspace.projects[0]?.id;

		if (!projectId) return;

		throw redirect({
			params: { projectId, workspaceId: workspace.id },
			search: {
				...search,
				open: search.open?.includes(projectId) ? search.open : [...(search.open ?? []), projectId],
			},
			to: "/editor/$workspaceId/$projectId",
		});
	},
});
