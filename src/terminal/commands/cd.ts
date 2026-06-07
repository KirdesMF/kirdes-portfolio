import { parseTerminalRouteTarget } from "../terminal-routes";
import type { CommandHandler } from "./command.types";

/**
 * cd [directory] — navigate to a route/directory.
 * cd or cd .. goes home (~).
 */
export const handleCd: CommandHandler = (ctx) => {
	if (ctx.normalized !== "cd" && !ctx.normalized.startsWith("cd ")) return false;

	const target = ctx.normalized.slice(2).trim();

	// cd with no args or cd .. → go home
	if (!target || target === "..") {
		ctx.pushHistory("opening ~");
		ctx.navigate("/terminal/home", { panel: "route" });
		return true;
	}

	const targetRoute = parseTerminalRouteTarget(target);
	if (targetRoute) {
		ctx.pushHistory(`opening ${target}`);
		ctx.navigate(targetRoute, { panel: "route" });
		return true;
	}

	ctx.pushHistory(`directory not found: ${target}`);
	return true;
};
