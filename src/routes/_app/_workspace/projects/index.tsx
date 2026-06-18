import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { PlaceholderPage, RouteFileEditor } from "#/editor/route-file-editor";

const fileId = "src/routes/projects/index.md";

export const Route = createFileRoute("/_app/_workspace/projects/")({
	component: RouteComponent,
});

function RouteComponent() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	return pathname === "/projects" ? (
		<RouteFileEditor fileId={fileId}>
			<PlaceholderPage eyebrow="projects" title="Selected work" />
		</RouteFileEditor>
	) : (
		<Outlet />
	);
}
