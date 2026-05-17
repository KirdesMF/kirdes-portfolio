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
 * ```ts
 * formatTerminalCwd("/terminal")        // "~"
 * formatTerminalCwd("/terminal/about")  // "~/about"
 * formatTerminalCwd("/terminal/about", { trailingSlash: true }) // "~/about/"
 * ```
 */
export function formatTerminalCwd(
	route: string | null | undefined,
	options?: FormatOptions,
): string {
	if (!route || route === "/terminal") {
		return options?.trailingSlash ? "~/" : "~";
	}

	const folder = getTerminalFolder(route) ?? "";
	const suffix = options?.trailingSlash ? "/" : "";

	return `~/${folder}${suffix}`;
}
