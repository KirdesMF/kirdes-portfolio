import { useRouter } from "@tanstack/react-router";
import { lsFiles, resolveFile } from "#/editor/editor-files";
import { useTerminalHistory } from "#/ide/terminal-history-store";
import type { CommandContext } from "./commands/command.types";
import { dispatch } from "./commands/dispatch";

export function useTerminalController({
	currentRoute,
	setMode,
}: {
	currentRoute: string;
	setMode: (mode: "light" | "dark") => void;
}) {
	const router = useRouter();
	const store = useTerminalHistory();

	function navigate(to: string, search?: Record<string, unknown>) {
		// biome-ignore lint/suspicious/noExplicitAny: router.navigate generics are too strict
		void (router.navigate as any)({ to, search });
	}

	function reload() {
		void router.navigate({ to: "/" });
	}

	function handleSubmit(command: string) {
		const ctx: CommandContext = {
			raw: command,
			normalized: command.trim().toLowerCase(),
			pushHistory: (output) => store.pushHistory(command, output),
			navigate,
			reload,
			currentRoute,
			resolveFile,
			lsFiles,
			commandHistory: store.commandHistory,
			clearHistory: () => store.clearHistory(),
			setMode,
		};

		dispatch(ctx);
	}

	return {
		handleSubmit,
		history: store.history,
	};
}
