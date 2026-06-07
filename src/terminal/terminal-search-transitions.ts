import type { MaximizedPanel, TerminalPanelName } from "#/terminal/terminal-panel-types";

export type TerminalSearchDraft = {
	activeFile?: string;
	dialog?: "settings" | "help";
	editor?: "open" | "closed";
	files?: ReadonlyArray<string>;
	maximized?: MaximizedPanel;
	panel?: TerminalPanelName;
};

export type TerminalSearchTransition = Omit<TerminalSearchDraft, "files"> & {
	files: Array<string>;
	panel: TerminalPanelName;
};

export function addOpenFile(
	files: ReadonlyArray<string> | undefined,
	fileName: string,
): Array<string> {
	if (files?.includes(fileName)) return [...files];

	return [...(files ?? []), fileName];
}

export function removeOpenFile(files: ReadonlyArray<string>, fileName: string): Array<string> {
	return files.filter((openFileName) => openFileName !== fileName);
}

export function getNextActiveFile({
	activeFileName,
	closedFileName,
	files,
}: {
	activeFileName?: string;
	closedFileName: string;
	files: ReadonlyArray<string>;
}): string | undefined {
	if (activeFileName !== closedFileName) return activeFileName;

	const closedFileIndex = files.indexOf(closedFileName);
	const remainingFiles = removeOpenFile(files, closedFileName);

	return remainingFiles.at(closedFileIndex) ?? remainingFiles.at(-1);
}

export function keepTerminalSearch(
	previous: TerminalSearchDraft,
	updates: TerminalSearchDraft = {},
): TerminalSearchTransition {
	return {
		...previous,
		...updates,
		files: [...(updates.files ?? previous.files ?? [])],
		panel: updates.panel ?? previous.panel ?? "terminal",
	};
}

export function showRoutePanelSearch(previous: TerminalSearchDraft): TerminalSearchTransition {
	return keepTerminalSearch(previous, { panel: "route" });
}

export function showTerminalPanelSearch(previous: TerminalSearchDraft): TerminalSearchTransition {
	return keepTerminalSearch(previous, { maximized: undefined, panel: "terminal" });
}

export function openEditorPanelSearch(previous: TerminalSearchDraft): TerminalSearchTransition {
	return keepTerminalSearch(previous, { editor: "open", panel: "editor" });
}

export function openEditorFileSearch(
	previous: TerminalSearchDraft,
	fileName: string,
): TerminalSearchTransition {
	return keepTerminalSearch(previous, {
		activeFile: fileName,
		editor: "open",
		files: addOpenFile(previous.files, fileName),
		panel: "editor",
	});
}

export function closeEditorSearch(
	previous: TerminalSearchDraft,
	{ isTerminalOnlyRoute }: { isTerminalOnlyRoute: boolean },
): TerminalSearchTransition {
	return keepTerminalSearch(previous, {
		activeFile: undefined,
		editor: "closed",
		files: [],
		maximized: undefined,
		panel: isTerminalOnlyRoute ? "terminal" : "route",
	});
}

export function closeEditorFileSearch(
	previous: TerminalSearchDraft,
	{
		activeFileName,
		closedFileName,
		openFileNames,
	}: {
		activeFileName?: string;
		closedFileName: string;
		openFileNames: ReadonlyArray<string>;
	},
): TerminalSearchTransition {
	const files = removeOpenFile(openFileNames, closedFileName);

	return keepTerminalSearch(previous, {
		activeFile: getNextActiveFile({
			activeFileName,
			closedFileName,
			files: openFileNames,
		}),
		editor: "open",
		files,
		panel: "editor",
	});
}

export function setDialogSearch(
	previous: TerminalSearchDraft,
	dialog: TerminalSearchDraft["dialog"],
): TerminalSearchTransition {
	return keepTerminalSearch(previous, { dialog });
}

export function toggleMaximizedSearch(
	previous: TerminalSearchDraft,
	panel: MaximizedPanel,
): TerminalSearchTransition {
	return keepTerminalSearch(previous, {
		maximized: previous.maximized === panel ? undefined : panel,
	});
}
