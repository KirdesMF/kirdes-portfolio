import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/editor/$workspaceId/$projectId/files")({
	component: EditorProjectFilesRoute,
});

function EditorProjectFilesRoute(): React.ReactNode {
	return (
		<section className="min-h-0 overflow-auto p-4 text-sm">
			<Outlet />
		</section>
	);
}
