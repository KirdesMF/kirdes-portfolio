import { m } from "#/paraglide/messages";
import type { CommandHandler } from "./command.types";

/**
 * exit — navigate home.
 * exit editor — same.
 * exit all — same.
 * exit <file> — navigate home.
 */
export const handleExit: CommandHandler = (ctx) => {
	if (ctx.normalized === "exit editor" || ctx.normalized === "exit all") {
		ctx.navigate("/start");
		return true;
	}

	if (ctx.normalized.startsWith("exit ")) {
		const target = ctx.normalized.slice(5).trim();
		const file = ctx.resolveFile(target, ctx.currentRoute);

		if (file === null) {
			ctx.pushHistory(m.exit_not_found({ target }));
			return true;
		}

		ctx.navigate("/start");
		return true;
	}

	// bare "exit"
	if (ctx.normalized === "exit") {
		ctx.navigate("/start");
		return true;
	}

	return false;
};
