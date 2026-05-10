import type { CommandHandler } from "./types";

/**
 * cat <file> — print file contents to terminal.
 */
export const handleCat: CommandHandler = (ctx) => {
	if (!ctx.normalized.startsWith("cat ")) return false;

	const target = ctx.normalized.slice(4).trim();
	const file = ctx.resolveFile(target, ctx.currentRoute);

	if (file) {
		ctx.pushHistory(file.content);
		return true;
	}

	ctx.pushHistory(`file not found: ${target}`);
	return true;
};
