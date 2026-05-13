import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { EditorFileEntry, FolderRoute } from "../editor/editor-files";
import { editorFiles, folderRoutes as folderRoutesData } from "../editor/editor-files";
import { TerminalRouteList } from "./TerminalRouteList";
import { terminalRoutes } from "./terminal-routes";

export function HelpOutput(): ReactNode {
	return (
		<div>
			<p>available routes: {terminalRoutes.join(" ")}</p>
			<p>
				commands: cat cd clear close date email git github help history ls man music open pwd reload
				rm source tree whoami
			</p>
		</div>
	);
}

export function WelcomeOutput(): ReactNode {
	return (
		<div className="flex flex-col gap-0.5">
			<p>Welcome to kirdes terminal.</p>
			<p className="text-muted-foreground">Type help to list available commands.</p>
		</div>
	);
}

export function EmailOutput(): ReactNode {
	return (
		<div className="flex flex-col gap-0.5">
			<p>cedric@kirdes.dev</p>
			<p className="text-muted-foreground">copied to clipboard</p>
		</div>
	);
}

function copyToClipboard(text: string) {
	navigator.clipboard.writeText(text);
}

export function StatusOutput(): ReactNode {
	return (
		<div className="flex flex-col gap-0.5 whitespace-pre-wrap font-mono text-foreground/90">
			<div>
				<span className="text-muted-foreground/60">LOCATION </span>
				<span>Paris, France</span>
			</div>
			<div>
				<span className="text-muted-foreground/60">FOCUS </span>
				<span>frontend architecture — design systems — dev tooling</span>
			</div>
			<div>
				<span className="text-muted-foreground/60">CONTACT </span>
				<button
					className="underline-offset-2 hover:text-primary hover:underline"
					type="button"
					onClick={() => copyToClipboard("cedric@kirdes.dev")}
				>
					cedric@kirdes.dev
				</button>
				<span> / </span>
				<a
					href="https://github.com/kirdesmf"
					className="underline-offset-2 hover:text-primary hover:underline"
					target="_blank"
					rel="noreferrer"
				>
					github.com/kirdesmf
				</a>
			</div>
			<div>
				<span className="text-muted-foreground/60">STATUS </span>
				<span>open for freelance &amp; collaboration</span>
			</div>
		</div>
	);
}

export function WhoamiOutput(): ReactNode {
	return (
		<div className="flex flex-col gap-0.5">
			<p>kirdes</p>
			<p className="text-muted-foreground">product engineer / interface builder</p>
			<p className="mt-1 text-muted-foreground/70">for more, visit /about</p>
		</div>
	);
}

export function LsOutput({
	files,
	folders,
}: {
	files: ReadonlyArray<EditorFileEntry>;
	folders: ReadonlyArray<FolderRoute>;
}): ReactNode {
	return <TerminalRouteList files={files} folders={folders} />;
}

// ─── Manual pages ─────────────────────────────────────────────────────

const manPages: Record<string, string> = {
	cat: "cat <file> — print file contents to the terminal.\n  Resolves relative to current folder, falls back to root.\n  Examples:\n    cat README.md\n    cat /work/experience.json",
	cd: "cd [directory] — navigate to a route/directory.\n  Without arguments, goes home (~).\n  cd .. also goes home (single-level navigation).\n  Examples:\n    cd about\n    cd /work\n    cd ..",
	clear: "clear — clear the terminal screen.",
	close:
		"close [file] — close a file or the editor.\n  Without arguments, closes the active file or editor.\n  Examples:\n    close README.md\n    close editor\n    close all",
	date: "date — display current date and time.",
	email: "email — copy cedric@kirdes.dev to clipboard.",
	git: "git [command] — fake git operations.\n  Not a real git repo — the branch is for aesthetic purposes.\n  Subcommands: status, branch, log, commit",
	github: "github — open github.com/kirdesmf in your browser.",
	help: "help — list available routes and commands.",
	history: "history — show command history.",
	ls: "ls — list directories and files.\n  Context-aware: shows current folder's files + root files.\n  At root (~), shows all route folders + root files.",
	man: "man <command> — show the manual page for a command.\n  Examples:\n    man ls\n    man cat\n    man cd",
	music: "music — open the music player.",
	open: "open <file> — open a file in the read-only editor.\n  Resolves relative to current folder, falls back to root.\n  Examples:\n    open README.md\n    open /about/values.md",
	pwd: "pwd — print working directory (current folder).",
	reload: "reload — reload the portfolio (go to splash screen).",
	rm: "rm [file] — pretend to remove files.\n  This is not a real terminal — all files are read-only.\n  Nice try though.",
	source:
		"source [path] — show route, content files, and renderer for a section.\n  Without arguments, uses the current route.\n  Examples:\n    source about\n    source /work\n    source",
	tree: "tree — display folder structure as a tree.\n  Aliases and flags:\n    tree --all — show full tree including src/ page renderers.",
	whoami: "whoami — display current user info.",
};

