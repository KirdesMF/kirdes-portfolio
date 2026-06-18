import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, RouteFileEditor } from "#/editor/route-file-editor";

const fileId = "~/README.md";

export const Route = createFileRoute("/_app/_workspace/readme")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<RouteFileEditor fileId={fileId}>
			<PlaceholderPage eyebrow="readme" title="kirdes/workspace" />
		</RouteFileEditor>
	);
}
