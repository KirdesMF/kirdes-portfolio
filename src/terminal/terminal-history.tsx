import type { ReactNode } from "react";
import { WelcomeOutput, WhoamiOutput } from "./terminal-command-outputs";

export type TerminalHistoryEntry = {
	id: string;
	input: string;
	output: ReactNode;
};

let nextHistoryEntryId = 0;

export function createHistoryEntry(input: string, output: ReactNode): TerminalHistoryEntry {
	return {
		id: String(nextHistoryEntryId++),
		input,
		output,
	};
}

export function createInitialHistory(): Array<TerminalHistoryEntry> {
	return [
		createHistoryEntry("welcome", <WelcomeOutput />),
		createHistoryEntry("whoami", <WhoamiOutput />),
	];
}
