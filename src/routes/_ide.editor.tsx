import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { CodeFileEditor } from "#/editor/code-file-editor";
import { getFileTokens } from "#/editor/editor-file-highlight.fn";
import { getDisplayFileName } from "#/editor/editor-files";
import { EmptyEditor } from "#/editor/read-only-file-editor";
import { parseIdeSearch } from "#/ide/search";
import { useIdeStore } from "#/ide/store";

export const Route = createFileRoute("/_ide/editor")({
	validateSearch: parseIdeSearch,
	loaderDeps: ({ search }) => ({
		activeFileName: search.file ?? null,
	}),
	loader: async ({ deps }) => {
		if (deps.activeFileName === null) return null;
		return getFileTokens({ data: { fileName: deps.activeFileName } });
	},
	staleTime: Infinity,
	component: EditorRoute,
});

function EditorRoute() {
	const result = Route.useLoaderData();
	const { file: fileName } = Route.useSearch();
	const navigate = useNavigate();
	const addRecentFile = useIdeStore((s) => s.addRecentFile);
	const resetCursor = useIdeStore((s) => s.resetCursor);
	const setCursorLineCount = useIdeStore((s) => s.setCursorLineCount);
	const prevFileRef = useRef(fileName);

	// Record file in recent files when opened
	useEffect(() => {
		if (fileName && fileName !== prevFileRef.current) {
			prevFileRef.current = fileName;
			addRecentFile(fileName);
		}
	}, [fileName, addRecentFile]);

	useEffect(() => {
		if (fileName) return;
		resetCursor();
		setCursorLineCount(1);
	}, [fileName, resetCursor, setCursorLineCount]);

	if (!fileName) return <EmptyEditor />;

	if (!result || !result.found) {
		return (
			<section className="relative flex h-full w-full min-h-0 flex-col border-border text-xs">
				<div className="flex h-status-bar shrink-0 items-center justify-between border-b border-border bg-background/60 px-3 text-tiny text-muted-foreground">
					<span className="truncate">{getDisplayFileName(fileName)}</span>
				</div>
				<div className="min-h-0 flex-1 overflow-hidden p-3 text-muted-foreground">
					unable to open {fileName}
				</div>
			</section>
		);
	}

	return (
		<section className="relative flex h-full w-full min-h-0 flex-col border-border text-xs">
			{/* Close bar */}
			<div className="flex h-status-bar shrink-0 items-center justify-between border-b border-border bg-background/60 px-3 text-tiny text-muted-foreground">
				<span className="truncate">{getDisplayFileName(result.fileName)}</span>
				<button
					aria-label="Close file"
					className="cursor-pointer text-muted-foreground/70 hover:text-foreground"
					type="button"
					onClick={() =>
						navigate({
							to: "/editor",
							search: (prev) => ({ ...prev, file: undefined }),
						})
					}
				>
					[close]
				</button>
			</div>
			<div className="min-h-0 flex-1 flex flex-col overflow-hidden">
				<CodeFileEditor lines={result.lines} fileName={fileName} language={result.language} />
			</div>
		</section>
	);
}
