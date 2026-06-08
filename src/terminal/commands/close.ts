import { m } from "#/paraglide/messages";
import type { CommandHandler } from "./command.types";

/**
 * close — navigate to editor (clear file).
 * close editor — same.
 * close all — same.
 * close <file> — navigate to editor.
 */
export const handleClose: CommandHandler = (ctx) => {
	if (ctx.normalized === "close editor" || ctx.normalized === "close all") {
		ctx.navigate("/editor");
		return true;
	}

	if (ctx.normalized.startsWith("close ")) {
		const target = ctx.normalized.slice(6).trim();
		const file = ctx.resolveFile(target, ctx.currentRoute);

		if (file === null) {
			ctx.pushHistory(m.close_not_found({ target }));
			return true;
		}

		ctx.navigate("/editor");
		return true;
	}

	// bare "close"
	if (ctx.normalized === "close") {
		ctx.navigate("/editor");
		return true;
	}

	return false;
};
