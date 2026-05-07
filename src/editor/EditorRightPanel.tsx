import { Link, useLocation, useParams, useSearch } from "@tanstack/react-router";
import {
	ChevronRight,
	FileCode2,
	FileJson,
	FileText,
	Folder,
	FolderOpen,
	FolderTree,
	GitCompareArrows,
} from "lucide-react";
import { useState } from "react";

import { cn } from "#/design-system/cn";
import { type EditorFakeFileNode, editorFakeFileTree } from "#/editor/editor-files";
import { getEditorProjectInWorkspace, isEditorWorkspaceValue } from "#/editor/editor-projects";

const editorRightPanelTabs = [
	{
		id: "context",
		label: "Context",
		icon: FileText,
		description: "Project brief, branch state, and handoff notes.",
	},
	{
		id: "files",
		label: "Files",
		icon: FolderTree,
		description: "Touched files and nearby source map.",
	},
	{
		id: "changes",
		label: "Changes",
		icon: GitCompareArrows,
		description: "Diff summary and change totals.",
	},
] as const;

type EditorRightPanelTab = (typeof editorRightPanelTabs)[number]["id"];

function getEditorFileIconClassName(fileName: string): string {
	if (fileName.endsWith(".md")) return "text-chart-4";
	if (fileName.endsWith(".json")) return "text-chart-3";
	return "text-primary";
}

function EditorFakeFileTree({
	nodes,
	pathname,
	projectId,
	search,
	workspaceId,
}: {
	nodes: readonly EditorFakeFileNode[];
	pathname: string;
	projectId: string;
	search: ReturnType<typeof useSearch>;
	workspaceId: string;
}): React.ReactNode {
	const [openDirectoryPaths, setOpenDirectoryPaths] = useState<ReadonlySet<string>>(
		() => new Set(["src", "src/welcome"]),
	);

	function toggleDirectory(directoryPath: string): void {
		setOpenDirectoryPaths((previousPaths) => {
			const nextPaths = new Set(previousPaths);

			if (nextPaths.has(directoryPath)) {
				nextPaths.delete(directoryPath);
			} else {
				nextPaths.add(directoryPath);
			}

			return nextPaths;
		});
	}

	return (
		<EditorFakeFileTreeList
			nodes={nodes}
			openDirectoryPaths={openDirectoryPaths}
			parentPath=""
			pathname={pathname}
			projectId={projectId}
			search={search}
			toggleDirectory={toggleDirectory}
			workspaceId={workspaceId}
		/>
	);
}

function EditorFakeFileTreeList({
	nodes,
	openDirectoryPaths,
	parentPath,
	pathname,
	projectId,
	search,
	toggleDirectory,
	workspaceId,
}: {
	nodes: readonly EditorFakeFileNode[];
	openDirectoryPaths: ReadonlySet<string>;
	parentPath: string;
	pathname: string;
	projectId: string;
	search: ReturnType<typeof useSearch>;
	toggleDirectory: (directoryPath: string) => void;
	workspaceId: string;
}): React.ReactNode {
	return (
		<ul className="flex flex-col gap-0.5">
			{nodes.map((node) => {
				const nodePath = parentPath ? `${parentPath}/${node.name}` : node.name;

				return (
					<EditorFakeFileTreeNode
						key={nodePath}
						node={node}
						nodePath={nodePath}
						openDirectoryPaths={openDirectoryPaths}
						pathname={pathname}
						projectId={projectId}
						search={search}
						toggleDirectory={toggleDirectory}
						workspaceId={workspaceId}
					/>
				);
			})}
		</ul>
	);
}

function EditorFakeFileTreeNode({
	node,
	nodePath,
	openDirectoryPaths,
	pathname,
	projectId,
	search,
	toggleDirectory,
	workspaceId,
}: {
	node: EditorFakeFileNode;
	nodePath: string;
	openDirectoryPaths: ReadonlySet<string>;
	pathname: string;
	projectId: string;
	search: ReturnType<typeof useSearch>;
	toggleDirectory: (directoryPath: string) => void;
	workspaceId: string;
}): React.ReactNode {
	const isDirectory = node.type === "directory";
	const isDirectoryOpen = isDirectory && openDirectoryPaths.has(nodePath);
	const isCurrentRouteFile = node.fileId ? pathname.endsWith(`/files/${node.fileId}`) : false;
	const Icon =
		node.type === "directory"
			? isDirectoryOpen
				? FolderOpen
				: Folder
			: node.name.endsWith(".json")
				? FileJson
				: node.name.endsWith(".ts") || node.name.endsWith(".tsx")
					? FileCode2
					: FileText;

	const treeItemClassName = cn(
		"flex min-w-0 items-center gap-1.5 rounded-sm px-1.5 py-1 text-muted-foreground transition-colors",
		(node.fileId || isDirectory) &&
			"hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:outline-ring",
		isCurrentRouteFile && "bg-sidebar-accent text-sidebar-foreground",
	);
	const content = (
		<>
			{isDirectory ? (
				<ChevronRight
					className={cn(
						"size-3 shrink-0 text-muted-foreground transition-transform",
						isDirectoryOpen && "rotate-90",
					)}
				/>
			) : (
				<span className="w-3 shrink-0" />
			)}
			<Icon
				className={cn(
					"size-3.5 shrink-0",
					node.type === "directory" ? "text-chart-2" : getEditorFileIconClassName(node.name),
				)}
			/>
			<span className="min-w-0 flex-1 truncate">{node.name}</span>
			{isCurrentRouteFile ? (
				<span className="shrink-0 rounded-sm bg-primary/10 px-1 text-primary text-xs">
					current route
				</span>
			) : null}
		</>
	);

	return (
		<li>
			{node.fileId ? (
				<Link
					className={treeItemClassName}
					params={{ fileId: node.fileId, projectId, workspaceId }}
					search={search}
					to="/editor/$workspaceId/$projectId/files/$fileId"
				>
					{content}
				</Link>
			) : (
				<button
					aria-expanded={isDirectoryOpen}
					className={treeItemClassName}
					onClick={() => toggleDirectory(nodePath)}
					type="button"
				>
					{content}
				</button>
			)}
			{node.children && isDirectoryOpen ? (
				<div className="ms-4 border-border border-s ps-2">
					<EditorFakeFileTreeList
						nodes={node.children}
						openDirectoryPaths={openDirectoryPaths}
						parentPath={nodePath}
						pathname={pathname}
						projectId={projectId}
						search={search}
						toggleDirectory={toggleDirectory}
						workspaceId={workspaceId}
					/>
				</div>
			) : null}
		</li>
	);
}

