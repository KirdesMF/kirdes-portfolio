import { type ReactNode, useEffect } from "react";
import { findEditorFile } from "#/editor/editor-files";
import { useIdeStore } from "#/ide/store";

export function RouteFileEditor({ children, fileId }: { children: ReactNode; fileId: string }) {
	const addRecentFile = useIdeStore((s) => s.addRecentFile);
	const activeFile = findEditorFile(fileId);
	const activeFileId = activeFile?.id ?? fileId;

	useEffect(() => {
		addRecentFile(activeFileId);
	}, [activeFileId, addRecentFile]);

	return (
		<section className="relative flex h-full min-h-0 w-full flex-col border-border text-sm">
			<div className="min-h-0 flex-1 overflow-auto scrollbar-gutter-both">
				<div className="mx-auto flex min-h-full w-full max-w-4xl flex-col justify-center gap-4 p-6 md:p-10">
					{children}
				</div>
			</div>
		</section>
	);
}

export function PlaceholderPage({ eyebrow, title }: { eyebrow: string; title: string }) {
	return (
		<article className="space-y-4">
			<p className="font-mono text-primary text-xs uppercase tracking-[0.3em]">{eyebrow}</p>
			<h1 className="font-semibold text-3xl text-foreground tracking-tight md:text-5xl">{title}</h1>
			<p className="max-w-2xl text-muted-foreground leading-7">
				This page now renders as plain TSX. Placeholder content will be replaced with the real
				portfolio page content next.
			</p>
		</article>
	);
}
