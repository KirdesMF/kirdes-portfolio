import { builtinHandlers } from "./builtins";
import { handleCat } from "./cat";
import { handleCd } from "./cd";
import type { CommandContext, CommandHandler } from "./command.types";
import { handleExit } from "./exit";
import { handleGit } from "./git";
import { handleRoute } from "./route";

/**
 * Middleware chain — each handler checks if it can handle the command.
 * First match wins. Falls through to "command not found".
 */
const pipeline: ReadonlyArray<CommandHandler> = [
	handleRoute,
	handleCd,
	handleCat,
	handleExit,
	handleGit,
	...builtinHandlers,
];

export function dispatch(ctx: CommandContext): void {
	for (const handler of pipeline) {
		if (handler(ctx)) return;
	}

	ctx.pushHistory(`command not found: ${ctx.raw}`);
}
