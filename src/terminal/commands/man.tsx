import { ManOutput } from "../terminal-command-outputs";
import type { CommandHandler } from "./command.types";

/**
 * man <command> — show manual page for a command.
 * man (bare) — show man page for man itself.
 */
export const handleMan: CommandHandler = (ctx) => {
	if (ctx.normalized.startsWith("man ")) {
		const target = ctx.normalized.slice(4).trim();
		ctx.pushHistory(<ManOutput command={target} />);
		return true;
	}

	if (ctx.normalized === "man") {
		ctx.pushHistory(<ManOutput command="man" />);
		return true;
	}

	return false;
};
