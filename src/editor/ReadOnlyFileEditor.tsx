import { useServerFn } from "@tanstack/react-start";
import { Braces, FileText, FileType, type LucideIcon, X } from "lucide-react";
import { createElement, type ReactNode, useEffect, useState } from "react";
import { cn } from "#/design-system/cn";
import { editorFiles } from "#/editor/editor-files";
import { getHighlightedEditorFile } from "./editor-file-highlight.functions";
import type { EditorHighlightNode } from "./editor-highlight-types";

type HighlightedFileState =
	| { status: "idle" | "loading" }
	| {
			status: "success";
			fileName: string;
			nodes: Array<EditorHighlightNode>;
			language: string;
			preClassName?: string;
	  }
	| { status: "not-found"; fileName: string }
	| { status: "error"; message: string };

const highlightedFileCache = new Map<string, HighlightedFileState>();

const fileExtensionIcon: Record<string, LucideIcon> = {
	md: FileText,
	json: Braces,
	ts: FileType,
};

function getFileIcon(fileName: string): LucideIcon | null {
	const extension = fileName.split(".").pop()?.toLowerCase();
	if (!extension) return null;
	return fileExtensionIcon[extension] ?? null;
}

function renderHighlightNode(node: EditorHighlightNode, key: string): ReactNode {
	if (node.type === "text") return node.value;

	return createElement(
		node.tagName,
		{
			className: node.properties.className,
			key,
			style: node.properties.style,
			tabIndex: node.properties.tabIndex,
		},
		node.children.map((child, index) => renderHighlightNode(child, `${key}-${index}`)),
	);
}

function isLineNode(node: EditorHighlightNode): boolean {
	return node.type === "element" && node.properties.className?.split(" ").includes("line") === true;
}

function getHighlightedLines(nodes: Array<EditorHighlightNode>): {
	lines: Array<{ lineNumber: number; nodes: Array<EditorHighlightNode> }>;
	preClassName?: string;
} {
	const preNode = nodes.find((node) => node.type === "element" && node.tagName === "pre");
	if (preNode?.type !== "element") return { lines: [] };

	const codeNode = preNode.children.find(
		(node) => node.type === "element" && node.tagName === "code",
	);
	if (codeNode?.type !== "element")
		return { lines: [], preClassName: preNode.properties.className };

	return {
		preClassName: preNode.properties.className,
		lines: codeNode.children.filter(isLineNode).map((node, index) => {
			if (node.type !== "element") return { lineNumber: index + 1, nodes: [] };

			return { lineNumber: index + 1, nodes: node.children };
		}),
	};
}

function HighlightedCode({
	nodes,
	preClassName,
}: {
	nodes: Array<EditorHighlightNode>;
	preClassName?: string;
}) {
	const { lines, preClassName: extractedClassName } = getHighlightedLines(nodes);
	const preClass = preClassName ?? extractedClassName;

	if (lines.length === 0) {
		return <>{nodes.map((node, index) => renderHighlightNode(node, String(index)))}</>;
	}

	return (
		<pre className={cn("min-w-max font-mono text-xs leading-relaxed", preClass)}>
			{lines.map((line) => (
				<div
					className="group flex min-h-5.5 gap-4 rounded px-1 hover:bg-muted/35"
					key={line.lineNumber}
				>
					<span className="w-5 shrink-0 select-none text-right text-muted-foreground/35 group-hover:text-muted-foreground/70">
						{line.lineNumber}
					</span>
					<code className="min-w-0 flex-1 whitespace-pre pr-4">
						{line.nodes.length === 0
							? " "
							: line.nodes.map((node, childIndex) =>
									renderHighlightNode(node, `${line.lineNumber}-${childIndex}`),
								)}
					</code>
				</div>
			))}
		</pre>
	);
}

