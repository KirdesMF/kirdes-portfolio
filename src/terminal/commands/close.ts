import type { CommandHandler } from "./types";

/**
 * close <file> — close a specific file.
 * close editor — close the editor panel.
 * close all — close all open files.
 * close — close active file, or editor if none open.
 */
export const handleClose: CommandHandler = (ctx) => {
	if (ctx.normalized === "close editor") {
		ctx.closeEditor();
		return true;
	}

	if (ctx.normalized === "close all") {
		ctx.navigate(ctx.currentRoute, {
			activeFile: undefined,
			editor: "open",
			files: [],
			panel: "editor",
		});
		return true;
	}

	if (ctx.normalized.startsWith("close ")) {
		const target = ctx.normalized.slice(6).trim();
		const file = ctx.resolveFile(target, ctx.currentRoute);

		if (file === null) {
			ctx.pushHistory(`file not found: ${target}`);
			return true;
		}

		ctx.closeFile(file.id);
		return true;
	}

	// bare "close"
	if (ctx.normalized === "close") {
		if (ctx.activeFileName) {
			ctx.closeFile(ctx.activeFileName);
			return true;
		}

		ctx.closeEditor();
		return true;
	}

	return false;
};
