import { findEditorFile } from "#/editor/editor-files";
import type { EditorFileEntry } from "#/editor/editor-files.types";

export type MarkdownLinkRange = {
	start: number;
	end: number;
	url: string;
};

/** Matches [text](url) excluding image syntax ![alt](url). */
const MARKDOWN_LINK_RE = /(?<!!)\[([^\]]*)\]\(([^)]+)\)/g;

export function findMarkdownLinkRanges(lineText: string): MarkdownLinkRange[] {
	const ranges: MarkdownLinkRange[] = [];
	MARKDOWN_LINK_RE.lastIndex = 0;
	let match = MARKDOWN_LINK_RE.exec(lineText);
	while (match !== null) {
		ranges.push({
			start: match.index,
			end: match.index + match[0].length,
			url: match[2] ?? "",
		});
		match = MARKDOWN_LINK_RE.exec(lineText);
	}
	return ranges;
}

const EXTERNAL_PROTOCOL_RE = /^(https?|mailto):/i;
const ANY_PROTOCOL_RE = /^[a-z][a-z0-9+.-]*:/i;
const APP_ROUTES = new Set(["/about", "/work", "/contact", "/editor", "/terminal"]);

export type LinkTarget = "external" | "app-route" | "internal-file" | "unsafe";

export function getLinkPath(url: string): string {
	return url.trim().split("?")[0]?.split("#")[0] ?? "";
}

export function classifyLinkUrl(url: string): LinkTarget {
	const trimmed = url.trim();
	if (trimmed.startsWith("//")) return "unsafe";
	if (EXTERNAL_PROTOCOL_RE.test(trimmed)) return "external";
	if (ANY_PROTOCOL_RE.test(trimmed)) return "unsafe";

	const pathOnly = getLinkPath(trimmed);
	if (APP_ROUTES.has(pathOnly)) return "app-route";
	return "internal-file";
}

export function resolveMarkdownFileLink(
	linkUrl: string,
	currentFileId: string,
): EditorFileEntry | null {
	if (classifyLinkUrl(linkUrl) !== "internal-file") return null;

	const pathOnly = getLinkPath(linkUrl);
	if (!pathOnly || pathOnly.startsWith("#")) return null;

	const currentFolder = currentFileId.includes("/")
		? currentFileId.slice(0, currentFileId.lastIndexOf("/"))
		: "~";

	if (pathOnly.startsWith("/")) {
		return findEditorFile(pathOnly.slice(1));
	}

	if (!pathOnly.includes("/")) {
		const local = findEditorFile(`${currentFolder}/${pathOnly}`);
		if (local) return local;
		return findEditorFile(pathOnly);
	}

	const parts = currentFolder === "~" ? [] : currentFolder.split("/");
	for (const part of pathOnly.split("/")) {
		if (part === "." || part === "") continue;
		if (part === "..") {
			parts.pop();
			continue;
		}
		parts.push(part);
	}

	return findEditorFile(parts.join("/"));
}
