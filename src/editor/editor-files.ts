import { getTerminalFolder } from "#/terminal/terminal-path";
import { workspaceFileGroups, workspaceSourceFiles } from "#/workspace/workspace-catalogue";
import type { EditorFileEntry, EditorFileInput, FolderRoute } from "./editor-files.types";

// ─── Build unique entries ─────────────────────────────────────────────────────

function buildEntry(input: EditorFileInput): EditorFileEntry {
	return { ...input, id: `${input.folder}/${input.name}` };
}

function buildAllFiles(): ReadonlyArray<EditorFileEntry> {
	const contentFiles = workspaceFileGroups.flatMap((group) => group.files.map(buildEntry));
	const sourceFileEntries = workspaceSourceFiles.map(buildEntry);
	return [...contentFiles, ...sourceFileEntries];
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const editorFiles = buildAllFiles();

export type EditorFileName = (typeof editorFiles)[number]["id"];

export const folderRoutes: ReadonlyArray<FolderRoute> = workspaceFileGroups.map(
	({ folder, label, route }) => ({ folder, label, route }),
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFolderForRoute(route: string): string {
	return getTerminalFolder(route) ?? "~";
}

function getFilesInFolder(folder: string): ReadonlyArray<EditorFileEntry> {
	return editorFiles.filter((f) => f.folder === folder);
}

/** Direct lookup by full id (e.g. "about/README.md"). */
export function findEditorFile(id: string): EditorFileEntry | null {
	return editorFiles.find((f) => f.id.toLowerCase() === id.trim().toLowerCase()) ?? null;
}

/** Check if a string is a valid file id. */
export function isEditorFileName(id: string): id is EditorFileName {
	return findEditorFile(id) !== null;
}

export function getDisplayFileName(id: string): string {
	return findEditorFile(id)?.name ?? id.split("/").at(-1) ?? id;
}

/**
 * Context-aware file resolution.
 *
 * 1. Absolute paths like `/about/README.md` resolve directly.
 * 2. Looks in the current route's folder first.
 * 3. Falls back to root (`~`).
 * 4. Searches all folders as a last resort.
 */
export function resolveFile(name: string, currentRoute?: string): EditorFileEntry | null {
	const normalized = name.trim();

	// Absolute path: /about/README.md → folder="about", name="README.md"
	if (normalized.startsWith("/")) {
		const parts = normalized.split("/").filter(Boolean);
		if (parts.length >= 2) {
			// Could be /about/README.md or /about with no file
			const folder = parts[0]?.toLowerCase();
			const fileName = parts.slice(1).join("/");
			return (
				editorFiles.find((f) => f.folder.toLowerCase() === folder && f.name === fileName) ?? null
			);
		}
		return null;
	}

	// Direct id lookup (supports passing full ids like "about/README.md")
	const byId = findEditorFile(normalized);
	if (byId) return byId;

	const currentFolder = currentRoute ? getFolderForRoute(currentRoute) : "~";

	// Look in current folder
	const local = editorFiles.find(
		(f) => f.folder === currentFolder && f.name.toLowerCase() === normalized.toLowerCase(),
	);
	if (local) return local;

	// Fallback to root
	const root = editorFiles.find(
		(f) => f.folder === "~" && f.name.toLowerCase() === normalized.toLowerCase(),
	);
	if (root) return root;

	// Global search
	return editorFiles.find((f) => f.name.toLowerCase() === normalized.toLowerCase()) ?? null;
}

/**
 * Returns folders and files visible from a given route context.
 *
 * - Root (`~`): shows all route folders + root files
 * - Other routes: shows all folders + local files + root files
 */
export function lsFiles(currentRoute?: string): {
	folders: ReadonlyArray<FolderRoute>;
	files: ReadonlyArray<EditorFileEntry>;
} {
	const folders = folderRoutes;

	if (!currentRoute || currentRoute === "/terminal") {
		// At root: show root files only
		return { folders, files: getFilesInFolder("~") };
	}

	const currentFolder = getFolderForRoute(currentRoute);
	const localFiles = getFilesInFolder(currentFolder);
	const rootFilesList = getFilesInFolder("~").filter(
		(rf) => !localFiles.some((lf) => lf.name === rf.name),
	);

	return { folders, files: [...localFiles, ...rootFilesList] };
}

/** Get unique file basenames visible from the current route (for suggestions). */
export function getVisibleFileNames(currentRoute?: string): ReadonlyArray<string> {
	const { files } = lsFiles(currentRoute);
	const seen = new Set<string>();
	return files
		.filter((f) => {
			if (seen.has(f.name)) return false;
			seen.add(f.name);
			return true;
		})
		.map((f) => f.name);
}
