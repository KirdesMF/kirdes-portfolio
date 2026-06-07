import { m } from "#/paraglide/messages";
import type { CommandHandler } from "./command.types";

/**
 * open <file> — open a file in the read-only editor.
 * open editor — open the editor panel.
 * nvim . — open the editor panel.
 */
export const handleOpen: CommandHandler = (ctx) => {
	if (ctx.normalized === "open editor" || ctx.normalized === "nvim .") {
		ctx.openEditor();
		ctx.pushHistory(m.open_editor());
		return true;
	}

	if (!ctx.normalized.startsWith("open ")) return false;

	const target = ctx.normalized.slice(5).trim();

	if (ctx.openFile(target)) {
		ctx.pushHistory(m.open_file({ target }));
		return true;
	}

	ctx.pushHistory(m.open_not_found({ target }));
	return true;
};
