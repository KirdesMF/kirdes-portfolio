import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, RouteFileEditor } from "#/editor/route-file-editor";

const fileId = "src/routes/projects/project-2.md";

export const Route = createFileRoute("/_app/_workspace/projects/project-2")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<RouteFileEditor fileId={fileId}>
			<PlaceholderPage eyebrow="project" title="Browser Portfolio Views" />
		</RouteFileEditor>
	);
}
