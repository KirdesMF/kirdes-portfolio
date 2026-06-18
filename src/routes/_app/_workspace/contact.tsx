import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, RouteFileEditor } from "#/editor/route-file-editor";

const fileId = "src/routes/contact.md";

export const Route = createFileRoute("/_app/_workspace/contact")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<RouteFileEditor fileId={fileId}>
			<PlaceholderPage eyebrow="contact" title="Contact" />
		</RouteFileEditor>
	);
}
