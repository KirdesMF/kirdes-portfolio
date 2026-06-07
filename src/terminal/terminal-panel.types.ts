export const terminalPanelNames = ["terminal", "route", "editor"] as const;

export type TerminalPanelName = (typeof terminalPanelNames)[number];

export function parseTerminalPanelName(value: unknown): TerminalPanelName {
	if (typeof value !== "string") return "terminal";
	if (terminalPanelNames.includes(value as TerminalPanelName)) return value as TerminalPanelName;

	return "terminal";
}

export type MaximizedPanel = "route" | "editor";

export function parseMaximized(value: unknown): MaximizedPanel | undefined {
	if (value === "route" || value === "editor") return value;

	return undefined;
}
