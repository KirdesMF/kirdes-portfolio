import { copyToClipboard } from "#/design-system/clipboard";
import { Separator } from "#/design-system/Separator";
import { m } from "#/paraglide/messages";
import { getLocale, setLocale } from "#/paraglide/runtime";
import { formatTerminalCwd } from "#/terminal/terminal-path";
import { EmailOutput, WhoamiOutput } from "#/terminal/terminal-profile-outputs";
import { LsOutput, TreeAllOutput, TreeOutput } from "../terminal-command-outputs";
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
	ctx.navigate(ctx.currentRoute, { dialog: "help" });
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
	ctx.pushHistory(formatTerminalCwd(ctx.currentRoute));
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

function handleBunDev(ctx: CommandContext): boolean {
	if (ctx.normalized !== "bun dev") return false;
	ctx.pushHistory(m.bun_dev_running());
	return true;
}

function handleHistory(ctx: CommandContext): boolean {
	if (ctx.normalized !== "history") return false;
	const cmdHistory = ctx.commandHistory;

	if (cmdHistory.length === 0) {
		ctx.pushHistory(m.history_empty());
		return true;
	}

	const lines = cmdHistory.map((cmd, i) => `${String(i + 1).padStart(4)}  ${cmd}`).join("\n");
	ctx.pushHistory(<pre className="text-muted-foreground">{lines}</pre>);
	return true;
}

function handleTree(ctx: CommandContext): boolean {
	if (ctx.normalized === "tree --all") {
		ctx.pushHistory(<TreeAllOutput />);
		return true;
	}

	if (ctx.normalized !== "tree") return false;
	ctx.pushHistory(<TreeOutput />);
	return true;
}

function handleEmail(ctx: CommandContext): boolean {
	if (ctx.normalized !== "email") return false;
	ctx.pushHistory(<EmailOutput />);
	void copyToClipboard("cedric@kirdes.dev");
	return true;
}

function openLink(url: string): void {
	window.open(url, "_blank", "noopener,noreferrer");
	void copyToClipboard(url);
}

function handleGithub(ctx: CommandContext): boolean {
	if (ctx.normalized !== "github") return false;
	const url = "https://github.com/kirdesmf";
	openLink(url);
	ctx.pushHistory(
		<div className="flex items-center gap-1">
			<a
				className="text-primary underline-offset-2 hover:underline"
				href={url}
				rel="noopener noreferrer"
				target="_blank"
			>
				{url}
			</a>
			<span className="text-muted-foreground/50">↗</span>
		</div>,
	);
	return true;
}

function handleLinkedin(ctx: CommandContext): boolean {
	if (ctx.normalized !== "linkedin") return false;
	const url = "https://linkedin.com/in/kirdesmf";
	openLink(url);
	ctx.pushHistory(
		<div className="flex items-center gap-1">
			<a
				className="text-primary underline-offset-2 hover:underline"
				href={url}
				rel="noopener noreferrer"
				target="_blank"
			>
				{url}
			</a>
			<span className="text-muted-foreground/50">↗</span>
		</div>,
	);
	return true;
}

function handleX(ctx: CommandContext): boolean {
	if (ctx.normalized !== "x") return false;
	const url = "https://x.com/kirdesmf";
	openLink(url);
	ctx.pushHistory(
		<div className="flex items-center gap-1">
			<a
				className="text-primary underline-offset-2 hover:underline"
				href={url}
				rel="noopener noreferrer"
				target="_blank"
			>
				{url}
			</a>
			<span className="text-muted-foreground/50">↗</span>
		</div>,
	);
	return true;
}

