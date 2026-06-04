export const terminalCommands = [
	"cat",
	"cd",
	"clear",
	"config",
	"close",
	"date",
	"email",
	"git",
	"github",
	"help",
	"history",
	"lang",
	"linkedin",
	"ls",
	"man",
	"open",
	"pwd",
	"reload",
	"rm",
	"settings",
	"social",
	"source",
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
