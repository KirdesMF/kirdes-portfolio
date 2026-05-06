import { Link, useParams, useSearch } from "@tanstack/react-router";
import { ChevronRight, GitBranch } from "lucide-react";

import { cn } from "#/design-system/cn";
import { Separator } from "#/design-system/Separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "#/design-system/Tooltip";
import {
	editorWorkspaces,
	getEditorWorkspace,
	getEditorWorkspaceDefaultProject,
	isEditorProjectInWorkspace,
	isEditorWorkspaceValue,
} from "#/editor/editor-projects";
import {
	selectEditorProjectSearch,
	selectEditorWorkspaceSearch,
	toggleEditorProjectOpenSearch,
} from "#/editor/editor-search";

export function EditorExplorer(): React.ReactNode {
	const search = useSearch({ from: "/editor" });
	const { projectId: selectedProjectId, workspaceId: selectedWorkspaceId } = useParams({
		strict: false,
	});
	const workspace = getEditorWorkspace(
		isEditorWorkspaceValue(selectedWorkspaceId) ? selectedWorkspaceId : "1",
	);

	return (
		<div className="grid h-full min-w-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden text-xs">
			<div className="min-h-0 overflow-hidden">
				<div
					className={cn(
						"flex h-full w-[200%] transition-transform duration-200 ease-editor-shell motion-reduce:transition-none",
						workspace.id === "2" && "-translate-x-1/2",
					)}
				>
					{editorWorkspaces.map(({ id, projects }) => (
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
										const isSelected = workspace.id === id && selectedProjectId === projectId;
										const isOpen = search.open.includes(projectId);

										return (
											<li key={projectId}>
												{index > 0 ? <Separator className="my-1" /> : null}
												<Link
													aria-label={isOpen ? `Collapse ${label}` : `Expand ${label}`}
													aria-pressed={isOpen}
													className="relative flex h-9 w-full items-center gap-2 rounded-sm px-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:outline-ring"
													search={(previousSearch) =>
														toggleEditorProjectOpenSearch(previousSearch, projectId)
													}
													to="."
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
														<Link
															aria-current={isSelected ? "page" : undefined}
															className={cn(
																"flex min-w-0 items-center gap-1.5 rounded-sm border border-transparent px-2 py-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:outline-ring",
																isSelected &&
																	"border-selected-folder-indicator/60 text-sidebar-foreground",
															)}
															params={{ projectId, workspaceId: id }}
															search={(previousSearch) =>
																selectEditorProjectSearch(previousSearch, id, projectId)
															}
															to="/editor/$workspaceId/$projectId"
														>
															<GitBranch className="size-3.5 shrink-0" />
															<span className="min-w-0 flex-1 truncate">{branch}</span>
															<span className="shrink-0 text-selected-folder-indicator">
																+{additions}
															</span>
															<span className="shrink-0 text-destructive">-{deletions}</span>
														</Link>
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
				{editorWorkspaces.map(({ id, label }) => {
					const isSelected = workspace.id === id;
					const rememberedProjectId = search.selected[id];
					const targetProjectId =
						rememberedProjectId && isEditorProjectInWorkspace(rememberedProjectId, id)
							? rememberedProjectId
							: getEditorWorkspaceDefaultProject(id)?.id;

					if (!targetProjectId) return null;

					return (
						<Tooltip key={id}>
							<TooltipTrigger
								render={
									<Link
										aria-label={`Switch to ${label}`}
										aria-current={isSelected ? "page" : undefined}
										className="group inline-flex size-5 items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
										params={{ projectId: targetProjectId, workspaceId: id }}
										search={(previousSearch) =>
											selectEditorWorkspaceSearch(previousSearch, id, targetProjectId)
										}
										to="/editor/$workspaceId/$projectId"
									>
										<span
											className={cn(
												"size-1.5 rounded-full bg-muted-foreground/35 transition-colors group-hover:bg-muted-foreground",
												isSelected && "bg-primary",
											)}
										/>
									</Link>
								}
							/>
							<TooltipContent>{label}</TooltipContent>
						</Tooltip>
					);
				})}
			</footer>
		</div>
	);
}
