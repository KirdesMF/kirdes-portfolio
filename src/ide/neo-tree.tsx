import { hotkeysCoreFeature, syncDataLoaderFeature } from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { FileText, Folder, FolderOpen, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { cn } from "#/design-system/cn";
import { Drawer, DrawerContent, DrawerPopup } from "#/design-system/drawer";
import { useIsMobile } from "#/design-system/use-media-query";
import { editorFiles } from "#/editor/editor-files";
import type { EditorFileEntry } from "#/editor/editor-files.types";
import { useIdeStore } from "#/ide/store";

// ─── Flat tree data for headless-tree ────────────────────────────────────────

type TreeItemData =
	| { kind: "folder"; label: string }
	| { kind: "file"; entry: EditorFileEntry; displayName: string };

/** Flat record: itemId → payload. */
const treeItems: Record<string, TreeItemData> = {};

/** Map from folder itemId → child itemIds. */
const folderChildren: Record<string, string[]> = {};

/** Root-level child itemIds (portfolio folder children). */
const rootChildIds: string[] = [];

// ── Helpers ──

function nextFolderId(): string {
	return `folder:${Object.keys(treeItems).length}`;
}

function findFile(folder: string, name: string): EditorFileEntry | undefined {
	return editorFiles.find((f) => f.folder === folder && f.name === name);
}

// ── Build flat structure from the same data as before ──

function buildFlatTree() {
	// Root folder: "portfolio"
	const rootId = nextFolderId();
	treeItems[rootId] = { kind: "folder", label: "portfolio" };

	const fileEntries: Array<{ displayName: string; entry: EditorFileEntry }> = [];
	for (const [displayName, name] of [
		["package.json", "package.json"],
		["config.ts", "profile.ts"],
		["README.md", "README.md"],
		["TODO.md", "TODO.md"],
		["AGENTS.md", "infos.txt"],
	] as const) {
		const entry = findFile("~", name);
		if (entry) fileEntries.push({ displayName, entry });
	}

	// ── about ──
	const aboutFileEntries: Array<{ displayName: string; entry: EditorFileEntry }> = [];
	for (const [displayName, name] of [
		["route.tsx", "route.tsx"],
		["skills.json", "skills.json"],
		["values.md", "values.md"],
	] as const) {
		const entry = findFile("about", name);
		if (entry) aboutFileEntries.push({ displayName, entry });
	}

	// ── projects ──
	const projectsFileEntries: Array<{ displayName: string; entry: EditorFileEntry }> = [];
	for (const name of ["index.md", "atlas-notes.md", "signal-forge.md", "orbit-ui.md"] as const) {
		const entry = findFile("work/projects", name);
		if (entry) projectsFileEntries.push({ displayName: name, entry });
	}

	// ── work ──
	const workFileEntries: Array<{ displayName: string; entry: EditorFileEntry }> = [];
	for (const [displayName, name] of [
		["route.tsx", "route.tsx"],
		["experience.json", "experience.json"],
		["freelance.md", "freelance.md"],
	] as const) {
		const entry = findFile("work", name);
		if (entry) workFileEntries.push({ displayName, entry });
	}

	// ── contact ──
	const contactFileEntries: Array<{ displayName: string; entry: EditorFileEntry }> = [];
	for (const [displayName, name] of [
		["route.tsx", "route.tsx"],
		["links.json", "links.json"],
		["contact.md", "contact.md"],
	] as const) {
		const entry = findFile("contact", name);
		if (entry) contactFileEntries.push({ displayName, entry });
	}

	// ── Build folders ──

	function addFolder(label: string, childIds: string[]): string {
		const id = nextFolderId();
		treeItems[id] = { kind: "folder", label };
		folderChildren[id] = childIds;
		return id;
	}

	function addFile(entry: EditorFileEntry, displayName: string): string {
		// Use entry.id as the item ID so the "auto-expand to file" logic works directly
		const id = entry.id;
		treeItems[id] = { kind: "file", entry, displayName };
		return id;
	}

	// Projects folder
	const projectsChildIds = projectsFileEntries.map((f) => addFile(f.entry, f.displayName));
	const projectsId = addFolder("projects", projectsChildIds);

	// About folder
	const aboutChildIds = aboutFileEntries.map((f) => addFile(f.entry, f.displayName));
	const aboutId = addFolder("about", aboutChildIds);

	// Work folder (includes projects subfolder)
	const workFileIds = workFileEntries.map((f) => addFile(f.entry, f.displayName));
	const workId = addFolder("work", [...workFileIds, projectsId]);

	// Contact folder
	const contactChildIds = contactFileEntries.map((f) => addFile(f.entry, f.displayName));
	const contactId = addFolder("contact", contactChildIds);

	// Src folder
	const srcId = addFolder("src", [aboutId, workId, contactId]);

	// Root-level files
	const fileIds = fileEntries.map((f) => addFile(f.entry, f.displayName));

	// Root (portfolio) folder children
	folderChildren[rootId] = [srcId, ...fileIds];
	rootChildIds.push(rootId);
}

// Build once at module level
buildFlatTree();

// ─── Public API: used by FindFileDialog and FindTextDialog ────────────────────

/**
 * Returns a flat Map from file entry.id → display path (e.g. "portfolio/src/about/route.tsx").
 */
export function getNeoTreeFilePaths(): ReadonlyMap<string, string> {
	const paths = new Map<string, string>();

	function walk(itemId: string, parents: string[]) {
		const item = treeItems[itemId];
		if (!item) return;

		if (item.kind === "folder") {
			const label = item.label;
			// Skip "portfolio" from the path (matching old behavior)
			const nextParents = label === "portfolio" ? parents : [...parents, label];
			const children = folderChildren[itemId] ?? [];
			for (const childId of children) {
				walk(childId, nextParents);
			}
		} else {
			paths.set(item.entry.id, [...parents, item.displayName].join("/"));
		}
	}

	for (const childId of rootChildIds) {
		walk(childId, []);
	}

	return paths;
}

/** Compute ancestor folder IDs for a given file entry.id, for auto-expand. */
function getAncestorFolderIds(fileId: string): string[] {
	function findAncestors(folderId: string, currentAncestors: string[]): string[] | null {
		const children = folderChildren[folderId];
		if (!children) return null;

		if (children.includes(fileId)) {
			return [...currentAncestors, folderId];
		}

		for (const childId of children) {
			if (treeItems[childId]?.kind === "folder") {
				const result = findAncestors(childId, [...currentAncestors, folderId]);
				if (result) return result;
			}
		}

		return null;
	}

	for (const rootId of rootChildIds) {
		const ancestors = findAncestors(rootId, [rootId]);
		if (ancestors) return ancestors;
	}

	return [];
}

// ─── Component ───────────────────────────────────────────────────────────────

export function NeoTree() {
	const navigate = useNavigate();
	const requestEditorFocus = useIdeStore((s) => s.requestEditorFocus);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const search = useRouterState({ select: (s) => s.location.search }) as {
		file?: string;
		neotree?: string;
	};

	const currentFileId = search.file;
	const isMobile = useIsMobile();

	// Compute which folder IDs to expand initially, based on the currently
	// selected file (so opening a file auto-expands its folder).
	const expandedItems: string[] = useMemo(() => {
		const rootId = rootChildIds[0];
		if (!rootId) return [];

		// Always expand the root folder and the "src" folder
		const expanded = [rootId];
		for (const childId of folderChildren[rootId] ?? []) {
			if (treeItems[childId]?.kind === "folder") {
				expanded.push(childId);
				// Also expand immediate children of src (about, work, contact)
				for (const grandChildId of folderChildren[childId] ?? []) {
					if (treeItems[grandChildId]?.kind === "folder") {
						expanded.push(grandChildId);
					}
				}
			}
		}

		// If a file is selected, expand its ancestor chain
		if (currentFileId) {
			const ancestors = getAncestorFolderIds(currentFileId);
			for (const ancestorId of ancestors) {
				if (!expanded.includes(ancestorId)) {
					expanded.push(ancestorId);
				}
			}
		}

		return expanded;
	}, [currentFileId]);

	const tree = useTree<TreeItemData>({
		rootItemId: rootChildIds[0] ?? "",
		initialState: { expandedItems },
		getItemName: (item) => {
			const data = item.getItemData();
			return data.kind === "folder" ? data.label : data.displayName;
		},
		isItemFolder: (item) => item.getItemData().kind === "folder",
		dataLoader: {
			getItem: (itemId) => {
				const item = treeItems[itemId];
				if (!item) throw new Error(`Missing tree item: ${itemId}`);
				return item;
			},
			getChildren: (itemId) => folderChildren[itemId] ?? [],
		},
		indent: 16,
		features: [syncDataLoaderFeature, hotkeysCoreFeature],
		onPrimaryAction: (item) => {
			const data = item.getItemData();
			if (data.kind === "file") {
				void navigate({
					to: "/editor",
					search: {
						file: data.entry.id,
						neotree: isMobile ? "closed" : "open",
					},
				});
				requestEditorFocus();
			}
		},
	});

	// Focus the tree when opened, preferring the selected file.
	useEffect(() => {
		if (currentFileId) {
			const ancestors = getAncestorFolderIds(currentFileId);
			for (const ancestorId of ancestors) {
				tree.getItemInstance(ancestorId)?.expand();
			}
		}

		requestAnimationFrame(() => {
			const itemId = currentFileId ?? rootChildIds[0];
			if (itemId) tree.getItemInstance(itemId)?.setFocused();
			tree.updateDomFocus();
		});
	}, [currentFileId, tree]);

	function closeNeoTree() {
		void navigate({
			to: pathname,
			search: (prev) => ({
				...prev,
				neotree: "closed" as const,
			}),
		});
	}

	const treeContent = (
		<>
			{/* Header */}
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

			{/* Tree items */}
			<div
				{...tree.getContainerProps()}
				className="min-h-0 flex-1 overflow-y-auto p-2 font-mono text-xs scrollbar-gutter-both outline-none"
			>
				{tree.getItems().map((item) => {
					const itemData = item.getItemData();
					const isActiveFile = itemData.kind === "file" && itemData.entry.id === currentFileId;

					return (
						<button
							{...item.getProps()}
							key={item.getId()}
							className={cn(
								"flex w-full items-center gap-1.5 py-0.5 text-left text-muted-foreground transition",
								"focus-visible:outline-none",
								// Active file highlight
								isActiveFile && "bg-accent/40 text-primary",
								// Focused item
								item.isFocused() && !isActiveFile && "bg-accent/30 text-foreground",
							)}
							style={{
								paddingLeft: `${item.getItemMeta().level * 16 + 8}px`,
							}}
							type="button"
						>
							{/* Icon */}
							{item.isFolder() ? (
								item.isExpanded() ? (
									<FolderOpen className="size-3 shrink-0" />
								) : (
									<Folder className="size-3 shrink-0" />
								)
							) : (
								<FileText className="size-3 shrink-0" />
							)}

							{/* Label */}
							<span className={cn("truncate", item.isFolder() && "font-medium")}>
								{item.getItemName()}
								{item.isFolder() ? "/" : ""}
							</span>
						</button>
					);
				})}
			</div>
		</>
	);

	if (!isMobile && search.neotree !== "open") {
		return null;
	}

	return isMobile ? (
		<Drawer open={search.neotree === "open"} swipeDirection="left" onOpenChange={closeNeoTree}>
			<DrawerPopup side="left" className="bg-background px-0 pb-0">
				<DrawerContent>{treeContent}</DrawerContent>
			</DrawerPopup>
		</Drawer>
	) : (
		<aside className="flex w-56 shrink-0 flex-col border-r border-border bg-background">
			{treeContent}
		</aside>
	);
}
