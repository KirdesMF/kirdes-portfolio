import { useNavigate, useRouterState } from "@tanstack/react-router";
import { FileText, Folder, FolderOpen, X } from "lucide-react";
import { useState } from "react";
import { cn } from "#/design-system/cn";
import { editorFiles } from "#/editor/editor-files";
import type { EditorFileEntry } from "#/editor/editor-files.types";

// ─── Static tree definition ──────────────────────────────────────────────────

function findFile(folder: string, name: string): EditorFileEntry | undefined {
	return editorFiles.find((f) => f.folder === folder && f.name === name);
}

type TreeNode =
	| { type: "folder"; label: string; children: TreeNode[] }
	| { type: "file"; entry: EditorFileEntry; displayName: string };

function buildTree(): TreeNode[] {
	const files: TreeNode[] = [
		{ type: "file" as const, displayName: "package.json", entry: findFile("~", "stack.json") },
		{ type: "file" as const, displayName: "config.ts", entry: findFile("~", "profile.ts") },
		{ type: "file" as const, displayName: "README.md", entry: findFile("~", "README.md") },
		{ type: "file" as const, displayName: "TODO.md", entry: findFile("~", "TODO.md") },
		{ type: "file" as const, displayName: "AGENTS.md", entry: findFile("~", "infos.txt") },
	].filter((f) => f.entry !== undefined) as Array<{
		type: "file";
		entry: EditorFileEntry;
		displayName: string;
	}>;

	const aboutChildren: TreeNode[] = [
		{ type: "file" as const, displayName: "README.md", entry: findFile("about", "README.md") },
		{ type: "file" as const, displayName: "skills.json", entry: findFile("about", "skills.json") },
		{ type: "file" as const, displayName: "values.md", entry: findFile("about", "values.md") },
	].filter((f) => f.entry !== undefined) as Array<{
		type: "file";
		entry: EditorFileEntry;
		displayName: string;
	}>;

	const projectChildren: TreeNode[] = [
		{ type: "file" as const, displayName: "README.md", entry: findFile("contact", "README.md") },
		{ type: "file" as const, displayName: "links.json", entry: findFile("contact", "links.json") },
		{ type: "file" as const, displayName: "contact.md", entry: findFile("contact", "contact.md") },
	].filter((f) => f.entry !== undefined) as Array<{
		type: "file";
		entry: EditorFileEntry;
		displayName: string;
	}>;

	const workChildren: TreeNode[] = [
		{ type: "file" as const, displayName: "README.md", entry: findFile("work", "README.md") },
		{
			type: "file" as const,
			displayName: "experience.json",
			entry: findFile("work", "experience.json"),
		},
		{ type: "file" as const, displayName: "freelance.md", entry: findFile("work", "freelance.md") },
	].filter((f) => f.entry !== undefined) as Array<{
		type: "file";
		entry: EditorFileEntry;
		displayName: string;
	}>;

	return [
		{
			type: "folder",
			label: "portfolio",
			children: [
				{
					type: "folder",
					label: "src",
					children: [
						{ type: "folder", label: "about", children: aboutChildren },
						{ type: "folder", label: "project", children: projectChildren },
						{ type: "folder", label: "work", children: workChildren },
					],
				},
				...files,
			],
		},
	];
}

const treeData = buildTree();

// ─── Component ───────────────────────────────────────────────────────────────

export function NeoTree() {
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [expanded, setExpanded] = useState<Set<string>>(() => new Set(["portfolio", "src"]));

	function toggleExpand(label: string) {
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(label)) next.delete(label);
			else next.add(label);
			return next;
		});
	}

	function closeNeoTree() {
		void navigate({
			to: pathname,
			search: { neotree: "closed" as const },
		});
	}

	return (
		<aside className="flex w-56 shrink-0 flex-col border-r border-border bg-background">
			<div className="flex h-status-bar shrink-0 items-center justify-between border-b border-border px-3 text-tiny text-muted-foreground">
				<span className="font-medium uppercase tracking-wider text-muted-foreground/70">
					EXPLORER
				</span>
				<button
					aria-label="Close explorer"
					className="cursor-pointer text-muted-foreground/70 hover:text-foreground"
					type="button"
					onClick={closeNeoTree}
				>
					<X className="size-3.5" />
				</button>
			</div>

			<div className="min-h-0 flex-1 overflow-y-auto p-2 font-mono text-xs scrollbar-gutter-both">
				{treeData.map((node) => (
					<TreeNodeItem
						expanded={expanded}
						key={node.type === "folder" ? node.label : node.entry.id}
						node={node}
						onToggle={toggleExpand}
					/>
				))}
			</div>
		</aside>
	);
}

// ─── Tree node renderer ──────────────────────────────────────────────────────

function TreeNodeItem({
	expanded,
	node,
	onToggle,
	depth = 0,
}: {
	expanded: Set<string>;
	node: TreeNode;
	onToggle: (label: string) => void;
	depth?: number;
}) {
	const navigate = useNavigate();
	const search = useRouterState({ select: (s) => s.location.search }) as { file?: string };

	if (node.type === "file") {
		const isActive = search.file === node.entry.id;

		return (
			<button
				className={cn(
					"flex w-full items-center gap-1.5 py-0.5 text-left text-muted-foreground transition hover:text-foreground",
					isActive && "text-primary",
				)}
				style={{ paddingLeft: `${depth * 16 + 8}px` }}
				type="button"
				onClick={() => {
					void navigate({
						to: "/editor",
						search: { file: node.entry.id, neotree: "open" as const },
					});
				}}
			>
				<FileText className="size-3 shrink-0" />
				<span className="truncate">{node.displayName}</span>
			</button>
		);
	}

	// Folder node
	const isOpen = expanded.has(node.label);

	return (
		<div>
			<button
				className={cn(
					"flex w-full items-center gap-1.5 py-0.5 text-left text-muted-foreground transition hover:text-foreground",
					isOpen && "text-foreground/80",
				)}
				style={{ paddingLeft: `${depth * 16 + 8}px` }}
				type="button"
				onClick={() => onToggle(node.label)}
			>
				{isOpen ? (
					<FolderOpen className="size-3 shrink-0" />
				) : (
					<Folder className="size-3 shrink-0" />
				)}
				<span className="truncate font-medium">{node.label}/</span>
			</button>

			{isOpen && (
				<div>
					{node.children.map((child) => (
						<TreeNodeItem
							depth={depth + 1}
							expanded={expanded}
							key={child.type === "folder" ? child.label : child.entry.id}
							node={child}
							onToggle={onToggle}
						/>
					))}
				</div>
			)}
		</div>
	);
}