export function ManOutput({ command }: { command: string }): ReactNode {
	const page = manPages[command];

	if (!page) {
		return <p>no manual entry for {command}</p>;
	}

	return (
		<div className="flex flex-col gap-1 whitespace-pre-wrap">
			<p className="text-primary">man {command}</p>
			<p className="text-muted-foreground">{page}</p>
		</div>
	);
}

// ─── Fake git outputs ─────────────────────────────────────────────────

function gitStatus(): ReactNode {
	return (
		<div className="flex flex-col whitespace-pre-wrap font-mono text-muted-foreground">
			<p>On branch feature/kirdes-app</p>
			<p>nothing to commit, working tree clean</p>
		</div>
	);
}

function gitBranch(): ReactNode {
	return (
		<div className="flex flex-col whitespace-pre-wrap font-mono text-muted-foreground">
			<p className="text-primary">* feature/kirdes-app</p>
			<p> main</p>
			<p> feat/ascii-title</p>
			<p> experiments/touch-type</p>
		</div>
	);
}

function gitLog(): ReactNode {
	return (
		<div className="flex flex-col whitespace-pre-wrap font-mono text-muted-foreground">
			<p>commit a1b2c3d4 (HEAD {"->"} feature/kirdes-app)</p>
			<p>Date: {new Date().toLocaleDateString()}</p>
			<p className="pl-4"> refactor terminal for the third time</p>
			<p className="mt-1">commit e5f6g7h8</p>
			<p>Date: yesterday</p>
			<p className="pl-4"> add more commands nobody asked for</p>
			<p className="mt-1">commit 9a0b1c2d</p>
			<p>Date: last week</p>
			<p className="pl-4"> initial commit (it was better then)</p>
		</div>
	);
}

function gitCommit(): ReactNode {
	return (
		<div className="flex flex-col whitespace-pre-wrap font-mono text-muted-foreground">
			<p>On branch feature/kirdes-app</p>
			<p>nothing to commit, working tree clean (as always)</p>
		</div>
	);
}

export function GitOutput({ subcommand }: { subcommand: string }): ReactNode {
	switch (subcommand) {
		case "status":
			return gitStatus();
		case "branch":
			return gitBranch();
		case "log":
			return gitLog();
		case "commit":
			return gitCommit();
		default:
			return (
				<div className="flex flex-col whitespace-pre-wrap font-mono text-muted-foreground">
					<p>usage: git {"<command>"}</p>
					<p className="mt-1">available: status, branch, log, commit</p>
					<p className="text-muted-foreground/50">
						(not a real git repo — the branch is for aesthetic purposes)
					</p>
				</div>
			);
	}
}

// ─── Source output ─────────────────────────────────────────────────

export function SourceOutput({
	meta,
}: {
	meta: {
		route: string;
		folder: string;
		label: string;
		renderer: string;
		contentFiles: Array<string>;
	};
}): ReactNode {
	return (
		<div className="flex flex-col gap-1 whitespace-pre-wrap">
			<p className="text-primary">source</p>
			<div className="flex flex-col gap-0.5 text-muted-foreground">
				<p>route:</p>
				<p className="pl-4">{meta.route}</p>
				<p>content:</p>
				{meta.contentFiles.map((f) => (
					<p className="pl-4" key={f}>
						{meta.folder}/{f}
					</p>
				))}
				<p>renderer:</p>
				<p className="pl-4">{meta.renderer}</p>
			</div>
		</div>
	);
}

