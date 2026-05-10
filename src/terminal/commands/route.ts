import type { CommandHandler } from "./types";
import { parseTerminalRoute } from "../terminal-routes";

/**
 * /route — navigate to a terminal route.
 * Handles commands that start with "/" like /about, /work, /contact.
 */
export const handleRoute: CommandHandler = (ctx) => {
	const route = parseTerminalRoute(ctx.raw);
	if (!route) return false;

	ctx.pushHistory(`opening ${ctx.raw}`);
	ctx.navigate(route, { panel: "route" });
	return true;
};
