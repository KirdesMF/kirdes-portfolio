import { m } from "#/paraglide/messages";
import type { CommandHandler } from "./command.types";

/**
 * open <file> — open a file in the editor.
 * open editor — navigate to /editor.
 * nvim . — navigate to /editor.
 */
export const handleOpen: CommandHandler = (ctx) => {
	if (ctx.normalized === "open editor" || ctx.normalized === "nvim .") {
		ctx.navigate("/editor");
		ctx.pushHistory(m.open_editor());
		return true;
	}

	if (!ctx.normalized.startsWith("open ")) return false;

	const target = ctx.normalized.slice(5).trim();
	const file = ctx.resolveFile(target, ctx.currentRoute);

	if (file) {
		ctx.navigate("/editor", { file: file.id });
		ctx.pushHistory(m.open_file({ target }));
		return true;
	}

	ctx.pushHistory(m.open_not_found({ target }));
	return true;
};
