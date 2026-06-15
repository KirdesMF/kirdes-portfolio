import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { editorFiles, folderRoutes as folderRoutesData } from "#/editor/editor-files";
import type { EditorFileEntry, FolderRoute } from "#/editor/editor-files.types";
import { manPages } from "./terminal-command-docs";
import { TerminalRouteList } from "./terminal-route-list";

export function BunDevOutput(): ReactNode {
	return (
		<div className="flex flex-col gap-1.5 whitespace-pre-wrap font-mono text-muted-foreground mt-4">
			<p>Default inspector port 9229 not available, using 9230 instead</p>
			<p className="pt-2 text-foreground/80">Using secrets defined in .env</p>
			<p>
				<span className="text-primary">✓ [paraglide-js]</span>{" "}
				<span className="text-foreground/80">Compilation complete (message-modules)</span>
			</p>
			<p>
				<span className="font-semibold text-primary">✓ VITE v8.0.12</span>
				<span className="mx-3 text-muted-foreground">ready in</span>
				<span className="font-semibold text-foreground/80">60 ms</span>
			</p>
			<p className="pt-2 ps-8">
				<span className="text-primary">➜</span>
				<span className="mx-3 text-muted-foreground">Local:</span>
				<a
					className="text-primary underline-offset-2 hover:underline"
					href="http://localhost:3000/"
					rel="noopener noreferrer"
					target="_blank"
				>
					http://localhost:3000/
				</a>
			</p>
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
			<p className="text-foreground/80">{page}</p>
		</div>
	);
}

// ─── Fake git outputs ─────────────────────────────────────────────────

function gitStatus(): ReactNode {
	return (
		<div className="flex flex-col whitespace-pre-wrap font-mono">
			<p className="text-muted-foreground">On branch</p>
			<p className="text-foreground/80">feature/kirdes-app</p>
			<p className="text-muted-foreground">nothing to commit, working tree clean</p>
		</div>
	);
}

function gitBranch(): ReactNode {
	return (
		<div className="flex flex-col whitespace-pre-wrap font-mono">
			<p className="text-primary">* feature/kirdes-app</p>
			<p className="text-foreground/80"> main</p>
			<p className="text-foreground/80"> feat/ascii-title</p>
			<p className="text-foreground/80"> experiments/touch-type</p>
		</div>
	);
}

function gitLog(): ReactNode {
	return (
		<div className="flex flex-col whitespace-pre-wrap font-mono">
			<p className="text-foreground/80">commit a1b2c3d4 (HEAD {"->"} feature/kirdes-app)</p>
			<p className="text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
			<p className="pl-4 text-foreground/80"> refactor terminal for the third time</p>
			<p className="mt-1 text-foreground/80">commit e5f6g7h8</p>
			<p className="text-muted-foreground">Date: yesterday</p>
			<p className="pl-4 text-foreground/80"> add more commands nobody asked for</p>
			<p className="mt-1 text-foreground/80">commit 9a0b1c2d</p>
			<p className="text-muted-foreground">Date: last week</p>
			<p className="pl-4 text-foreground/80"> initial commit (it was better then)</p>
		</div>
	);
}

function gitCommit(): ReactNode {
	return (
		<div className="flex flex-col whitespace-pre-wrap font-mono">
			<p className="text-muted-foreground">On branch</p>
			<p className="text-foreground/80">feature/kirdes-app</p>
			<p className="text-muted-foreground">nothing to commit, working tree clean (as always)</p>
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
			<div className="flex flex-col gap-0.5">
				<p className="text-muted-foreground">route:</p>
				<p className="pl-4 text-foreground/80">{meta.route}</p>
				<p className="text-muted-foreground">content:</p>
				{meta.contentFiles.map((f) => (
					<p className="pl-4 text-foreground/80" key={f}>
						{meta.folder}/{f}
					</p>
				))}
				<p className="text-muted-foreground">renderer:</p>
				<p className="pl-4 text-foreground/80">{meta.renderer}</p>
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
										to={file.route}
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
				<span className="text-muted-foreground/70">src/browser/</span>
				{editorFiles
					.filter((f) => f.folder.startsWith("src/browser/"))
					.map((file, i, arr) => {
						const branch = i === arr.length - 1 ? "└── " : "├── ";
						return (
							<div className="flex items-center gap-1" key={file.id}>
								<span className="text-muted-foreground/50">{`    ${branch}`}</span>
								<Link
									className="underline-offset-2 hover:text-primary hover:underline"
									to={file.route}
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
										to={file.route}
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
