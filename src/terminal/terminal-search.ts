import * as v from "valibot";
import { type EditorFileName, isEditorFileName } from "../editor/editor-files";
import type { TerminalDialogName } from "../music/music.types";
import { parseTerminalPanelName, type TerminalPanelName } from "./terminal-panel-types";

const RawTerminalSearch = v.object({
	dialog: v.optional(v.string()),
	file: v.optional(v.string()),
	files: v.optional(v.union([v.array(v.string()), v.string()]), []),
	panel: v.optional(v.string(), "terminal"),
});

function dedupeFiles(files: Array<string>): Array<EditorFileName> {
	const knownFiles = files.filter(isEditorFileName);
	return [...new Set(knownFiles)];
}

function normalizeFiles(files: string | Array<string>): Array<EditorFileName> {
	if (Array.isArray(files)) return dedupeFiles(files);

	return dedupeFiles([files]);
}

const dialogNames = ["music"] as const;

export type TerminalSearch = {
	dialog?: TerminalDialogName;
	file?: EditorFileName;
	files: Array<EditorFileName>;
	panel: TerminalPanelName;
};

export function parseTerminalSearch(search: Record<string, unknown>): TerminalSearch {
	const result = v.safeParse(RawTerminalSearch, search);
	const rawSearch = result.success
		? result.output
		: { dialog: undefined, file: undefined, files: [], panel: "terminal" };
	const dialog =
		rawSearch.dialog && (dialogNames as ReadonlyArray<string>).includes(rawSearch.dialog)
			? (rawSearch.dialog as TerminalDialogName)
			: undefined;
	const activeFile =
		rawSearch.file && isEditorFileName(rawSearch.file) ? rawSearch.file : undefined;
	const files = activeFile
		? dedupeFiles([...normalizeFiles(rawSearch.files), activeFile])
		: normalizeFiles(rawSearch.files);
	const file = activeFile ?? files.at(0);
	const panel = parseTerminalPanelName(rawSearch.panel);

	return {
		dialog,
		file,
		files,
		panel,
	};
}
