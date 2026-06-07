import { terminalCommands } from "./terminal-commands";

export const terminalNavigationItems = [
	{ command: "/home", label: "home", to: "/terminal/home" },
	{ command: "/about", label: "about", to: "/terminal/about" },
	{ command: "/work", label: "work", to: "/terminal/work" },
	{ command: "/contact", label: "contact", to: "/terminal/contact" },
] as const;

export const terminalRoutes = terminalNavigationItems.map(({ command }) => command);

export type TerminalRouteCommand = (typeof terminalNavigationItems)[number]["command"];
export type TerminalRoutePath = (typeof terminalNavigationItems)[number]["to"] | "/terminal";

export const commandNames = [...terminalRoutes, ...terminalCommands] as const;

function normalizeRouteTarget(input: string): string {
	const normalized = input.trim().toLowerCase();
	if (normalized === "" || normalized === "~") return "/home";
	if (normalized.startsWith("/")) return normalized;

	return `/${normalized}`;
}

export function getTerminalRoutePath(pathname: string): TerminalRoutePath {
	const item = terminalNavigationItems.find(({ to }) => to === pathname);
	return item?.to ?? (pathname === "/terminal" ? "/terminal" : "/terminal/home");
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
