import { useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { type EditorFileName, lsFiles, resolveFile } from "../editor/editor-files";
import { dispatch } from "./commands/dispatch";
import type { CommandContext } from "./commands/types";
import { createHistoryEntry, createInitialHistory } from "./terminal-history";
import type { TerminalPanelName } from "./terminal-panel-types";
import type { TerminalRoutePath } from "./terminal-routes";

function addOpenFile(
	files: Array<EditorFileName>,
	fileName: EditorFileName,
): Array<EditorFileName> {
	if (files.includes(fileName)) return files;
	return [...files, fileName];
}

function removeOpenFile(
	files: Array<EditorFileName>,
	fileName: EditorFileName,
): Array<EditorFileName> {
	return files.filter((openFileName) => openFileName !== fileName);
}

function getNextActiveFile({
	activeFileName,
	closedFileName,
	files,
}: {
	activeFileName?: EditorFileName;
	closedFileName: EditorFileName;
	files: Array<EditorFileName>;
}): EditorFileName | undefined {
	if (activeFileName !== closedFileName) return activeFileName;

	const closedFileIndex = files.indexOf(closedFileName);
	const remainingFiles = removeOpenFile(files, closedFileName);

	return remainingFiles.at(closedFileIndex) ?? remainingFiles.at(-1);
}

export function useTerminalController({
	activeFileName,
	currentTerminalRoute,
	isHomeRoute,
	openFileNames,
}: {
	activeFileName?: EditorFileName;
	currentTerminalRoute: TerminalRoutePath;
	isHomeRoute: boolean;
	openFileNames: Array<EditorFileName>;
}) {
	const router = useRouter();
	const [history, setHistory] = useState(createInitialHistory);
	const commandHistoryRef = useRef<Array<string>>([]);

	function pushHistory(input: string, output: ReactNode) {
		const entry = createHistoryEntry(input, output);
		setHistory((previous) => [...previous, entry]);

		if (input !== "welcome" && input !== "whoami") {
			commandHistoryRef.current.push(input);
		}
	}

	function navigate(to: string, search?: Record<string, unknown>) {
		// biome-ignore lint/suspicious/noExplicitAny: router.navigate generics are too strict for dynamic routes
		void (router.navigate as any)({
			to,
			search: (previous: Record<string, unknown>) => ({
				activeFile: previous.activeFile,
				dialog: previous.dialog,
				editor: previous.editor,
				files: previous.files ?? [],
				panel: previous.panel ?? "terminal",
				...search,
			}),
		});
	}

	function openDialog(dialogName: "music") {
		void router.navigate({
			search: (previous) => ({
				activeFile: previous.activeFile,
				dialog: dialogName,
				editor: previous.editor,
				files: previous.files ?? [],
				panel: previous.panel as TerminalPanelName,
			}),
			to: currentTerminalRoute,
		});
	}

	function closeDialog() {
		void router.navigate({
			search: (previous) => ({
				activeFile: previous.activeFile,
				dialog: undefined,
				editor: previous.editor,
				files: previous.files ?? [],
				panel: previous.panel as TerminalPanelName,
			}),
			to: currentTerminalRoute,
		});
	}

	function setMobilePanel(panel: TerminalPanelName) {
		void router.navigate({
			search: (previous) => ({
				activeFile: previous.activeFile,
				dialog: previous.dialog,
				editor: previous.editor,
				files: previous.files ?? [],
				panel,
			}),
			to: currentTerminalRoute,
		});
	}

	function closeEditor() {
		void router.navigate({
			search: {
				activeFile: undefined,
				dialog: undefined,
				editor: undefined,
				files: [],
				panel: isHomeRoute ? "terminal" : "route",
			},
			to: currentTerminalRoute,
		});
	}

	function closeFile(fileName: string) {
		const file = resolveFile(fileName, currentTerminalRoute);
		if (file === null) return;

		const files = removeOpenFile(openFileNames, file.id);

		void router.navigate({
			search: {
				activeFile: getNextActiveFile({
					activeFileName,
					closedFileName: file.id,
					files: openFileNames,
				}),
				dialog: undefined,
				editor: "open",
				files,
				panel: "editor",
			},
			to: currentTerminalRoute,
		});
	}

	function openEditor() {
		void router.navigate({
			search: (previous) => ({
				activeFile: previous.activeFile,
				dialog: previous.dialog,
				editor: "open",
				files: previous.files ?? [],
				panel: "editor",
			}),
			to: currentTerminalRoute,
		});
	}

	function openFile(name: string): boolean {
		const file = resolveFile(name, currentTerminalRoute);
		if (file === null) return false;

		void router.navigate({
			search: {
				activeFile: file.id,
				dialog: undefined,
				editor: "open",
				files: addOpenFile(openFileNames, file.id),
				panel: "editor",
			},
			to: currentTerminalRoute,
		});
		return true;
	}

	function selectFile(fileName: string) {
		const file = resolveFile(fileName, currentTerminalRoute);
		if (file === null) return;

		void router.navigate({
			search: {
				activeFile: file.id,
				dialog: undefined,
				editor: "open",
				files: addOpenFile(openFileNames, file.id),
				panel: "editor",
			},
			to: currentTerminalRoute,
		});
	}

	function clearHistory() {
		setHistory([]);
	}

	function handleSubmit(command: string) {
		const ctx: CommandContext = {
			raw: command,
			normalized: command.trim().toLowerCase(),
			pushHistory: (output) => pushHistory(command, output),
			navigate,
			currentRoute: currentTerminalRoute,
			isHomeRoute,
			activeFileName,
			openFileNames,
			openFile,
			closeFile,
			closeEditor,
			openEditor,
			resolveFile,
			lsFiles,
			commandHistory: commandHistoryRef.current,
			clearHistory,
			openDialog,
		};

		dispatch(ctx);
	}

	return {
		closeDialog,
		closeEditor,
		closeFile,
		handleSubmit,
		history,
		openFile,
		selectFile,
		setMobilePanel,
	};
}
