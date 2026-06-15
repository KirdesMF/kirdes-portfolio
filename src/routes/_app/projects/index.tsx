import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { getFileTokens } from "#/editor/editor-file-highlight.fn";
import { RouteFileEditor } from "#/editor/route-file-editor";

const fileId = "projects/index.md";

export const Route = createFileRoute("/_app/projects/")({
	loader: () => getFileTokens({ data: { fileName: fileId } }),
	staleTime: Infinity,
	component: RouteComponent,
});

function RouteComponent() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const result = Route.useLoaderData();
	return pathname === "/projects" ? <RouteFileEditor fileId={fileId} result={result} /> : <Outlet />;
}
