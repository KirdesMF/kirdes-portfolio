import type { ReactNode } from "react";
import { useRef, useState } from "react";
import {
	createHistoryEntry,
	createInitialHistory,
	type TerminalHistoryEntry,
} from "./terminal-history";

type UseCommandHistoryResult = {
	history: Array<TerminalHistoryEntry>;
	commandHistory: Array<string>;
	clearHistory: () => void;
	pushHistory: (input: string, output: ReactNode) => void;
};

export function useCommandHistory(): UseCommandHistoryResult {
	const [history, setHistory] = useState(createInitialHistory);
	const commandHistoryRef = useRef<Array<string>>([]);

	function pushHistory(input: string, output: ReactNode): void {
		const entry = createHistoryEntry(input, output);
		setHistory((previous) => [...previous, entry]);

		if (input !== "whoami") {
			commandHistoryRef.current.push(input);
		}
	}

	function clearHistory(): void {
		setHistory([]);
	}

	return {
		clearHistory,
		commandHistory: commandHistoryRef.current,
		history,
		pushHistory,
	};
}
