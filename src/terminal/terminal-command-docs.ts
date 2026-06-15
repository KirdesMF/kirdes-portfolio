import { contactInfo } from "#/contact/contact-info";

export const routeDescriptions: Record<string, string> = {
	"/start": "home — portfolio root",
	"/about": "about — background, values, and philosophy",
	"/projects": "projects — selected project notes",
	"/contact": "contact — get in touch with me",
};

export const manPages: Record<string, string> = {
	cat: "cat <file> — print file contents to the terminal.\n  Resolves relative to current folder, falls back to root.\n  Examples:\n    cat README.md\n    cat /projects/index.md",
	cd: "cd [directory] — navigate to a route/directory.\n  Without arguments, goes home (~).\n  cd .. also goes home (single-level navigation).\n  Examples:\n    cd about\n    cd /contact\n    cd ..",
	clear: "clear — clear the terminal screen.",
	config: "config — open appearance settings. Alias for settings.",
	exit: "exit [file] — close a file or the editor.\n  Without arguments, closes the active file or editor.\n  Examples:\n    exit README.md\n    exit editor\n    exit all",
	email: `email — copy ${contactInfo.email} to clipboard.`,
	git: "git [command] — fake git operations.\n  Not a real git repo — the branch is for aesthetic purposes.\n  Subcommands: status, branch, log, commit",
	github: `github — open ${contactInfo.github.url} in a new window.`,
	lang: "lang [--en|--fr] — get or set the display language.",
	linkedin: `linkedin — open ${contactInfo.linkedin.url} in a new window.`,
	social: "social — list all social media links.",
	x: `x — open ${contactInfo.x.url} in a new window.`,
	help: "help — open available routes and commands.",
	history: "history — show command history.",
	ls: "ls — list directories and files.\n  Context-aware: shows current folder's files + root files.\n  At root (~), shows all route folders + root files.",
	nvim: "nvim . — open the editor.",
	reload: "reload — reload the portfolio (go to splash screen).",
	settings: "settings — open appearance settings.",
	tree: "tree — display folder structure as a tree.\n  Aliases and flags:\n    tree --all — show full tree including src/ page renderers.",
	whoami: "whoami — display current user info.",
};

export function getCommandSummary(command: string): string | undefined {
	return manPages[command]?.split(" — ")[1]?.split("\n")[0];
}
