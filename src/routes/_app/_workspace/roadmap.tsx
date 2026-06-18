import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, RouteFileEditor } from "#/editor/route-file-editor";

const fileId = "~/ROADMAP.md";

export const Route = createFileRoute("/_app/_workspace/roadmap")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<RouteFileEditor fileId={fileId}>
			<PlaceholderPage eyebrow="roadmap" title="Roadmap" />
		</RouteFileEditor>
	);
}
