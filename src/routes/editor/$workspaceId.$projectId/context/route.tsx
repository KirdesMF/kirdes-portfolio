import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/editor/$workspaceId/$projectId/context")({
	component: EditorProjectContextRoute,
});

function EditorProjectContextRoute(): React.ReactNode {
	return (
		<section className="min-h-0 overflow-auto p-4 text-sm">
			<Outlet />
		</section>
	);
}
