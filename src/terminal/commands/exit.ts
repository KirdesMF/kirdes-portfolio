import { m } from "#/paraglide/messages";
import type { CommandHandler } from "./command.types";

/**
 * exit — navigate to editor (clear file).
 * exit editor — same.
 * exit all — same.
 * exit <file> — navigate to editor.
 */
export const handleExit: CommandHandler = (ctx) => {
	if (ctx.normalized === "exit editor" || ctx.normalized === "exit all") {
		ctx.navigate("/editor");
		return true;
	}

	if (ctx.normalized.startsWith("exit ")) {
		const target = ctx.normalized.slice(5).trim();
		const file = ctx.resolveFile(target, ctx.currentRoute);

		if (file === null) {
			ctx.pushHistory(m.exit_not_found({ target }));
			return true;
		}

		ctx.navigate("/editor");
		return true;
	}

	// bare "exit"
	if (ctx.normalized === "exit") {
		ctx.navigate("/editor");
		return true;
	}

	return false;
};
