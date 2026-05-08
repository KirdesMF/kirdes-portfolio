export const terminalPanelNames = ["terminal", "route", "editor"] as const;

export type TerminalPanelName = (typeof terminalPanelNames)[number];

export function parseTerminalPanelName(value: unknown): TerminalPanelName {
	if (typeof value !== "string") return "terminal";
	if (terminalPanelNames.includes(value as TerminalPanelName)) return value as TerminalPanelName;

	return "terminal";
}