function getEditorRightPanelTab(pathname: string): EditorRightPanelTab {
	const lastSegment = pathname.split("/").filter(Boolean).at(-1);

	if (pathname.includes("/files")) return "files";
	if (lastSegment === "changes") return "changes";
	return "context";
}

export function EditorRightPanel(): React.ReactNode {
	const search = useSearch({ from: "/editor" });
	const { pathname } = useLocation();
	const { projectId, workspaceId } = useParams({ strict: false });
	const activeTab = getEditorRightPanelTab(pathname);
	const project = isEditorWorkspaceValue(workspaceId)
		? getEditorProjectInWorkspace(workspaceId, projectId)
		: undefined;

	if (!project || !isEditorWorkspaceValue(workspaceId)) {
		return (
			<div className="w-80 p-3 text-muted-foreground text-xs">Select project to see context.</div>
		);
	}

	const activeTabMeta =
		editorRightPanelTabs.find(({ id }) => id === activeTab) ?? editorRightPanelTabs[0];

	return (
		<div className="grid h-full w-80 grid-rows-editor-panel text-xs">
			<nav aria-label="Right panel tabs" className="flex border-b border-border p-1">
				{editorRightPanelTabs.map(({ icon: Icon, id, label }) => {
					const isActive = activeTab === id;

					return (
						<Link
							aria-current={isActive ? "page" : undefined}
							key={id}
							className={cn(
								"inline-flex h-7 flex-1 items-center justify-center gap-1.5 rounded-sm px-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:outline-ring",
								isActive && "bg-sidebar-accent text-sidebar-foreground",
							)}
							params={{ projectId: project.id, workspaceId }}
							search={search}
							to={`/editor/$workspaceId/$projectId/${id}`}
						>
							<Icon className="size-3.5" />
							<span>{label}</span>
						</Link>
					);
				})}
			</nav>
			<section className="min-h-0 overflow-auto p-3">
				<div className="flex flex-col gap-3">
					<div>
						<p className="font-medium text-sidebar-foreground">{project.label}</p>
						<p className="mt-1 text-muted-foreground">{activeTabMeta.description}</p>
					</div>
					{activeTab === "context" ? (
						<div className="flex flex-col gap-2 rounded-md border border-border bg-background/50 p-3 text-muted-foreground">
							<p className="text-sidebar-foreground">Branch context</p>
							<p>{project.branch}</p>
							<p>
								Route: /editor/{workspaceId}/{project.id}/context
							</p>
						</div>
					) : null}
					{activeTab === "files" ? (
						<div className="flex flex-col gap-2 rounded-md border border-border bg-background/50 p-3">
							<div>
								<p className="font-medium text-sidebar-foreground">Files</p>
								<p className="mt-1 text-muted-foreground">
									Route: /editor/{workspaceId}/{project.id}/files
								</p>
							</div>
							<EditorFakeFileTree
								nodes={editorFakeFileTree}
								pathname={pathname}
								projectId={project.id}
								search={search}
								workspaceId={workspaceId}
							/>
						</div>
					) : null}
					{activeTab === "changes" ? (
						<div className="flex flex-col gap-2 rounded-md border border-border bg-background/50 p-3">
							<p className="font-medium text-sidebar-foreground">Changes</p>
							<div className="flex gap-2">
								<span className="text-selected-folder-indicator">+{project.additions}</span>
								<span className="text-destructive">-{project.deletions}</span>
							</div>
							<p className="text-muted-foreground">
								Route: /editor/{workspaceId}/{project.id}/changes
							</p>
						</div>
					) : null}
				</div>
			</section>
		</div>
	);
}
