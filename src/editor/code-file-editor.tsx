// biome-ignore-all lint/suspicious/noArrayIndexKey: lines are static and position is fixed
// biome-ignore-all lint/a11y/useSemanticElements: custom readonly code editor surface
"use client";

import { useNavigate } from "@tanstack/react-router";
import {
	type CSSProperties,
	type KeyboardEvent as ReactKeyboardEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
} from "react";
import { cn } from "#/design-system/cn";
import { useIdeStore } from "#/ide/store";
import {
	classifyLinkUrl,
	findMarkdownLinkRanges,
	getLinkPath,
	type MarkdownLinkRange,
	resolveMarkdownFileLink,
} from "./markdown-links";

export type FileTokenLine = Array<{
	content: string;
	offset: number;
	lightColor?: string;
	darkColor?: string;
}>;

type CodeFileEditorProps = {
	lines: FileTokenLine[];
	fileName: string;
	language?: string;
};

function getTokenStyle(token: FileTokenLine[number]): CSSProperties {
	// Shiki gives colors per token, so the values stay dynamic while style.css owns usage.
	return {
		"--token-light": token.lightColor,
		"--token-dark": token.darkColor,
	} as CSSProperties;
}

function TokenSpan({ token, content }: { token: FileTokenLine[number]; content?: string }) {
	return (
		<span className="token" style={getTokenStyle(token)}>
			{content ?? token.content}
		</span>
	);
}

function getLineLength(line: FileTokenLine): number {
	return line.reduce((acc, t) => acc + t.content.length, 0);
}

function getNormalModeMaxColumn(line: FileTokenLine | undefined): number {
	return Math.max(line ? getLineLength(line) : 0, 1);
}

function getLineText(line: FileTokenLine): string {
	return line.map((t) => t.content).join("");
}

const TAB_SIZE = 2;

function getVisualColumn(text: string, endIndex: number): number {
	let visualColumn = 0;
	for (const char of text.slice(0, endIndex)) {
		visualColumn += char === "\t" ? TAB_SIZE - (visualColumn % TAB_SIZE) : 1;
	}
	return visualColumn;
}

function getCursorVisualState(line: FileTokenLine, cursorCol: number) {
	const text = getLineText(line);
	const cursorIndex = cursorCol - 1;
	return {
		char: text[cursorIndex] ?? "\u00A0",
		visualColumn: getVisualColumn(text, cursorIndex),
	};
}

function CursorOverlay({ line, cursorCol }: { line: FileTokenLine; cursorCol: number }) {
	const cursor = getCursorVisualState(line, cursorCol);
	const cursorStyle = {
		"--cursor-column": `${cursor.visualColumn}ch`,
	} as CSSProperties;

	return (
		<span className="cursor-block" style={cursorStyle}>
			<span className="cursor-text">{cursor.char === "\t" ? "\u00A0" : cursor.char}</span>
		</span>
	);
}

function renderLineWithCursor(
	line: FileTokenLine,
	lineIndex: number,
	cursorLine: number,
	cursorCol: number,
) {
	const tokens = line.map((token) => <TokenSpan key={token.offset} token={token} />);
	if (lineIndex !== cursorLine - 1) return tokens;

	return [...tokens, <CursorOverlay key="cursor" line={line} cursorCol={cursorCol} />];
}

type TokenFragment = {
	key: string;
	link?: MarkdownLinkRange;
	segment: string;
	token: FileTokenLine[number];
};

function getLineLocalTokenStarts(line: FileTokenLine): number[] {
	let nextStart = 0;
	return line.map((token) => {
		const start = nextStart;
		nextStart += token.content.length;
		return start;
	});
}

function getLinkAt(position: number, links: MarkdownLinkRange[]): MarkdownLinkRange | undefined {
	return links.find((link) => position >= link.start && position < link.end);
}

function getNextLinkStart(position: number, tokenEnd: number, links: MarkdownLinkRange[]): number {
	return links.find((link) => link.start > position && link.start < tokenEnd)?.start ?? tokenEnd;
}

function getTokenFragments(
	token: FileTokenLine[number],
	tokenIndex: number,
	tokenStart: number,
	links: MarkdownLinkRange[],
): TokenFragment[] {
	const fragments: TokenFragment[] = [];
	const tokenEnd = tokenStart + token.content.length;
	let tokenOffset = 0;

	while (tokenOffset < token.content.length) {
		const absoluteOffset = tokenStart + tokenOffset;
		const link = getLinkAt(absoluteOffset, links);
		const fragmentEnd = link
			? Math.min(link.end, tokenEnd)
			: getNextLinkStart(absoluteOffset, tokenEnd, links);
		const localEnd = fragmentEnd - tokenStart;

		fragments.push({
			key: `${tokenIndex}-${tokenOffset}`,
			link,
			segment: token.content.slice(tokenOffset, localEnd),
			token,
		});

		tokenOffset = localEnd;
	}

	return fragments;
}

