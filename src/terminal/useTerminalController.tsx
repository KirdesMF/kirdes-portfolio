import { type EditorFileName, lsFiles, resolveFile } from "#/editor/editor-files";
import { dispatch } from "./commands/dispatch";
import type { CommandContext } from "./commands/types";
import type { TerminalRoutePath } from "./terminal-routes";
import { useCommandHistory } from "./useCommandHistory";
import { useTerminalSearchActions } from "./useTerminalSearchActions";

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
	const { clearHistory, commandHistory, history, pushHistory } = useCommandHistory();
	const actions = useTerminalSearchActions({
		activeFileName,
		currentTerminalRoute,
		isHomeRoute,
		openFileNames,
	});

	function handleSubmit(command: string) {
		const ctx: CommandContext = {
			raw: command,
			normalized: command.trim().toLowerCase(),
			pushHistory: (output) => pushHistory(command, output),
			navigate: actions.navigate,
			currentRoute: currentTerminalRoute,
			isHomeRoute,
			activeFileName,
			openFileNames,
			openFile: actions.openFile,
			closeFile: actions.closeFile,
			closeEditor: actions.closeEditor,
			openEditor: actions.openEditor,
			resolveFile,
			lsFiles,
			commandHistory,
			clearHistory,
			openDialog: actions.openDialog,
		};

		dispatch(ctx);
	}

	return {
		closeDialog: actions.closeDialog,
		closeEditor: actions.closeEditor,
		closeFile: actions.closeFile,
		handleSubmit,
		history,
		openFile: actions.openFile,
		selectFile: actions.selectFile,
		setMobilePanel: actions.setMobilePanel,
	};
}
