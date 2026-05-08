export const terminalCommands = ["cd", "clear", "help", "ls", "whoami"] as const;

export type TerminalCommandName = (typeof terminalCommands)[number];

export function parseTerminalCommand(input: string): TerminalCommandName | null {
	const normalized = input.trim().toLowerCase();
	const command = terminalCommands.find((entry) => entry === normalized);
	return command ?? null;
}
