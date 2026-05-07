import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/editor/$workspaceId/$projectId/files/$fileId")({
	component: EditorProjectFileRoute,
});

function EditorProjectFileRoute(): null {
	return null;
}