function renderLinkedFragment(
	fragment: TokenFragment,
	onFileLinkClick: (url: string) => void,
	onAppRouteClick: (url: string) => void,
): ReactNode {
	const content = <TokenSpan token={fragment.token} content={fragment.segment} />;
	if (!fragment.link) {
		return <TokenSpan key={fragment.key} token={fragment.token} content={fragment.segment} />;
	}

	const { url } = fragment.link;
	const target = classifyLinkUrl(url);
	if (target === "unsafe") {
		return <TokenSpan key={fragment.key} token={fragment.token} content={fragment.segment} />;
	}
	if (target === "external") {
		return (
			<a
				key={fragment.key}
				href={url.trim()}
				target="_blank"
				rel="noopener noreferrer"
				className="editor-link"
			>
				{content}
			</a>
		);
	}
	if (target === "app-route") {
		return (
			<button
				key={fragment.key}
				type="button"
				className="editor-link"
				onClick={() => onAppRouteClick(url)}
			>
				{content}
			</button>
		);
	}

	return (
		<button
			key={fragment.key}
			type="button"
			className="editor-link"
			onClick={() => onFileLinkClick(url)}
		>
			{content}
		</button>
	);
}

function renderLineWithLinks(
	line: FileTokenLine,
	lineIndex: number,
	cursorLine: number,
	cursorCol: number,
	linkRanges: MarkdownLinkRange[],
	onFileLinkClick: (url: string) => void,
	onAppRouteClick: (url: string) => void,
): ReactNode[] {
	if (linkRanges.length === 0) {
		return renderLineWithCursor(line, lineIndex, cursorLine, cursorCol);
	}

	const tokenStarts = getLineLocalTokenStarts(line);
	const elements = line.flatMap((token, index) =>
		getTokenFragments(token, index, tokenStarts[index] ?? 0, linkRanges).map((fragment) =>
			renderLinkedFragment(fragment, onFileLinkClick, onAppRouteClick),
		),
	);

	if (lineIndex === cursorLine - 1) {
		elements.push(<CursorOverlay key="cursor" line={line} cursorCol={cursorCol} />);
	}

	return elements;
}

function nextWordStart(text: string, col: number): number {
	let idx = col - 1;
	while (idx < text.length && /\w/.test(text[idx] ?? "")) idx++;
	while (idx < text.length && !/\w/.test(text[idx] ?? "")) idx++;
	return idx + 1;
}

function prevWordStart(text: string, col: number): number {
	let idx = col - 2;
	if (idx < 0) return 1;
	while (idx >= 0 && !/\w/.test(text[idx] ?? "")) idx--;
	while (idx >= 0 && /\w/.test(text[idx] ?? "")) idx--;
	return idx + 2;
}