// ─── Tree all view (includes src/) ────────────────────────────────────

export function TreeAllOutput(): ReactNode {
	return (
		<div className="flex flex-col whitespace-pre-wrap font-mono text-muted-foreground">
			{folderRoutesData.map(({ folder, label, route }) => {
				const folderFiles = editorFiles.filter((f) => f.folder === folder);

				return (
					<div key={folder}>
						<Link
							activeOptions={{ exact: true }}
							activeProps={{ className: "text-primary" }}
							className="underline-offset-2 hover:text-primary hover:underline"
							search={(previous) => ({
								activeFile: previous.activeFile,
								dialog: previous.dialog,
								editor: previous.editor,
								files: previous.files ?? [],
								panel: "route",
							})}
							to={route}
						>
							{label}/
						</Link>
						{folderFiles.map((file, i) => {
							const branch = i === folderFiles.length - 1 ? "└── " : "├── ";
							return (
								<div className="flex items-center gap-1" key={file.id}>
									<span className="text-muted-foreground/50">{`  ${branch}`}</span>
									<Link
										className="underline-offset-2 hover:text-primary hover:underline"
										search={(previous) => ({
											activeFile: file.id,
											dialog: previous.dialog,
											editor: "open",
											files: previous.files
												? [...new Set([...previous.files, file.id])]
												: [file.id],
											panel: "editor",
										})}
										to="."
									>
										{file.name}
									</Link>
								</div>
							);
						})}
					</div>
				);
			})}
			<div>
				<span className="text-muted-foreground/70">src/</span>
				{editorFiles
					.filter((f) => f.folder === "src/pages")
					.map((file, i, arr) => {
						const branch = i === arr.length - 1 ? "└── " : "├── ";
						return (
							<div className="flex items-center gap-1" key={file.id}>
								<span className="text-muted-foreground/50">{`    ${branch}`}</span>
								<Link
									className="underline-offset-2 hover:text-primary hover:underline"
									search={(previous) => ({
										activeFile: file.id,
										dialog: previous.dialog,
										editor: "open",
										files: previous.files ? [...new Set([...previous.files, file.id])] : [file.id],
										panel: "editor",
									})}
									to="."
								>
									{file.name}
								</Link>
							</div>
						);
					})}
			</div>
		</div>
	);
}

// ─── Tree view ────────────────────────────────────────────────────────

export function TreeOutput(): ReactNode {
	return (
		<div className="flex flex-col whitespace-pre-wrap font-mono text-muted-foreground">
			{folderRoutesData.map(({ folder, label, route }) => {
				const folderFiles = editorFiles.filter((f) => f.folder === folder);

				return (
					<div key={folder}>
						<Link
							activeOptions={{ exact: true }}
							activeProps={{ className: "text-primary" }}
							className="underline-offset-2 hover:text-primary hover:underline"
							search={(previous) => ({
								activeFile: previous.activeFile,
								dialog: previous.dialog,
								editor: previous.editor,
								files: previous.files ?? [],
								panel: "route",
							})}
							to={route}
						>
							{label}/
						</Link>
						{folderFiles.map((file, i) => {
							const branch = i === folderFiles.length - 1 ? "└── " : "├── ";
							return (
								<div className="flex items-center gap-1" key={file.id}>
									<span className="text-muted-foreground/50">{`  ${branch}`}</span>
									<Link
										className="underline-offset-2 hover:text-primary hover:underline"
										search={(previous) => ({
											activeFile: file.id,
											dialog: previous.dialog,
											editor: "open",
											files: previous.files
												? [...new Set([...previous.files, file.id])]
												: [file.id],
											panel: "editor",
										})}
										to="."
									>
										{file.name}
									</Link>
								</div>
							);
						})}
					</div>
				);
			})}
		</div>
	);
}
