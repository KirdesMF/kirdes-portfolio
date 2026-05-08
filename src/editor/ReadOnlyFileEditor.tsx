import { useServerFn } from "@tanstack/react-start";
import { X } from "lucide-react";
import { createElement, type ReactNode, useEffect, useState } from "react";
import { getHighlightedEditorFile } from "./editor-file-highlight.functions";
import type { EditorHighlightNode } from "./editor-highlight-types";

type HighlightedFileState =
	| { status: "idle" | "loading" }
	| { status: "success"; fileName: string; nodes: Array<EditorHighlightNode>; language: string }
	| { status: "not-found"; fileName: string }
	| { status: "error"; message: string };

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

function getHighlightedLines(
	nodes: Array<EditorHighlightNode>,
): Array<{ lineNumber: number; nodes: Array<EditorHighlightNode> }> {
	const preNode = nodes.find((node) => node.type === "element" && node.tagName === "pre");
	if (preNode?.type !== "element") return [];

	const codeNode = preNode.children.find(
		(node) => node.type === "element" && node.tagName === "code",
	);
	if (codeNode?.type !== "element") return [];

	return codeNode.children.filter(isLineNode).map((node, index) => {
		if (node.type !== "element") return { lineNumber: index + 1, nodes: [] };

		return { lineNumber: index + 1, nodes: node.children };
	});
}

function HighlightedCode({ nodes }: { nodes: Array<EditorHighlightNode> }) {
	const lines = getHighlightedLines(nodes);
	if (lines.length === 0) {
		return <>{nodes.map((node, index) => renderHighlightNode(node, String(index)))}</>;
	}

	return (
		<pre className="min-w-max font-mono text-xs leading-relaxed">
			{lines.map((line) => (
				<div
					className="group flex min-h-[1.375rem] gap-4 rounded px-1 hover:bg-muted/35"
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

function EditorHeader({
	fileName,
	language,
	onClose,
}: {
	fileName: string;
	language?: string;
	onClose: () => void;
}) {
	return (
		<div className="flex h-8 shrink-0 items-center justify-between border-b border-border px-3">
			<div className="flex min-w-0 items-center gap-2">
				<span className="truncate text-foreground">{fileName}</span>
				{language ? <span className="text-muted-foreground/60">{language}</span> : null}
			</div>
			<div className="flex shrink-0 items-center gap-2">
				<span className="text-muted-foreground/70">read-only</span>
				<button
					className="text-muted-foreground hover:text-foreground"
					type="button"
					onClick={onClose}
				>
					<X className="size-3.5" />
				</button>
			</div>
		</div>
	);
}

export function ReadOnlyFileEditor({
	fileName,
	onClose,
}: {
	fileName: string;
	onClose: () => void;
}) {
	const getHighlightedFile = useServerFn(getHighlightedEditorFile);
	const [fileState, setFileState] = useState<HighlightedFileState>({ status: "idle" });

	useEffect(() => {
		let isActive = true;
		setFileState({ status: "loading" });

		async function loadHighlightedFile() {
			try {
				const result = await getHighlightedFile({ data: { fileName } });
				if (!isActive) return;

				if (!result.found) {
					setFileState({ fileName: result.fileName, status: "not-found" });
					return;
				}

				setFileState({
					fileName: result.fileName,
					language: result.language,
					nodes: result.nodes,
					status: "success",
				});
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
			<section className="flex h-full min-h-0 flex-col border-border text-xs">
				<EditorHeader
					fileName={fileState.fileName}
					language={fileState.language}
					onClose={onClose}
				/>
				<div className="min-h-0 flex-1 overflow-auto p-2">
					<HighlightedCode nodes={fileState.nodes} />
				</div>
			</section>
		);
	}

	if (fileState.status === "not-found") {
		return (
			<section className="flex h-full min-h-0 flex-col border-border text-xs">
				<EditorHeader fileName={fileState.fileName} onClose={onClose} />
				<div className="p-3 text-muted-foreground">unable to open {fileState.fileName}</div>
			</section>
		);
	}

	if (fileState.status === "error") {
		return (
			<section className="flex h-full min-h-0 flex-col border-border text-xs">
				<EditorHeader fileName={fileName} onClose={onClose} />
				<div className="p-3 text-muted-foreground">{fileState.message}</div>
			</section>
		);
	}

	return (
		<section className="flex h-full min-h-0 flex-col border-border text-xs">
			<EditorHeader fileName={fileName} onClose={onClose} />
			<div className="p-3 text-muted-foreground">highlighting file...</div>
		</section>
	);
}
