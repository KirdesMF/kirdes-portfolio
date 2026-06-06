export const routeDescriptions: Record<string, string> = {
	"/home": "home — portfolio root",
	"/about": "about — background, values, and philosophy",
	"/work": "work — projects and professional experience",
	"/contact": "contact — get in touch with me",
};

export const manPages: Record<string, string> = {
	bun: "bun dev — start the dev server.\n  Already running on port 3000.",
	cat: "cat <file> — print file contents to the terminal.\n  Resolves relative to current folder, falls back to root.\n  Examples:\n    cat README.md\n    cat /work/experience.json",
	cd: "cd [directory] — navigate to a route/directory.\n  Without arguments, goes home (~).\n  cd .. also goes home (single-level navigation).\n  Examples:\n    cd about\n    cd /work\n    cd ..",
	clear: "clear — clear the terminal screen.",
	config: "config — open appearance settings. Alias for settings.",
	close:
		"close [file] — close a file or the editor.\n  Without arguments, closes the active file or editor.\n  Examples:\n    close README.md\n    close editor\n    close all",
	date: "date — display current date and time.",
	email: "email — copy cedric@kirdes.dev to clipboard.",
	git: "git [command] — fake git operations.\n  Not a real git repo — the branch is for aesthetic purposes.\n  Subcommands: status, branch, log, commit",
	github: "github — open github.com/kirdesmf in a new window.",
	lang: "lang [--en|--fr] — get or set the display language.",
	linkedin: "linkedin — open linkedin.com/in/kirdesmf in a new window.",
	social: "social — list all social media links.",
	x: "x — open x.com/kirdesmf in a new window.",
	help: "help — open available routes and commands.",
	history: "history — show command history.",
	ls: "ls — list directories and files.\n  Context-aware: shows current folder's files + root files.\n  At root (~), shows all route folders + root files.",
	man: "man <command> — show the manual page for a command.\n  Examples:\n    man ls\n    man cat\n    man cd",
	nvim: "nvim . — open the editor.",
	open: "open <file> — open a file in the read-only editor.\n  Resolves relative to current folder, falls back to root.\n  Aliases:\n    nvim . — open the editor\n  Examples:\n    open README.md\n    open /about/values.md",
	pwd: "pwd — print working directory (current folder).",
	reload: "reload — reload the portfolio (go to splash screen).",
	rm: "rm [file] — pretend to remove files.\n  This is not a real terminal — all files are read-only.\n  Nice try though.",
	settings: "settings — open appearance settings.",
	source:
		"source [path] — show route, content files, and renderer for a workspace view.\n  Without arguments, uses the current route.\n  Examples:\n    source about\n    source /work\n    source",
	tree: "tree — display folder structure as a tree.\n  Aliases and flags:\n    tree --all — show full tree including src/ page renderers.",
	whoami: "whoami — display current user info.",
};

export function getCommandSummary(command: string): string | undefined {
	return manPages[command]?.split(" — ")[1]?.split("\n")[0];
}
