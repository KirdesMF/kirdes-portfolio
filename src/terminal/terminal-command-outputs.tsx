import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Separator } from "#/design-system/Separator";
import { editorFiles, folderRoutes as folderRoutesData } from "#/editor/editor-files";
import type { EditorFileEntry, FolderRoute } from "#/editor/editor-files.types";
import { TerminalRouteList } from "./TerminalRouteList";
import { getCommandSummary, manPages, routeDescriptions } from "./terminal-command-docs";
import { terminalCommands } from "./terminal-commands";
import { terminalRoutes } from "./terminal-routes";
import {
	openEditorFileSearch,
	setDialogSearch,
	showRoutePanelSearch,
} from "./terminal-search-transitions";

export function HelpOutput(): ReactNode {
	return (
		<div className="flex flex-col gap-3 whitespace-pre-wrap">
			<p className="text-primary">Usage: man &lt;command&gt; for details</p>

			<div className="flex flex-col gap-1">
				<p className="font-semibold text-primary/80">Routes</p>
				{terminalRoutes.map((route) => (
					<p key={route} className="text-muted-foreground">
						<span className="text-primary">{route}</span>
						<span className="text-muted-foreground/70">
							{" — "}
							{routeDescriptions[route]?.split(" — ")[1] ?? ""}
						</span>
					</p>
				))}
			</div>

			<div className="flex flex-col gap-1">
				<p className="font-semibold text-primary/80">Commands</p>
				{terminalCommands.map((cmd) => {
					const desc = getCommandSummary(cmd);
					return (
						<p key={cmd} className="text-muted-foreground">
							<span className="font-medium text-foreground">{cmd}</span>
							{desc && <span className="text-muted-foreground/70"> — {desc}</span>}
						</p>
					);
				})}
			</div>
		</div>
	);
}

export function WelcomeOutput(): ReactNode {
	return (
		<div className="flex flex-col whitespace-pre-wrap font-mono text-foreground/90">
			<p className="font-thin text-muted-foreground/70 uppercase tracking-wider">[WELCOME]</p>
			<Separator className="mt-1 mb-2 opacity-50" />
			<div className="flex flex-col gap-0.5">
				<p>Welcome to kirdes terminal.</p>
				<p className="text-muted-foreground">
					Type{" "}
					<Link
						className="text-primary underline-offset-2 hover:underline"
						search={(previous) => setDialogSearch(previous, "help")}
						to="."
					>
						help
					</Link>{" "}
					to list available commands.
				</p>
			</div>
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
		contentFiles: ReadonlyArray<string>;
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
							search={showRoutePanelSearch}
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
										search={(previous) => openEditorFileSearch(previous, file.id)}
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
				<span className="text-muted-foreground/70">src/portfolio/</span>
				{editorFiles
					.filter((f) => f.folder.startsWith("src/portfolio/"))
					.map((file, i, arr) => {
						const branch = i === arr.length - 1 ? "└── " : "├── ";
						return (
							<div className="flex items-center gap-1" key={file.id}>
								<span className="text-muted-foreground/50">{`    ${branch}`}</span>
								<Link
									className="underline-offset-2 hover:text-primary hover:underline"
									search={(previous) => openEditorFileSearch(previous, file.id)}
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
							search={showRoutePanelSearch}
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
										search={(previous) => openEditorFileSearch(previous, file.id)}
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
