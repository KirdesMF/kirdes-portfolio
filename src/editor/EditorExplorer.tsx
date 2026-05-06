import { Link, useSearch } from "@tanstack/react-router";
import { ChevronRight, GitBranch } from "lucide-react";

import { cn } from "#/design-system/cn";
import { Separator } from "#/design-system/Separator";
import { Tooltip } from "#/design-system/Tooltip";
import {
	type EditorProjectSearchValue,
	type EditorWorkspaceSearchValue,
	selectEditorProjectSearch,
	selectEditorWorkspaceSearch,
} from "#/editor/editor-search";

const workspaces = [
	{
		id: "1",
		label: "Workspace 1",
		projects: [
			{ id: "about", label: "about", branch: "feature/about", additions: 42, deletions: 8 },
			{
				id: "projects",
				label: "projects",
				branch: "feature/projects",
				additions: 128,
				deletions: 31,
			},
			{ id: "skills", label: "skills", branch: "feature/skills", additions: 64, deletions: 12 },
			{ id: "contact", label: "contact", branch: "feature/contact", additions: 24, deletions: 4 },
			{
				id: "help-command",
				label: "help command",
				branch: "feature/help-command",
				additions: 36,
				deletions: 9,
			},
		],
	},
	{
		id: "2",
		label: "Workspace 2",
		projects: [
			{ id: "game", label: "game", branch: "feature/game", additions: 217, deletions: 53 },
		],
	},
] as const satisfies ReadonlyArray<{
	id: EditorWorkspaceSearchValue;
	label: string;
	projects: ReadonlyArray<{
		additions: number;
		branch: string;
		deletions: number;
		id: EditorProjectSearchValue;
		label: string;
	}>;
}>;

export function EditorExplorer(): React.ReactNode {
	const search = useSearch({ from: "/editor" });
	const workspace = workspaces.find(({ id }) => id === search.workspace) ?? workspaces[0];

	return (
		<div className="grid h-full min-w-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden text-xs">
			<div className="min-h-0 overflow-hidden">
				<div
					className={cn(
						"flex h-full w-[200%] transition-transform duration-200 ease-editor-shell motion-reduce:transition-none",
						workspace.id === "2" && "-translate-x-1/2",
					)}
				>
					{workspaces.map(({ id, projects }) => (
						<section className="grid h-full min-w-0 flex-1 grid-rows-[auto_minmax(0,1fr)]" key={id}>
							<header className="flex h-7 items-center border-b border-border px-2 font-medium text-muted-foreground uppercase tracking-wide">
								WORKSPACE {id}
							</header>
							<nav
								aria-label={`Workspace ${id} projects`}
								className="min-h-0 overflow-hidden p-1.5"
							>
								<ul>
									{projects.map(({ additions, branch, deletions, id: projectId, label }, index) => {
										const isSelected = search.project === projectId;
										const isOpen = search.openProject === projectId;

										return (
											<li key={projectId}>
												{index > 0 ? <Separator className="my-1" /> : null}
												<Link
													aria-current={isSelected ? "page" : undefined}
													className={cn(
														"relative flex h-9 w-full items-center gap-2 rounded-sm px-2 text-left text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:outline-ring",
														isSelected && "text-sidebar-foreground",
													)}
													from="/editor"
													search={(previousSearch) =>
														selectEditorProjectSearch(previousSearch, projectId)
													}
												>
													<span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 p-1 font-medium text-[0.65rem] text-primary uppercase transition-colors">
														{label[0]}
													</span>
													<span className="min-w-0 flex-1 truncate">{label}</span>
													{isSelected ? (
														<span className="size-1.5 animate-selected-folder-dot-pulse rounded-full bg-selected-folder-indicator motion-reduce:animate-none" />
													) : null}
													<ChevronRight
														className={cn(
															"size-3.5 shrink-0 transition-transform duration-200 ease-editor-shell motion-reduce:transition-none",
															isOpen && "rotate-90",
														)}
													/>
												</Link>
												<div
													className={cn(
														"ml-8 grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-editor-shell motion-reduce:transition-none",
														isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
													)}
												>
													<div className="min-h-0 overflow-hidden">
														<div className="flex min-w-0 items-center gap-1.5 px-2 py-2 text-muted-foreground">
															<GitBranch className="size-3.5 shrink-0" />
															<span className="min-w-0 flex-1 truncate">{branch}</span>
															<span className="shrink-0 text-selected-folder-indicator">
																+{additions}
															</span>
															<span className="shrink-0 text-destructive">-{deletions}</span>
														</div>
													</div>
												</div>
											</li>
										);
									})}
								</ul>
							</nav>
						</section>
					))}
				</div>
			</div>
			<footer className="flex h-8 items-center justify-center gap-1 border-t border-border px-2">
				{workspaces.map(({ id, label }) => {
					const isSelected = workspace.id === id;

					return (
						<Tooltip content={label} key={id}>
							<Link
								aria-label={`Switch to ${label}`}
								aria-current={isSelected ? "page" : undefined}
								className="group inline-flex size-5 items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
								from="/editor"
								search={(previousSearch) => selectEditorWorkspaceSearch(previousSearch, id)}
							>
								<span
									className={cn(
										"size-1.5 rounded-full bg-muted-foreground/35 transition-colors group-hover:bg-muted-foreground",
										isSelected && "bg-primary",
									)}
								/>
							</Link>
						</Tooltip>
					);
				})}
			</footer>
		</div>
	);
}
