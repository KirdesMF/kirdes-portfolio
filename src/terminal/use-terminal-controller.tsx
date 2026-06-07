import { type EditorFileName, lsFiles, resolveFile } from "#/editor/editor-files";
import type { CommandContext } from "./commands/command.types";
import { dispatch } from "./commands/dispatch";
import type { TerminalRoutePath } from "./terminal-routes";
import { useCommandHistory } from "./use-command-history";
import { useTerminalSearchActions } from "./use-terminal-search-actions";

export function useTerminalController({
	activeFileName,
	currentTerminalRoute,
	isTerminalOnlyRoute,
	openFileNames,
	setMode,
}: {
	activeFileName?: EditorFileName;
	currentTerminalRoute: TerminalRoutePath;
	isTerminalOnlyRoute: boolean;
	openFileNames: Array<EditorFileName>;
	setMode: (mode: "light" | "dark") => void;
}) {
	const { clearHistory, commandHistory, history, pushHistory } = useCommandHistory();
	const actions = useTerminalSearchActions({
		activeFileName,
		currentTerminalRoute,
		isTerminalOnlyRoute,
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
			isHomeRoute: isTerminalOnlyRoute,
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
