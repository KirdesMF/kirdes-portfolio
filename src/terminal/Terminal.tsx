import { useState } from "react";
import { TerminalFooter } from "#/terminal/TerminalFooter";
import { TerminalOutput } from "#/terminal/TerminalOutput";
import type { TerminalEntry } from "#/terminal/TerminalPrompt";
import { TerminalPrompt } from "#/terminal/TerminalPrompt";
import { getCommandResponse } from "#/terminal/terminal-commands";

let nextId = 0;

function createEntry(type: TerminalEntry["type"], content: string): TerminalEntry {
	return { id: String(nextId++), type, content };
}

export function Terminal() {
	const [entries, setEntries] = useState<TerminalEntry[]>([]);

	function handleSubmit(command: string) {
		const response = getCommandResponse(command);

		setEntries((previous) => [
			...previous,
			createEntry("input", command),
			createEntry("output", response),
		]);
	}

	return (
		<div className="flex flex-1 flex-col">
			<TerminalOutput entries={entries} />
			<div className="shrink-0">
				<TerminalPrompt onSubmit={handleSubmit} />
				<TerminalFooter />
			</div>
		</div>
	);
}
