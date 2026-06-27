import { type ReactNode, useEffect } from "react";
import { PixelBand } from "#/components/pixel-band";
import { findEditorFile } from "#/editor/editor-files";
import { useIdeStore } from "#/ide/store";

export function useTrackRouteFile(fileId: string, options?: { enabled?: boolean }) {
	const addRecentFile = useIdeStore((s) => s.addRecentFile);
	const activeFile = findEditorFile(fileId);
	const activeFileId = activeFile?.id ?? fileId;
	const enabled = options?.enabled ?? true;

	useEffect(() => {
		if (enabled) addRecentFile(activeFileId);
	}, [activeFileId, addRecentFile, enabled]);
}

export function RouteFileEditor({ children, fileId }: { children: ReactNode; fileId: string }) {
	useTrackRouteFile(fileId);

	return (
		<section className="relative flex h-full min-h-0 w-full flex-col border-border text-sm">
			<div className="min-h-0 flex-1 overflow-auto scrollbar-gutter-both" data-page-scroll>
				<div className="mx-auto flex min-h-full w-full max-w-2xl flex-col gap-8 px-5 py-10 md:px-8 md:py-14">
					{children}
				</div>
			</div>
		</section>
	);
}

const placeholderSections = [
	"Availability, project fit, and current focus should read like editor metadata instead of a landing page pitch.",
	"The page keeps a markdown rhythm: short notes, quiet labels, and enough empty space for the frame to breathe.",
	"Future sections can replace these draft lines with work history, project notes, and contact context.",
	"Longer content is useful here because the line-number gutter needs to feel attached to scroll position.",
	"If the interaction feels too literal, the status segment can switch from exact line numbers to section progress.",
	"The goal is still simple: make the portfolio feel like a real workspace without pretending to be a full editor.",
] as const;

export function PlaceholderPage({ eyebrow, title }: { eyebrow: string; title: string }) {
	return (
		<article className="space-y-8 font-mono text-sm leading-7 text-foreground">
			<header className="space-y-4">
				<p className="text-muted-foreground text-tiny uppercase tracking-[0.24em]">{eyebrow}.md</p>
				<PixelBand className="block w-full" />
				<h1 className="font-normal text-base text-foreground uppercase">
					<span className="text-muted-foreground/50">##</span> {title}
				</h1>
				<p className="text-muted-foreground">
					A small markdown-style workspace page. Content is intentionally quiet while the real
					portfolio sections are composed.
				</p>
			</header>

			<section className="relative p-5">
				<svg
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 size-full text-border"
				>
					<rect
						fill="none"
						height="100%"
						stroke="currentColor"
						strokeDasharray="2 1"
						strokeWidth="0.5"
						vectorEffect="non-scaling-stroke"
						width="100%"
						x="0"
						y="0"
					/>
				</svg>
				<p className="mb-4 text-muted-foreground text-tiny uppercase tracking-[0.18em]">↳ note</p>
				<div className="space-y-2 text-muted-foreground">
					<p>
						<span className="text-muted-foreground/50">-</span> route: {eyebrow}
					</p>
					<p>
						<span className="text-muted-foreground/50">-</span> format: tsx + markdown-inspired UI
					</p>
					<p>
						<span className="text-muted-foreground/50">-</span> status: draft
					</p>
				</div>
			</section>

			<section className="space-y-4 text-muted-foreground">
				<p className="text-tiny uppercase tracking-[0.18em]">↳ draft content</p>
				{placeholderSections.map((text, index) => (
					<p key={text}>
						<span className="text-muted-foreground/50">{String(index + 1).padStart(2, "0")}.</span>{" "}
						{text}
					</p>
				))}
			</section>

			<details className="border-t-thin border-dashed border-border pt-4 text-muted-foreground">
				<summary className="cursor-pointer list-none">▸ View source</summary>
				<div className="mt-4 space-y-2 text-muted-foreground/80">
					{placeholderSections.map((text) => (
						<p key={text}>source: {text}</p>
					))}
				</div>
			</details>
		</article>
	);
}
