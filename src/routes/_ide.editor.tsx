import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getHighlightedEditorFileRsc } from "#/editor/editor-file-highlight.fn";
import { getDisplayFileName } from "#/editor/editor-files";
import { EditorBody, EmptyEditor } from "#/editor/read-only-file-editor";
import { parseIdeSearch } from "#/ide/search";

export const Route = createFileRoute("/_ide/editor")({
	validateSearch: parseIdeSearch,
	loaderDeps: ({ search }) => ({
		activeFileName: search.file ?? null,
	}),
	loader: async ({ deps }) => {
		if (deps.activeFileName === null) return { HighlightedEditorFile: null };

		return getHighlightedEditorFileRsc({ data: { fileName: deps.activeFileName } });
	},
	staleTime: Infinity,
	component: EditorRoute,
});

function EditorRoute() {
	const { HighlightedEditorFile } = Route.useLoaderData();
	const { file } = Route.useSearch();
	const navigate = useNavigate();

	if (!file) return <EmptyEditor />;

	return (
		<section className="relative flex h-full w-full min-h-0 flex-col border-border text-xs">
			{/* Close bar */}
			<div className="flex h-status-bar shrink-0 items-center justify-between border-b border-border bg-background/60 px-3 text-tiny text-muted-foreground">
				<span className="truncate">{getDisplayFileName(file)}</span>
				<button
					aria-label="Close file"
					className="cursor-pointer text-muted-foreground/70 hover:text-foreground"
					type="button"
					onClick={() => navigate({ to: "/editor", search: {} })}
				>
					[close]
				</button>
			</div>
			<div className="min-h-0 flex-1 overflow-auto scrollbar-gutter-both">
				<EditorBody highlightedEditorFile={HighlightedEditorFile} key={file} />
			</div>
		</section>
	);
}