export function CodeFileEditor({ lines, fileName, language }: CodeFileEditorProps) {
	const cursorLine = useIdeStore((s) => s.cursorLine);
	const cursorColumn = useIdeStore((s) => s.cursorColumn);
	const setCursorPosition = useIdeStore((s) => s.setCursorPosition);
	const setCursorLineCount = useIdeStore((s) => s.setCursorLineCount);
	const resetCursor = useIdeStore((s) => s.resetCursor);
	const setEditorMode = useIdeStore((s) => s.setEditorMode);
	const editorFocusRequest = useIdeStore((s) => s.editorFocusRequest);
	const editorRef = useRef<HTMLDivElement | null>(null);
	const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
	const lastKeyRef = useRef<string | null>(null);
	const navigate = useNavigate();
	const isMarkdown = language === "markdown";

	// Reset cursor and focus editor when file changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: fileName is intentionally a dependency
	useEffect(() => {
		setCursorLineCount(lines.length);
		resetCursor();

		requestAnimationFrame(() => {
			editorRef.current?.focus({ preventScroll: true });
		});
	}, [fileName, lines.length, resetCursor, setCursorLineCount]);

	useEffect(() => {
		if (editorFocusRequest === 0) return;
		editorRef.current?.focus({ preventScroll: true });
	}, [editorFocusRequest]);

	// Scroll cursor into view
	useEffect(() => {
		const lineEl = lineRefs.current[cursorLine - 1];
		if (lineEl) {
			lineEl.scrollIntoView({ block: "nearest", behavior: "instant" });
		}
	}, [cursorLine]);

	// Relative line numbers — mutate DOM directly, no React re-render
	useEffect(() => {
		for (let i = 0; i < lineRefs.current.length; i++) {
			const el = lineRefs.current[i];
			if (!el) continue;

			const rel = i + 1 - cursorLine;
			el.setAttribute("data-line", String(rel === 0 ? cursorLine : Math.abs(rel)));
		}
	}, [cursorLine]);

	function isBlocked(): boolean {
		const state = useIdeStore.getState();
		return (
			state.commandMenuOpen ||
			state.helpOpen ||
			state.settingsOpen ||
			state.findFileOpen ||
			state.findTextOpen ||
			state.recentFilesOpen ||
			state.commandModeOpen ||
			state.commandHistoryOpen
		);
	}

	function isEditableTarget(event: ReactKeyboardEvent<HTMLDivElement>): boolean {
		const target = event.target;
		return (
			target instanceof HTMLElement &&
			(target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
		);
	}

	function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
		if (isBlocked()) return;
		if (isEditableTarget(event)) return;

		const state = useIdeStore.getState();
		const { cursorLine, cursorColumn } = state;
		const maxLine = lines.length;

		if (state.editorMode !== "normal") {
			if (event.key === "Escape") {
				setEditorMode("normal");
				event.preventDefault();
			}
			return;
		}

		const currentLine = lines[cursorLine - 1];
		const lineText = currentLine ? getLineText(currentLine) : "";

		let newLine = cursorLine;
		let newCol = cursorColumn;

		// Handle key sequences
		if (event.key === "g") {
			if (lastKeyRef.current === "g") {
				event.preventDefault();
				setCursorPosition(1, 1);
				lastKeyRef.current = null;
				return;
			}
			lastKeyRef.current = "g";
			setTimeout(() => {
				lastKeyRef.current = null;
			}, 300);
			return;
		}

		switch (event.key) {
			case "j":
			case "ArrowDown": {
				event.preventDefault();
				newLine = Math.min(cursorLine + 1, maxLine);
				newCol = Math.min(cursorColumn, getNormalModeMaxColumn(lines[newLine - 1]));
				break;
			}
			case "k":
			case "ArrowUp": {
				event.preventDefault();
				newLine = Math.max(cursorLine - 1, 1);
				newCol = Math.min(cursorColumn, getNormalModeMaxColumn(lines[newLine - 1]));
				break;
			}
			case "h":
			case "ArrowLeft": {
				event.preventDefault();
				newCol = Math.max(cursorColumn - 1, 1);
				break;
			}
			case "l":
			case "ArrowRight": {
				event.preventDefault();
				newCol = Math.min(cursorColumn + 1, getNormalModeMaxColumn(currentLine));
				break;
			}
			case "0": {
				event.preventDefault();
				newCol = 1;
				break;
			}
			case "$":
			case "End": {
				event.preventDefault();
				newCol = getNormalModeMaxColumn(currentLine);
				break;
			}
			case "G": {
				event.preventDefault();
				newLine = maxLine;
				newCol = Math.min(cursorColumn, getNormalModeMaxColumn(lines[maxLine - 1]));
				break;
			}
			case "w": {
				event.preventDefault();
				newCol = nextWordStart(lineText, cursorColumn);
				break;
			}
			case "b": {
				event.preventDefault();
				newCol = prevWordStart(lineText, cursorColumn);
				break;
			}
			case "i": {
				event.preventDefault();
				setEditorMode("insert");
				break;
			}
			case "Escape": {
				setEditorMode("normal");
				break;
			}
		}

		newCol = Math.min(newCol, getNormalModeMaxColumn(lines[newLine - 1]));

		if (newLine !== cursorLine || newCol !== cursorColumn) {
			setCursorPosition(newLine, newCol);
		}
	}

	const handleFileLinkClick = useCallback(
		(url: string) => {
			const resolved = resolveMarkdownFileLink(url, fileName);
			if (resolved) {
				navigate({
					to: "/editor",
					search: (prev) => ({ ...prev, file: resolved.id, neotree: "open" }),
				});
			}
		},
		[fileName, navigate],
	);

	const handleAppRouteClick = useCallback(
		(url: string) => {
			const route = getLinkPath(url);
			if (
				route === "/about" ||
				route === "/work" ||
				route === "/contact" ||
				route === "/editor" ||
				route === "/terminal"
			) {
				navigate({ to: route });
			}
		},
		[navigate],
	);

	// Precompute link ranges per line for markdown files.
	const linkRangesByLine = isMarkdown
		? lines.map((line) => findMarkdownLinkRanges(getLineText(line)))
		: null;

	return (
		<div
			aria-label="Code editor"
			aria-multiline="true"
			aria-readonly="true"
			className="editor-code min-h-0 flex-1 overflow-auto py-2 scrollbar-gutter-both focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary"
			ref={editorRef}
			role="textbox"
			tabIndex={0}
			onKeyDown={handleKeyDown}
		>
			<pre>
				<code>
					{lines.map((line, lineIndex) => {
						const children = isMarkdown
							? renderLineWithLinks(
									line,
									lineIndex,
									cursorLine,
									cursorColumn,
									linkRangesByLine?.[lineIndex] ?? [],
									handleFileLinkClick,
									handleAppRouteClick,
								)
							: renderLineWithCursor(line, lineIndex, cursorLine, cursorColumn);

						return (
							<div
								key={lineIndex}
								className={cn("line", lineIndex === cursorLine - 1 && "line-active")}
								data-line={lineIndex + 1}
								ref={(el) => {
									lineRefs.current[lineIndex] = el;
								}}
							>
								{children}
							</div>
						);
					})}
				</code>
			</pre>
		</div>
	);
}
