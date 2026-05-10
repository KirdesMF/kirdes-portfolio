import { useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import {
	type EditorFileEntry,
	type EditorFileName,
	resolveFile,
	lsFiles,
} from "../editor/editor-files";
import { parseTerminalCommand } from "./terminal-commands";
import { createHistoryEntry, createInitialHistory } from "./terminal-history";
import {
	EmailOutput,
	HelpOutput,
	LsOutput,
	WhoamiOutput,
} from "./terminal-command-outputs";
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

	function catFile(name: string): EditorFileEntry | null {
		return resolveFile(name, currentTerminalRoute);
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

			// cd with no args or cd .. → go home
			if (!target || target === "..") {
				pushHistory(command, "opening ~");
				void router.navigate({
					search: (previous) => ({
						activeFile: previous.activeFile,
						dialog: previous.dialog,
						editor: previous.editor,
						files: previous.files ?? [],
						panel: "route",
					}),
					to: "/terminal",
				});
				return;
			}

			const targetRoute = parseTerminalRouteTarget(target);
			if (targetRoute) {
				pushHistory(command, `opening ${target}`);
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
			const file = catFile(target);
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
			const file = resolveFile(target, currentTerminalRoute);
			if (file === null) {
				pushHistory(command, `file not found: ${target}`);
				return;
			}

			closeFile(file.id);
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
			const { folders, files } = lsFiles(currentTerminalRoute);
			pushHistory(
				command,
				<LsOutput
					files={files}
					folders={folders}
				/>,
			);
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

		if (terminalCommand === "email") {
			pushHistory(command, <EmailOutput />);
			navigator.clipboard.writeText("cedric@kirdes.dev");
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
