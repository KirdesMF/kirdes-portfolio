import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getHighlightedEditorFileRsc } from "#/editor/editor-file-highlight.fn";
import { TerminalLayout } from "#/terminal/TerminalLayout";
import { parseTerminalSearch } from "#/terminal/terminal-search";

export const Route = createFileRoute("/terminal")({
	validateSearch: parseTerminalSearch,
	loaderDeps: ({ search }) => ({
		activeFileName: search.editor === "open" ? (search.activeFile ?? null) : null,
	}),
	loader: async ({ deps }) => {
		if (deps.activeFileName === null) return { HighlightedEditorFile: null };

		return getHighlightedEditorFileRsc({ data: { fileName: deps.activeFileName } });
	},
	staleTime: Infinity,
	component: RouteComponent,
});

function RouteComponent() {
	const { HighlightedEditorFile } = Route.useLoaderData();
	const { activeFile, dialog, editor, files, maximized, panel } = Route.useSearch();

	return (
		<TerminalLayout
			activeEditor={editor}
			activeFileName={activeFile}
			activePanel={panel}
			dialog={dialog}
			highlightedEditorFile={HighlightedEditorFile}
			maximized={maximized}
			openFileNames={files}
		>
			<Outlet />
		</TerminalLayout>
	);
}
