import { GitOutput } from "../terminal-command-outputs";
import type { CommandHandler } from "./command.types";

/**
 * git [subcommand] — fake git operations.
 * Handles: git status, git branch, git log, git commit, git (bare).
 */
export const handleGit: CommandHandler = (ctx) => {
	if (ctx.normalized.startsWith("git ")) {
		const subcommand = ctx.normalized.slice(4).trim();
		ctx.pushHistory(<GitOutput subcommand={subcommand} />);
		return true;
	}

	if (ctx.normalized === "git") {
		ctx.pushHistory(<GitOutput subcommand="" />);
		return true;
	}

	return false;
};