function handleSocial(ctx: CommandContext): boolean {
	if (ctx.normalized !== "social") return false;
	ctx.pushHistory(
		<div className="flex flex-col">
			<p className="pt-3 font-thin text-muted-foreground/70 uppercase tracking-wider">
				[SOCIAL MEDIAS]
			</p>
			<Separator className="mt-1 mb-2 opacity-50" />
			<div className="grid grid-cols-[5rem_min-content_min-content] gap-x-2 items-center">
				<span className="text-muted-foreground/70">github</span>
				<a
					className="text-primary underline-offset-2 hover:underline"
					href="https://github.com/kirdesmf"
					rel="noopener noreferrer"
					target="_blank"
				>
					github.com/kirdesmf
				</a>
				<span className="text-muted-foreground/50 block">↗</span>

				<span className="text-muted-foreground/70">linkedin</span>
				<a
					className="text-primary underline-offset-2 hover:underline"
					href="https://linkedin.com/in/kirdesmf"
					rel="noopener noreferrer"
					target="_blank"
				>
					linkedin.com/in/kirdesmf
				</a>
				<span className="text-muted-foreground/50">↗</span>

				<span className="text-muted-foreground/70">x.com</span>
				<a
					className="text-primary underline-offset-2 hover:underline"
					href="https://x.com/kirdesmf"
					rel="noopener noreferrer"
					target="_blank"
				>
					x.com/kirdesmf
				</a>
				<span className="text-muted-foreground/50">↗</span>
			</div>
		</div>,
	);
	return true;
}

function handleLang(ctx: CommandContext): boolean {
	if (!ctx.normalized.startsWith("lang")) return false;

	const current = getLocale();
	const available = ["en", "fr"] as const;

	if (ctx.normalized === "lang") {
		ctx.pushHistory(
			<div className="flex flex-col gap-0.5 font-mono text-foreground/90">
				<p className="text-muted-foreground/70">{m.lang_available()}</p>
				{available.map((loc) => (
					<p key={loc}>
						{loc === current ? (
							<>
								<span className="text-primary">* {loc}</span>
								<span className="text-muted-foreground/50"> {m.lang_current()}</span>
							</>
						) : (
							<span className="text-muted-foreground/70"> {loc}</span>
						)}
					</p>
				))}
			</div>,
		);
		return true;
	}

	if (ctx.normalized === "lang --en" || ctx.normalized === "lang --fr") {
		const target = ctx.normalized === "lang --en" ? "en" : "fr";

		if (current === target) {
			ctx.pushHistory(<p className="text-muted-foreground">{m.lang_already_set({ target })}</p>);
			return true;
		}

		setLocale(target);
		ctx.pushHistory(<p className="text-muted-foreground">{m.lang_set({ target })}</p>);
		return true;
	}

	return false;
}

function handleSettings(ctx: CommandContext): boolean {
	if (ctx.normalized !== "settings" && ctx.normalized !== "config") return false;
	ctx.navigate(ctx.currentRoute, { dialog: "settings" });
	ctx.pushHistory(<p className="text-muted-foreground">{m.settings_opened()}</p>);
	return true;
}

function handleMode(ctx: CommandContext): boolean {
	if (!ctx.normalized.startsWith("mode")) return false;

	if (ctx.normalized === "mode dark") {
		ctx.setMode("dark");
		ctx.pushHistory(
			<span className="text-muted-foreground">{m.mode_switched({ mode: "dark" })}</span>,
		);
		return true;
	}

	if (ctx.normalized === "mode light") {
		ctx.setMode("light");
		ctx.pushHistory(
			<span className="text-muted-foreground">{m.mode_switched({ mode: "light" })}</span>,
		);
		return true;
	}

	if (ctx.normalized === "mode") {
		ctx.pushHistory(
			<div className="flex flex-col gap-0.5 font-mono text-foreground/90">
				<p className="text-muted-foreground/70">{m.mode_usage()}</p>
			</div>,
		);
		return true;
	}

	return false;
}

function handleReload(ctx: CommandContext): boolean {
	if (ctx.normalized !== "reload") return false;
	ctx.reload();
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
	handleBunDev,
	handleHistory,
	handleTree,
	handleEmail,
	handleGithub,
	handleLang,
	handleLinkedin,
	handleSocial,
	handleX,
	handleSettings,
	handleMode,
	handleReload,
];
