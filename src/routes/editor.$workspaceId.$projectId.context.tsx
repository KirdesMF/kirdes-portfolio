import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/editor/$workspaceId/$projectId/context")({
	component: EditorProjectContextRoute,
});

function EditorProjectContextRoute(): null {
	return null;
}
