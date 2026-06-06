import * as v from "valibot";
import { type EditorFileName, isEditorFileName } from "#/editor/editor-files";
import {
	type MaximizedPanel,
	parseMaximized,
	parseTerminalPanelName,
	type TerminalPanelName,
} from "./terminal-panel-types";

const RawTerminalSearch = v.object({
	activeFile: v.optional(v.string()),
	editor: v.optional(v.string()),
	files: v.optional(v.union([v.array(v.string()), v.string()]), ""),
	dialog: v.optional(v.string()),
	maximized: v.optional(v.string()),
	panel: v.optional(v.string(), "terminal"),
});

function dedupeFiles(files: Array<string>): Array<EditorFileName> {
	const knownFiles = files.filter(isEditorFileName);
	return [...new Set(knownFiles)];
}

function splitFiles(files: string): Array<string> {
	return files
		.split(",")
		.map((file) => file.trim())
		.filter(Boolean);
}

function normalizeFiles(files: string | Array<string>): Array<EditorFileName> {
	if (Array.isArray(files)) return dedupeFiles(files.flatMap(splitFiles));

	return dedupeFiles(splitFiles(files));
}

export type TerminalSearch = {
	activeFile?: EditorFileName;
	editor?: "open" | "closed";
	files: Array<EditorFileName>;
	dialog?: "settings" | "help";
	maximized?: MaximizedPanel;
	panel: TerminalPanelName;
};

export function parseTerminalSearch(search: Record<string, unknown>): TerminalSearch {
	const result = v.safeParse(RawTerminalSearch, search);
	const rawSearch = result.success
		? result.output
		: {
				activeFile: undefined,
				dialog: undefined,
				editor: undefined,
				files: "",
				maximized: undefined,
				panel: "terminal",
			};
	const editor = rawSearch.editor === "open" ? "open" : rawSearch.editor === "closed" ? "closed" : "open";
	const files = editor === "open" ? normalizeFiles(rawSearch.files) : [];
	const activeFile = files.find((fileName) => fileName === rawSearch.activeFile) ?? files.at(0);
	const panel = parseTerminalPanelName(rawSearch.panel);
	const maximized = parseMaximized(rawSearch.maximized);
	const dialog =
		rawSearch.dialog === "settings" || rawSearch.dialog === "help" ? rawSearch.dialog : undefined;

	return {
		activeFile,
		dialog,
		editor,
		files,
		maximized,
		panel,
	};
}
