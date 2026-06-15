import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { CodeFileEditor } from "#/editor/code-file-editor";
import type { FileTokenLine } from "#/editor/editor-file-tokens";
import { findEditorFile, getDisplayFileName } from "#/editor/editor-files";
import { EmptyEditor } from "#/editor/read-only-file-editor";
import { useIdeStore } from "#/ide/store";

type HighlightResult =
	| { found: false; fileName: string }
	| { found: true; fileName: string; lines: FileTokenLine[]; language: string };

export function HomeEditorRoute() {
	return <EmptyEditor />;
}

export function RouteFileEditor({ fileId, result }: { fileId: string; result: HighlightResult }) {
	const navigate = useNavigate();
	const addRecentFile = useIdeStore((s) => s.addRecentFile);
	const activeFileId = findEditorFile(fileId)?.id ?? fileId;
	const prevFileRef = useRef(activeFileId);

	useEffect(() => {
		if (activeFileId && activeFileId !== prevFileRef.current) {
			prevFileRef.current = activeFileId;
		}
		addRecentFile(activeFileId);
	}, [activeFileId, addRecentFile]);

	if (!result.found) {
		return (
			<section className="relative flex h-full min-h-0 w-full flex-col border-border text-xs">
				<div className="flex h-status-bar shrink-0 items-center justify-between border-border border-b bg-background/60 px-3 text-muted-foreground text-tiny">
					<span className="truncate">{getDisplayFileName(activeFileId)}</span>
				</div>
				<div className="min-h-0 flex-1 overflow-hidden p-3 text-muted-foreground">
					unable to open {activeFileId}
				</div>
			</section>
		);
	}

	return (
		<section className="relative flex h-full min-h-0 w-full flex-col border-border text-xs">
			<div className="flex h-status-bar shrink-0 items-center justify-between border-border border-b bg-background/60 px-3 text-muted-foreground text-tiny">
				<span className="truncate">{getDisplayFileName(activeFileId)}</span>
				<button
					aria-label="Close file"
					className="cursor-pointer text-muted-foreground/70 hover:text-foreground"
					type="button"
					onClick={() => navigate({ to: "/start" })}
				>
					[close]
				</button>
			</div>
			<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
				<CodeFileEditor lines={result.lines} fileName={activeFileId} language={result.language} />
			</div>
		</section>
	);
}
