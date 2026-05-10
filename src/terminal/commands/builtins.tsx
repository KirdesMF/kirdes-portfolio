import {
	EmailOutput,
	HelpOutput,
	LsOutput,
	TreeOutput,
	WhoamiOutput,
} from "../terminal-command-outputs";
import type { CommandContext, CommandHandler } from "./types";

/**
 * All simple commands that match by exact name and need no arg parsing.
 * Each returns true if it handled the command.
 */
function handleClear(ctx: CommandContext): boolean {
	if (ctx.normalized !== "clear") return false;
	ctx.clearHistory();
	return true;
}

function handleHelp(ctx: CommandContext): boolean {
	if (ctx.normalized !== "help") return false;
	ctx.pushHistory(<HelpOutput />);
	return true;
}

function handleLs(ctx: CommandContext): boolean {
	if (ctx.normalized !== "ls") return false;
	const { folders, files } = ctx.lsFiles(ctx.currentRoute);
	ctx.pushHistory(<LsOutput files={files} folders={folders} />);
	return true;
}

function handlePwd(ctx: CommandContext): boolean {
	if (ctx.normalized !== "pwd") return false;
	const cwd =
		ctx.currentRoute === "/terminal" ? "~" : `~/${ctx.currentRoute.replace("/terminal/", "")}`;
	ctx.pushHistory(cwd);
	return true;
}

function handleWhoami(ctx: CommandContext): boolean {
	if (ctx.normalized !== "whoami") return false;
	ctx.pushHistory(<WhoamiOutput />);
	return true;
}

function handleDate(ctx: CommandContext): boolean {
	if (ctx.normalized !== "date") return false;
	ctx.pushHistory(new Date().toLocaleString());
	return true;
}

function handleHistory(ctx: CommandContext): boolean {
	if (ctx.normalized !== "history") return false;
	const cmdHistory = ctx.commandHistory;

	if (cmdHistory.length === 0) {
		ctx.pushHistory("no commands in history");
		return true;
	}

	const lines = cmdHistory.map((cmd, i) => `${String(i + 1).padStart(4)}  ${cmd}`).join("\n");
	ctx.pushHistory(<pre className="text-muted-foreground">{lines}</pre>);
	return true;
}

function handleTree(ctx: CommandContext): boolean {
	if (ctx.normalized !== "tree") return false;
	ctx.pushHistory(<TreeOutput />);
	return true;
}

function handleEmail(ctx: CommandContext): boolean {
	if (ctx.normalized !== "email") return false;
	ctx.pushHistory(<EmailOutput />);
	navigator.clipboard.writeText("cedric@kirdes.dev");
	return true;
}

function handleGithub(ctx: CommandContext): boolean {
	if (ctx.normalized !== "github") return false;
	ctx.pushHistory("https://github.com/kirdesmf");
	navigator.clipboard.writeText("https://github.com/kirdesmf");
	return true;
}

function handleMusic(ctx: CommandContext): boolean {
	if (ctx.normalized !== "music") return false;
	ctx.pushHistory("opening music player");
	ctx.openDialog("music");
	return true;
}

function handleReload(ctx: CommandContext): boolean {
	if (ctx.normalized !== "reload") return false;
	ctx.navigate("/");
	return true;
}

// Ordered list — first match wins
export const builtinHandlers: ReadonlyArray<CommandHandler> = [
	handleClear,
	handleHelp,
	handleLs,
	handlePwd,
	handleWhoami,
	handleDate,
	handleHistory,
	handleTree,
	handleEmail,
	handleGithub,
	handleMusic,
	handleReload,
];
