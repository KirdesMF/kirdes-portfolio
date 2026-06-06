import type { CommandHandler } from "./types";

/**
 * open <file> — open a file in the read-only editor.
 * open editor — open the editor panel.
 * nvim . — open the editor panel.
 */
export const handleOpen: CommandHandler = (ctx) => {
	if (ctx.normalized === "open editor" || ctx.normalized === "nvim .") {
		ctx.openEditor();
		ctx.pushHistory("opening editor");
		return true;
	}

	if (!ctx.normalized.startsWith("open ")) return false;

	const target = ctx.normalized.slice(5).trim();

	if (ctx.openFile(target)) {
		ctx.pushHistory(`opening ${target}`);
		return true;
	}

	ctx.pushHistory(`file not found: ${target}`);
	return true;
};
