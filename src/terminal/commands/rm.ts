import type { CommandHandler } from "./types";

/**
 * rm [file] — playful fake command. Does nothing.
 */
export const handleRm: CommandHandler = (ctx) => {
	if (ctx.normalized.startsWith("rm ")) {
		const target = ctx.normalized.slice(3).trim();

		if (target === "-rf /" || target === "-rf /*") {
			ctx.pushHistory("whoa there, this is not a real terminal");
			return true;
		}

		ctx.pushHistory("this is not a real terminal but nice try");
		return true;
	}

	if (ctx.normalized === "rm") {
		ctx.pushHistory("this is not a real terminal but nice try");
		return true;
	}

	return false;
};
