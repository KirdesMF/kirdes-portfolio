import type { ReactNode } from "react";
import { create } from "zustand";
import {
	createHistoryEntry,
	createInitialHistory,
	type TerminalHistoryEntry,
} from "#/terminal/terminal-history";

type TerminalHistoryStore = {
	history: Array<TerminalHistoryEntry>;
	commandHistory: Array<string>;
	pushHistory: (input: string, output: ReactNode) => void;
	clearHistory: () => void;
};

export const useTerminalHistory = create<TerminalHistoryStore>((set) => ({
	history: createInitialHistory(),
	commandHistory: [],

	pushHistory: (input, output) => {
		const entry = createHistoryEntry(input, output);
		set((s) => ({ history: [...s.history, entry] }));

		if (input !== "whoami") {
			set((s) => ({ commandHistory: [...s.commandHistory, input] }));
		}
	},

	clearHistory: () => set({ history: [] }),
}));
