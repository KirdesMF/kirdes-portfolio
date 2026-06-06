import { m } from "#/paraglide/messages";
import { InfosOutput } from "#/terminal/terminal-profile-outputs";
import type { CommandHandler } from "./types";

/**
 * cat <file> — print file contents to terminal.
 */
export const handleCat: CommandHandler = (ctx) => {
	if (!ctx.normalized.startsWith("cat ")) return false;

	const target = ctx.normalized.slice(4).trim();
	const file = ctx.resolveFile(target, ctx.currentRoute);

	if (file) {
		if (file.name === "infos.txt") {
			ctx.pushHistory(<InfosOutput />);
		} else {
			ctx.pushHistory(
				<pre className="whitespace-pre-wrap font-mono text-foreground/90">{file.content}</pre>,
			);
		}
		return true;
	}

	ctx.pushHistory(m.cat_not_found({ target }));
	return true;
};
