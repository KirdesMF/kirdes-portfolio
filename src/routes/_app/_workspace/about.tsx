import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, RouteFileEditor } from "#/editor/route-file-editor";

const fileId = "src/routes/about.md";

export const Route = createFileRoute("/_app/_workspace/about")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<RouteFileEditor fileId={fileId}>
			<PlaceholderPage eyebrow="about" title="About" />
		</RouteFileEditor>
	);
}