function EditorTabs({
	activeFileName,
	onCloseEditor,
	onCloseFile,
	onSelectFile,
	openFileNames,
}: {
	activeFileName?: string;
	onCloseEditor: () => void;
	onCloseFile: (fileName: string) => void;
	onSelectFile: (fileName: string) => void;
	openFileNames: Array<string>;
}) {
	return (
		<div className="flex h-8 shrink-0 items-center overflow-x-auto border-b border-border bg-background/60">
			{openFileNames.map((fileName) => (
				<div
					className={cn(
						"flex h-full max-w-40 shrink-0 items-center border-r border-border text-tiny text-muted-foreground hover:bg-muted/30 hover:text-foreground",
						activeFileName === fileName && "bg-muted/40 text-foreground",
					)}
					key={fileName}
				>
					<button
						className="flex h-full min-w-0 items-center gap-1.5 pl-3 pr-2"
						type="button"
						onClick={() => onSelectFile(fileName)}
					>
						{(() => {
							const Icon = getFileIcon(fileName);
							return Icon ? <Icon className="size-3 shrink-0" /> : null;
						})()}
						<span className="truncate">{fileName}</span>
					</button>
					<button
						aria-label={`Close ${fileName}`}
						className="h-full px-2 text-muted-foreground hover:text-foreground"
						type="button"
						onClick={() => onCloseFile(fileName)}
					>
						<X className="size-3" />
					</button>
				</div>
			))}
			<div className="ms-auto flex h-full shrink-0 items-center gap-2 border-l border-border px-3 text-tiny text-muted-foreground/70">
				<span>read-only</span>
				<button
					aria-label="Close editor"
					className="rounded text-muted-foreground hover:text-foreground"
					type="button"
					onClick={onCloseEditor}
				>
					<X className="size-3.5" />
				</button>
			</div>
		</div>
	);
}

function EmptyEditor({ onOpenFile }: { onOpenFile: (fileName: string) => void }) {
	return (
		<div className="flex min-h-0 flex-1 items-center justify-center p-4 text-xs">
			<div className="flex max-w-sm flex-col items-center gap-3 text-center">
				<div className="text-foreground">No file open</div>
				<div className="text-muted-foreground">Open a file to inspect portfolio source.</div>
				<div className="flex flex-wrap justify-center gap-2">
					{editorFiles.map(({ name }) => (
						<button
							className="rounded border border-border px-2 py-1 text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
							key={name}
							type="button"
							onClick={() => onOpenFile(name)}
						>
							{name}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}

function EditorBody({ fileName }: { fileName: string }) {
	const getHighlightedFile = useServerFn(getHighlightedEditorFile);
	const [fileState, setFileState] = useState<HighlightedFileState>({ status: "idle" });

	useEffect(() => {
		const cached = highlightedFileCache.get(fileName);
		if (cached) {
			setFileState(cached);
			return;
		}

		let isActive = true;
		setFileState({ status: "loading" });

		async function loadHighlightedFile() {
			try {
				const result = await getHighlightedFile({ data: { fileName } });
				if (!isActive) return;

				let nextState: HighlightedFileState;

				if (!result.found) {
					nextState = { fileName: result.fileName, status: "not-found" };
				} else {
					nextState = {
						fileName: result.fileName,
						language: result.language,
						nodes: result.nodes,
						preClassName: result.preClassName,
						status: "success",
					};
				}

				highlightedFileCache.set(fileName, nextState);
				if (!isActive) return;
				setFileState(nextState);
			} catch (error) {
				if (!isActive) return;
				const message = error instanceof Error ? error.message : "highlighting failed";
				setFileState({ message, status: "error" });
			}
		}

		void loadHighlightedFile();

		return () => {
			isActive = false;
		};
	}, [fileName, getHighlightedFile]);

	if (fileState.status === "success") {
		return (
			<div className="min-h-0 flex-1 overflow-auto p-2">
				<HighlightedCode nodes={fileState.nodes} preClassName={fileState.preClassName} />
			</div>
		);
	}

	if (fileState.status === "not-found") {
		return <div className="p-3 text-muted-foreground">unable to open {fileState.fileName}</div>;
	}

	if (fileState.status === "error") {
		return <div className="p-3 text-muted-foreground">{fileState.message}</div>;
	}

	return <div className="p-3 text-muted-foreground">highlighting file...</div>;
}

export function ReadOnlyFileEditor({
	activeFileName,
	onCloseEditor,
	onCloseFile,
	onOpenFile,
	onSelectFile,
	openFileNames,
}: {
	activeFileName?: string;
	onCloseEditor: () => void;
	onCloseFile: (fileName: string) => void;
	onOpenFile: (fileName: string) => void;
	onSelectFile: (fileName: string) => void;
	openFileNames: Array<string>;
}) {
	return (
		<section className="flex h-full min-h-0 flex-col border-border text-xs">
			<EditorTabs
				activeFileName={activeFileName}
				onCloseEditor={onCloseEditor}
				onCloseFile={onCloseFile}
				onSelectFile={onSelectFile}
				openFileNames={openFileNames}
			/>
			{activeFileName ? (
				<EditorBody fileName={activeFileName} />
			) : (
				<EmptyEditor onOpenFile={onOpenFile} />
			)}
		</section>
	);
}
