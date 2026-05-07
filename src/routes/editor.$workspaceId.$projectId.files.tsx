import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/editor/$workspaceId/$projectId/files")({
	component: EditorProjectFilesRoute,
});

function EditorProjectFilesRoute(): null {
	return null;
}
