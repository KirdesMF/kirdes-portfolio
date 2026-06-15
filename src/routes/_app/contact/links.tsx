import { createFileRoute } from "@tanstack/react-router";
import { getFileTokens } from "#/editor/editor-file-highlight.fn";
import { RouteFileEditor } from "#/editor/route-file-editor";

const fileId = "contact/links.json";

export const Route = createFileRoute("/_app/contact/links")({
	loader: () => getFileTokens({ data: { fileName: fileId } }),
	staleTime: Infinity,
	component: RouteComponent,
});

function RouteComponent() {
	const result = Route.useLoaderData();
	return <RouteFileEditor fileId={fileId} result={result} />;
}
