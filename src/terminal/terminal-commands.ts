export const terminalCommands = [
	"cat",
	"cd",
	"clear",
	"config",
	"exit",
	"email",
	"git",
	"github",
	"help",
	"history",
	"lang",
	"linkedin",
	"ls",
	"mode",
	"nvim",
	"reload",
	"settings",
	"social",
	"tree",
	"whoami",
	"x",
] as const;

export type TerminalCommandName = (typeof terminalCommands)[number];

export function parseTerminalCommand(input: string): TerminalCommandName | null {
	const normalized = input.trim().toLowerCase();
	const command = terminalCommands.find((entry) => entry === normalized);
	return command ?? null;
}
