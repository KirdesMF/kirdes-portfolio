import { hotkeysCoreFeature, syncDataLoaderFeature } from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronsLeft, FileText, Folder, FolderOpen } from "lucide-react";
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

// ── Build explicit flat tree ──

function buildFlatTree() {
	function addFolder(label: string, childIds: string[]): string {
		const id = nextFolderId();
		treeItems[id] = { kind: "folder", label };
		folderChildren[id] = childIds;
		return id;
	}

	function addFile(entry: EditorFileEntry, displayName: string): string {
		const id = entry.route;
		treeItems[id] = { kind: "file", entry, displayName };
		return id;
	}

	function optionalFile(folder: string, name: string): string[] {
		const entry = findFile(folder, name);
		return entry ? [addFile(entry, name)] : [];
	}

	// ── src/routes/ ──
	const worksEntry = findFile("src/routes/works", "index.md");
	const routesFolderId = addFolder("routes", [
		...optionalFile("src/routes", "about.md"),
		...optionalFile("src/routes", "contact.md"),
		...(worksEntry ? [addFile(worksEntry, "works.md")] : []),
	]);

	// ── src/ ──
	const srcFolderId = addFolder("src", [routesFolderId]);

	// ── Root-level files ──
	const rootFiles = [...optionalFile("~", "README.md"), ...optionalFile("~", "ROADMAP.md")];

	// ── portfolio/ ──
	const rootId = addFolder("portfolio", [srcFolderId, ...rootFiles]);
	rootChildIds.push(rootId);
}

// Build once at module level
buildFlatTree();

// ─── Public API: used by FindFileDialog and FindTextDialog ────────────────────

/**
 * Returns a flat Map from file entry.id → display path (e.g. "portfolio/src/routes/about.md").
 */
export function getNeoTreeFilePaths(): ReadonlyMap<string, string> {
	const paths = new Map<string, string>();

	function walk(itemId: string, parents: string[]) {
		const item = treeItems[itemId];
		if (!item) return;

		if (item.kind === "folder") {
			const label = item.label;
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
		neotree?: "open";
	};

	const currentRoute = pathname.replace(/\/$/, "") || "/home";
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
				// Also expand immediate children of src (routes)
				for (const grandChildId of folderChildren[childId] ?? []) {
					if (treeItems[grandChildId]?.kind === "folder") {
						expanded.push(grandChildId);
						// Also expand routes children (works)
						for (const greatGrandChildId of folderChildren[grandChildId] ?? []) {
							if (treeItems[greatGrandChildId]?.kind === "folder") {
								expanded.push(greatGrandChildId);
							}
						}
					}
				}
			}
		}

		// If a file route is selected, expand its ancestor chain
		if (currentRoute) {
			const ancestors = getAncestorFolderIds(currentRoute);
			for (const ancestorId of ancestors) {
				if (!expanded.includes(ancestorId)) {
					expanded.push(ancestorId);
				}
			}
		}

		return expanded;
	}, [currentRoute]);

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
					to: data.entry.route,
					search: { neotree: isMobile ? undefined : "open" },
				});
				requestEditorFocus();
			}
		},
	});

	// Focus the tree when opened, preferring the selected file route.
	useEffect(() => {
		if (currentRoute) {
			const ancestors = getAncestorFolderIds(currentRoute);
			for (const ancestorId of ancestors) {
				tree.getItemInstance(ancestorId)?.expand();
			}
		}

		requestAnimationFrame(() => {
			const itemId = currentRoute ?? rootChildIds[0];
			if (itemId) tree.getItemInstance(itemId)?.setFocused();
			tree.updateDomFocus();
		});
	}, [currentRoute, tree]);

	function closeNeoTree() {
		void navigate({
			to: pathname,
			search: (prev) => ({
				...prev,
				neotree: undefined,
			}),
		});
	}

	const treeContent = (
		<>
			{/* Tree items */}
			<div
				{...tree.getContainerProps()}
				className="min-h-0 flex-1 overflow-y-auto p-2 font-mono text-xs outline-none"
			>
				{tree.getItems().map((item) => {
					const itemData = item.getItemData();
					const isActiveFile = itemData.kind === "file" && itemData.entry.route === currentRoute;
					const level = item.getItemMeta().level;

					return (
						<button
							{...item.getProps()}
							key={item.getId()}
							className={cn(
								"relative flex w-full items-center gap-1.5 py-0.5 text-left text-muted-foreground transition",
								"focus-visible:outline-none",
								// Active file highlight
								isActiveFile && "bg-accent/40 text-primary",
								// Focused item
								item.isFocused() && !isActiveFile && "bg-accent/30 text-foreground",
							)}
							style={{
								paddingLeft: `${level * 16 + 8}px`,
							}}
							type="button"
						>
							{level > 0 && (
								<span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0">
									{Array.from({ length: level }, (_, depth) => ({
										key: `tree-line-${level}-${depth}`,
										left: depth * 16 + 14,
									})).map((line) => (
										<span
											className="absolute top-0 h-full w-px bg-border/70"
											key={line.key}
											style={{ left: `${line.left}px` }}
										/>
									))}
									<span
										className="absolute top-1/2 h-px w-2.5 bg-border/70"
										style={{ left: `${(level - 1) * 16 + 14}px` }}
									/>
								</span>
							)}

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
		<aside className="relative min-h-0 w-56">
			<div className="flex size-full flex-col overflow-hidden border-thin border-r-0 border-border bg-background">
				{treeContent}

				{/* Close button at bottom-right */}
				<button
					aria-label="Close explorer"
					className="cursor-pointer self-end p-2 text-muted-foreground/50 hover:text-foreground"
					type="button"
					onClick={closeNeoTree}
				>
					<ChevronsLeft className="size-4" />
				</button>
			</div>
			<div className="pointer-events-none absolute top-0 left-2 z-raised -translate-y-1/2 bg-background px-2 text-primary text-tiny">
				[e] explorer
			</div>
		</aside>
	);
}
