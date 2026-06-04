/**
 * Terminal path formatting helpers.
 *
 * Centralises duplicated route string manipulation for cwd display
 * and folder resolution across terminal components.
 */

/** Extract folder name from a terminal route, e.g. "/terminal/about" → "about". */
export function getTerminalFolder(route: string | null | undefined): string | null {
	if (!route || route === "/terminal") return null;

	const parts = route.split("/");
	return parts[parts.length - 1] ?? null;
}

type FormatOptions = {
	/** Whether to append a trailing slash. Defaults to false. */
	trailingSlash?: boolean;
};

/**
 * Format a terminal route as a cwd string, e.g. "/terminal/about" → "~/about".
 *
 * Works for nested routes too: "/terminal/work/intent" → "~/work/intent".
 *
 * ```ts
 * formatTerminalCwd("/terminal")        // "~"
 * formatTerminalCwd("/terminal/about")  // "~/about"
 * formatTerminalCwd("/terminal/work/intent")  // "~/work/intent"
 * formatTerminalCwd("/terminal", { trailingSlash: true }) // "~/"
 * ```
 */
export function formatTerminalCwd(
	route: string | null | undefined,
	options?: FormatOptions,
): string {
	if (!route || route === "/terminal") {
		return options?.trailingSlash ? "~/" : "~";
	}

	// Replace /terminal/ prefix to preserve full subpath (including nested routes)
	const subpath = route.replace("/terminal/", "");
	const suffix = options?.trailingSlash ? "/" : "";

	return `~/${subpath}${suffix}`;
}
