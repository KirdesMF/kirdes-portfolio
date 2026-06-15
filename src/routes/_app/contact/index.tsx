import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { getFileTokens } from "#/editor/editor-file-highlight.fn";
import { RouteFileEditor } from "#/editor/route-file-editor";

const fileId = "contact/contact.md";

export const Route = createFileRoute("/_app/contact/")({
	loader: () => getFileTokens({ data: { fileName: fileId } }),
	staleTime: Infinity,
	component: RouteComponent,
});

function RouteComponent() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const result = Route.useLoaderData();
	return pathname === "/contact" ? <RouteFileEditor fileId={fileId} result={result} /> : <Outlet />;
}
