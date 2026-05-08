import { terminalCommands } from "./terminal-commands";

export const terminalRoutes = ["/", "/contact", "/work", "/skill", "/projects"] as const;

export type TerminalRouteCommand = (typeof terminalRoutes)[number];

export type TerminalRoutePath =
	| "/terminal"
	| "/terminal/contact"
	| "/terminal/work"
	| "/terminal/skill"
	| "/terminal/projects";

export const commandNames = [...terminalRoutes, ...terminalCommands] as const;

const routePathByCommand: Record<TerminalRouteCommand, TerminalRoutePath> = {
	"/": "/terminal",
	"/contact": "/terminal/contact",
	"/work": "/terminal/work",
	"/skill": "/terminal/skill",
	"/projects": "/terminal/projects",
};

export function parseTerminalRoute(input: string): TerminalRoutePath | null {
	const normalized = input.trim().toLowerCase() as TerminalRouteCommand;
	if (!normalized.startsWith("/")) return null;

	return routePathByCommand[normalized] ?? null;
}
