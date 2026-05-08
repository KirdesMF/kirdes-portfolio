import * as v from "valibot";
import { isTerminalFileName, type TerminalFileName } from "./terminal-files";
import { parseTerminalPanelName, type TerminalPanelName } from "./terminal-panel-types";

const RawTerminalSearch = v.object({
	file: v.optional(v.string()),
	files: v.optional(v.union([v.array(v.string()), v.string()]), []),
	panel: v.optional(v.string(), "terminal"),
});

function dedupeFiles(files: Array<string>): Array<TerminalFileName> {
	const knownFiles = files.filter(isTerminalFileName);
	return [...new Set(knownFiles)];
}

function normalizeFiles(files: string | Array<string>): Array<TerminalFileName> {
	if (Array.isArray(files)) return dedupeFiles(files);

	return dedupeFiles([files]);
}

export type TerminalSearch = {
	file: TerminalFileName | undefined;
	files: Array<TerminalFileName>;
	panel: TerminalPanelName;
};

export function parseTerminalSearch(search: Record<string, unknown>): TerminalSearch {
	const result = v.safeParse(RawTerminalSearch, search);
	const rawSearch = result.success
		? result.output
		: { file: undefined, files: [], panel: "terminal" };
	const activeFile =
		rawSearch.file && isTerminalFileName(rawSearch.file) ? rawSearch.file : undefined;
	const files = activeFile
		? dedupeFiles([...normalizeFiles(rawSearch.files), activeFile])
		: normalizeFiles(rawSearch.files);
	const file = activeFile ?? files.at(0);
	const panel = parseTerminalPanelName(rawSearch.panel);

	return {
		file,
		files,
		panel,
	};
}
