import { terminalCommands } from "./terminal-commands";

export const terminalNavigationItems = [
	{ command: "/home", label: "home", to: "/editor" },
	{ command: "/about", label: "about", to: "/about" },
	{ command: "/work", label: "work", to: "/work" },
	{ command: "/contact", label: "contact", to: "/contact" },
] as const;

export const terminalRoutes = terminalNavigationItems.map(({ command }) => command);

export type TerminalRouteCommand = (typeof terminalNavigationItems)[number]["command"];
export type TerminalRoutePath =
	| (typeof terminalNavigationItems)[number]["to"]
	| "/editor"
	| "/terminal";

export const commandNames = [...terminalRoutes, ...terminalCommands] as const;

function normalizeRouteTarget(input: string): string {
	const normalized = input.trim().toLowerCase();
	if (normalized === "" || normalized === "~") return "/home";
	if (normalized.startsWith("/")) return normalized;

	return `/${normalized}`;
}

export function getTerminalRoutePath(pathname: string): TerminalRoutePath {
	const item = terminalNavigationItems.find(({ to }) => to === pathname);
	return item?.to ?? "/editor";
}

export function parseTerminalRouteTarget(input: string): TerminalRoutePath | null {
	const normalized = normalizeRouteTarget(input);
	const item = terminalNavigationItems.find(({ command }) => command === normalized);
	return item?.to ?? null;
}

export function parseTerminalRoute(input: string): TerminalRoutePath | null {
	const normalized = input.trim().toLowerCase();
	if (!normalized.startsWith("/")) return null;

	return parseTerminalRouteTarget(normalized);
}
