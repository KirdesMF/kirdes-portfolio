import type { ReactNode } from "react";
import { InfosOutput, WhoamiOutput } from "#/terminal/terminal-profile-outputs";
import { WelcomeOutput } from "./terminal-command-outputs";

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
		createHistoryEntry("cat infos.txt", <InfosOutput />),
		createHistoryEntry("bun dev", "dev server running on port 3000"),
		createHistoryEntry("nvim .", "opening editor"),
	];
}
