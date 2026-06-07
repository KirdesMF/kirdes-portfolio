import type { ReactNode } from "react";
import { BunDevOutput } from "#/terminal/terminal-command-outputs";
import { InfosOutput, WhoamiOutput } from "#/terminal/terminal-profile-outputs";

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
		createHistoryEntry("whoami", <WhoamiOutput />),
		createHistoryEntry("cat infos.txt", <InfosOutput />),
		createHistoryEntry("bun dev", <BunDevOutput />),
		createHistoryEntry("nvim .", "opening editor"),
	];
}
