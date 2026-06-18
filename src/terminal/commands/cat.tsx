import { m } from "#/paraglide/messages";
import type { CommandHandler } from "./command.types";

/**
 * cat <file> — acknowledge virtual files until terminal content is rebuilt.
 */
export const handleCat: CommandHandler = (ctx) => {
	if (!ctx.normalized.startsWith("cat ")) return false;

	const target = ctx.normalized.slice(4).trim();
	const file = ctx.resolveFile(target, ctx.currentRoute);

	if (file) {
		ctx.pushHistory(
			<span className="text-muted-foreground">
				{file.name} renders as a page. Terminal file content is being rebuilt.
			</span>,
		);
		return true;
	}

	ctx.pushHistory(m.cat_not_found({ target }));
	return true;
};
