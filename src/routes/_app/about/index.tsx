import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { getFileTokens } from "#/editor/editor-file-highlight.fn";
import { RouteFileEditor } from "#/editor/route-file-editor";

const fileId = "about/route.tsx";

export const Route = createFileRoute("/_app/about/")({
	loader: () => getFileTokens({ data: { fileName: fileId } }),
	staleTime: Infinity,
	component: RouteComponent,
});

function RouteComponent() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const result = Route.useLoaderData();
	return pathname === "/about" ? <RouteFileEditor fileId={fileId} result={result} /> : <Outlet />;
}
