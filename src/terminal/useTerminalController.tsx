import { useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { type EditorFileName, findEditorFile } from "../editor/editor-files";
import { parseTerminalCommand } from "./terminal-commands";
import { createHistoryEntry, createInitialHistory } from "./terminal-history";
import { HelpOutput, RoutesOutput, WhoamiOutput } from "./terminal-command-outputs";
import type { TerminalPanelName } from "./terminal-panel-types";
import type { TerminalRoutePath } from "./terminal-routes";
import { parseTerminalRoute, parseTerminalRouteTarget } from "./terminal-routes";

function addOpenFile(
	files: Array<EditorFileName>,
	fileName: EditorFileName,
): Array<EditorFileName> {
	if (files.includes(fileName)) return files;

	return [...files, fileName];
}

function removeOpenFile(files: Array<EditorFileName>, fileName: string): Array<EditorFileName> {
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

	function pushHistory(input: string, output: ReactNode) {
		const entry = createHistoryEntry(input, output);
		setHistory((previous) => [...previous, entry]);
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
		const fileToClose = findEditorFile(fileName);
		if (fileToClose === null) return;

		const files = removeOpenFile(openFileNames, fileToClose.name);

		void router.navigate({
			search: {
				activeFile: getNextActiveFile({
					activeFileName,
					closedFileName: fileToClose.name,
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
		const file = findEditorFile(name);
		if (file === null) return false;

		void router.navigate({
			search: {
				activeFile: file.name,
				dialog: undefined,
				editor: "open",
				files: addOpenFile(openFileNames, file.name),
				panel: "editor",
			},
			to: currentTerminalRoute,
		});
		return true;
	}

	function selectFile(fileName: string) {
		const file = findEditorFile(fileName);
		if (file === null) return;

		void router.navigate({
			search: {
				activeFile: file.name,
				dialog: undefined,
				editor: "open",
				files: addOpenFile(openFileNames, file.name),
				panel: "editor",
			},
			to: currentTerminalRoute,
		});
	}

	function handleSubmit(command: string) {
		const route = parseTerminalRoute(command);
		if (route) {
			pushHistory(command, `opening ${command}`);
			void router.navigate({
				search: (previous) => ({
					activeFile: previous.activeFile,
					dialog: previous.dialog,
					editor: previous.editor,
					files: previous.files ?? [],
					panel: "route",
				}),
				to: route,
			});
			return;
		}

		const normalizedCommand = command.trim().toLowerCase();
		if (normalizedCommand === "cd" || normalizedCommand.startsWith("cd ")) {
			const target = normalizedCommand.slice(2).trim();
			const targetRoute = parseTerminalRouteTarget(target);
			if (targetRoute) {
				pushHistory(command, `opening ${target || "~"}`);
				void router.navigate({
					search: (previous) => ({
						activeFile: previous.activeFile,
						dialog: previous.dialog,
						editor: previous.editor,
						files: previous.files ?? [],
						panel: "route",
					}),
					to: targetRoute,
				});
				return;
			}

			pushHistory(command, `directory not found: ${target}`);
			return;
		}

		if (normalizedCommand.startsWith("cat ")) {
			const target = normalizedCommand.slice(3).trim();
			const file = findEditorFile(target);
			if (file) {
				pushHistory(command, file.content);
				return;
			}

			pushHistory(command, `file not found: ${target}`);
			return;
		}

		if (normalizedCommand === "open editor") {
			openEditor();
			pushHistory(command, "opening editor");
			return;
		}

		if (normalizedCommand.startsWith("open ")) {
			const target = normalizedCommand.slice(4).trim();
			if (openFile(target)) {
				pushHistory(command, `opening ${target}`);
				return;
			}

			pushHistory(command, `file not found: ${target}`);
			return;
		}

		if (normalizedCommand === "close editor") {
			closeEditor();
			return;
		}

		if (normalizedCommand === "close all") {
			void router.navigate({
				search: {
					activeFile: undefined,
					dialog: undefined,
					editor: "open",
					files: [],
					panel: "editor",
				},
				to: currentTerminalRoute,
			});
			return;
		}

		if (normalizedCommand.startsWith("close ")) {
			const target = normalizedCommand.slice(5).trim();
			const file = findEditorFile(target);
			if (file === null) {
				pushHistory(command, `file not found: ${target}`);
				return;
			}

			closeFile(file.name);
			return;
		}

		const terminalCommand = parseTerminalCommand(command);
		if (terminalCommand === "clear") {
			setHistory([]);
			return;
		}

		if (terminalCommand === "close") {
			if (activeFileName) {
				closeFile(activeFileName);
				return;
			}

			closeEditor();
			return;
		}

		if (terminalCommand === "help") {
			pushHistory(command, <HelpOutput />);
			return;
		}

		if (terminalCommand === "ls") {
			pushHistory(command, <RoutesOutput />);
			return;
		}

		if (terminalCommand === "music") {
			pushHistory(command, "opening music player");
			openDialog("music");
			return;
		}

		if (terminalCommand === "reload") {
			void router.navigate({ to: "/" });
			return;
		}

		if (terminalCommand === "whoami") {
			pushHistory(command, <WhoamiOutput />);
			return;
		}

		pushHistory(command, `command not found: ${command}`);
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
