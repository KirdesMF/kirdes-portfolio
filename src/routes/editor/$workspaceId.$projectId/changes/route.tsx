import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/editor/$workspaceId/$projectId/changes")({
	component: EditorProjectChangesRoute,
});

function EditorProjectChangesRoute(): React.ReactNode {
	return (
		<section className="min-h-0 overflow-auto p-4 text-sm">
			<Outlet />
		</section>
	);
}
