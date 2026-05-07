import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/editor/$workspaceId/$projectId/changes")({
	component: EditorProjectChangesRoute,
});

function EditorProjectChangesRoute(): null {
	return null;
}
