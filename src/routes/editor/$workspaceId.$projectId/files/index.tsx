import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/editor/$workspaceId/$projectId/files/")({
	component: EditorProjectNoFileRoute,
});

function EditorProjectNoFileRoute(): React.ReactNode {
	return (
		<div className="rounded-md border border-border bg-sidebar p-4">
			<p className="font-medium">Main editor view</p>
			<p className="mt-1 text-muted-foreground text-xs">Select a file from the sidebar</p>
		</div>
	);
}
