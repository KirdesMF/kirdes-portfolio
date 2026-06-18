import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/_workspace")({
	component: WorkspaceLayout,
});

function WorkspaceLayout() {
	return (
		<div className="h-full min-h-0 w-full overflow-hidden">
			<Outlet />
		</div>
	);
}
