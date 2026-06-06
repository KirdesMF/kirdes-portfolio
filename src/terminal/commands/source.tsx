import { m } from "#/paraglide/messages";
import {
	getWorkspaceViewByFolder,
	getWorkspaceViewByLabel,
	getWorkspaceViewByRoute,
} from "#/workspace/workspace-catalogue";
import { SourceOutput } from "../terminal-command-outputs";
import type { CommandHandler } from "./types";

/**
 * source [path] — display route/content/renderer relationship.
 *
 * source about      — lookup by workspace view label or folder name
 * source /about     — lookup by route path
 * source (no args)  — use current route
 */
export const handleSource: CommandHandler = (ctx) => {
	if (!ctx.normalized.startsWith("source")) return false;

	const arg = ctx.normalized.slice(6).trim();

	// `source` with no arg — use current route
	if (arg === "") {
		const meta = getWorkspaceViewByRoute(ctx.currentRoute);

		if (meta) {
			ctx.pushHistory(<SourceOutput meta={meta} />);
		} else {
			ctx.pushHistory(m.source_no_metadata());
		}

		return true;
	}

	// `source /about` — lookup by route
	// `source about`  — lookup by label/folder
	let meta = arg.startsWith("/")
		? (getWorkspaceViewByRoute(`/terminal${arg === "/" ? "" : arg}`) ??
			getWorkspaceViewByRoute(arg))
		: (getWorkspaceViewByLabel(arg) ?? getWorkspaceViewByFolder(arg));

	if (!meta) {
		// Try as direct route
		meta = getWorkspaceViewByRoute(`/terminal/${arg}`);
	}

	if (meta) {
		ctx.pushHistory(<SourceOutput meta={meta} />);
	} else {
		ctx.pushHistory(m.source_not_found({ target: arg }));
	}

	return true;
};
