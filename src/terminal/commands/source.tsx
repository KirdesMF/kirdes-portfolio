import {
	getSectionByFolder,
	getSectionByLabel,
	getSectionByRoute,
} from "#/terminal/section-metadata";
import { SourceOutput } from "../terminal-command-outputs";
import type { CommandHandler } from "./types";

/**
 * source [path] — display route/content/renderer relationship.
 *
 * source about      — lookup by label or folder name
 * source /about     — lookup by route path
 * source (no args)  — use current route
 */
export const handleSource: CommandHandler = (ctx) => {
	if (!ctx.normalized.startsWith("source")) return false;

	const arg = ctx.normalized.slice(6).trim();

	// `source` with no arg — use current route
	if (arg === "") {
		const meta = getSectionByRoute(ctx.currentRoute);

		if (meta) {
			ctx.pushHistory(<SourceOutput meta={meta} />);
		} else {
			ctx.pushHistory("no source metadata for current route");
		}

		return true;
	}

	// `source /about` — lookup by route
	// `source about`  — lookup by label/folder
	let meta = arg.startsWith("/")
		? (getSectionByRoute(`/terminal${arg === "/" ? "" : arg}`) ?? getSectionByRoute(arg))
		: (getSectionByLabel(arg) ?? getSectionByFolder(arg));

	if (!meta) {
		// Try as direct route
		meta = getSectionByRoute(`/terminal/${arg}`);
	}

	if (meta) {
		ctx.pushHistory(<SourceOutput meta={meta} />);
	} else {
		ctx.pushHistory(`no section found: ${arg}`);
	}

	return true;
};
