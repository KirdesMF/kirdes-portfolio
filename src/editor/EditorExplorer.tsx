import { Link, useSearch } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { cn } from "#/design-system/cn";
import { Separator } from "#/design-system/Separator";
import {
	type EditorProjectSearchValue,
	type EditorWorkspaceSearchValue,
	selectEditorProjectSearch,
	selectEditorWorkspaceSearch,
} from "#/editor/editor-search";

const workspaces = [
	{
		id: "1",
		projects: [
			{ id: "about", label: "about" },
			{ id: "projects", label: "projects" },
			{ id: "skills", label: "skills" },
			{ id: "contact", label: "contact" },
			{ id: "help-command", label: "help command" },
		],
	},
	{
		id: "2",
		projects: [{ id: "game", label: "game" }],
	},
] as const satisfies ReadonlyArray<{
	id: EditorWorkspaceSearchValue;
	projects: ReadonlyArray<{
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
									{projects.map(({ id: projectId, label }, index) => {
										const isSelected = search.project === projectId;

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
													<ChevronRight className="size-3.5 shrink-0" />
												</Link>
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
				{workspaces.map(({ id }) => {
					const isSelected = workspace.id === id;

					return (
						<Link
							aria-label={`Switch to workspace ${id}`}
							aria-current={isSelected ? "page" : undefined}
							className="group inline-flex size-5 items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
							from="/editor"
							key={id}
							search={(previousSearch) => selectEditorWorkspaceSearch(previousSearch, id)}
						>
							<span
								className={cn(
									"size-1.5 rounded-full bg-muted-foreground/35 transition-colors group-hover:bg-muted-foreground",
									isSelected && "bg-primary",
								)}
							/>
						</Link>
					);
				})}
			</footer>
		</div>
	);
}
