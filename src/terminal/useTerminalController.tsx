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
	setMode,
}: {
	activeFileName?: EditorFileName;
	currentTerminalRoute: TerminalRoutePath;
	isHomeRoute: boolean;
	openFileNames: Array<EditorFileName>;
	setMode: (mode: "light" | "dark") => void;
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
			reload: actions.reload,
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
			setMode,
		};

		dispatch(ctx);
	}

	return {
		closeEditor: actions.closeEditor,
		closeFile: actions.closeFile,
		handleSubmit,
		history,
		openFile: actions.openFile,
		selectFile: actions.selectFile,
		setMobilePanel: actions.setMobilePanel,
	};
}
