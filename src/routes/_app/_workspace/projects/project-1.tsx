import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, RouteFileEditor } from "#/editor/route-file-editor";

const fileId = "src/routes/projects/project-1.md";

export const Route = createFileRoute("/_app/_workspace/projects/project-1")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<RouteFileEditor fileId={fileId}>
			<PlaceholderPage eyebrow="project" title="Terminal Portfolio" />
		</RouteFileEditor>
	);
}
