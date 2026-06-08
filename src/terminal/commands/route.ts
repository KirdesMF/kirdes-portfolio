import { parseTerminalRoute } from "../terminal-routes";
import type { CommandHandler } from "./command.types";

/**
 * /route — navigate to a route.
 * Handles commands that start with "/" like /about, /work, /contact.
 */
export const handleRoute: CommandHandler = (ctx) => {
	const route = parseTerminalRoute(ctx.raw);
	if (!route) return false;

	ctx.pushHistory(`opening ${ctx.raw}`);
	ctx.navigate(route);
	return true;
};
