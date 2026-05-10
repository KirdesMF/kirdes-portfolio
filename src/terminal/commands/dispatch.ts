import { builtinHandlers } from "./builtins";
import { handleCat } from "./cat";
import { handleCd } from "./cd";
import { handleClose } from "./close";
import { handleGit } from "./git";
import { handleMan } from "./man";
import { handleOpen } from "./open";
import { handleRm } from "./rm";
import { handleRoute } from "./route";
import type { CommandContext, CommandHandler } from "./types";

/**
 * Middleware chain — each handler checks if it can handle the command.
 * First match wins. Falls through to "command not found".
 */
const pipeline: ReadonlyArray<CommandHandler> = [
	handleRoute,
	handleCd,
	handleCat,
	handleOpen,
	handleClose,
	handleGit,
	handleMan,
	handleRm,
	...builtinHandlers,
];

export function dispatch(ctx: CommandContext): void {
	for (const handler of pipeline) {
		if (handler(ctx)) return;
	}

	ctx.pushHistory(`command not found: ${ctx.raw}`);
}
