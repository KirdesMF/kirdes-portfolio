import { createFileRoute } from "@tanstack/react-router";
import { getFileTokens } from "#/editor/editor-file-highlight.fn";
import { RouteFileEditor } from "#/editor/route-file-editor";

const fileId = "about/skills.json";

export const Route = createFileRoute("/_app/about/skills")({
	loader: () => getFileTokens({ data: { fileName: fileId } }),
	staleTime: Infinity,
	component: RouteComponent,
});

function RouteComponent() {
	const result = Route.useLoaderData();
	return <RouteFileEditor fileId={fileId} result={result} />;
}
