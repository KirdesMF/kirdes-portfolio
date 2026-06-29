import { workspaceFileGroups } from "#/workspace/workspace-catalogue";
import type { EditorFileEntry, EditorFileInput, FolderRoute } from "./editor-files.types";

// ─── Build unique entries ─────────────────────────────────────────────────────

const fileRoutesById: Readonly<Record<string, string>> = {
	"~/README.md": "/readme",
	"~/ROADMAP.md": "/roadmap",
	"src/routes/about.md": "/about",
	"src/routes/contact.md": "/contact",
	"src/routes/works/index.md": "/works",
};

function getFallbackRoute(id: string): string {
	const routeBase = id
		.replace(/^~\//, "/")
		.replace(/^src\//, "/source/")
		.replace(/\.[^.]+$/, "")
		.replace(/\/index$/, "")
		.replace(/\/route$/, "");
	return routeBase.startsWith("/") ? routeBase : `/${routeBase}`;
}

function buildEntry(input: EditorFileInput): EditorFileEntry {
	const id = `${input.folder}/${input.name}`;
	return { ...input, id, route: fileRoutesById[id] ?? getFallbackRoute(id) };
}

function buildAllFiles(): ReadonlyArray<EditorFileEntry> {
	return workspaceFileGroups.flatMap((group) =>
		group.files.map((name) => buildEntry({ folder: group.folder, name })),
	);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const editorFiles = buildAllFiles();

export type EditorFileName = (typeof editorFiles)[number]["id"];

export const folderRoutes: ReadonlyArray<FolderRoute> = (() => {
	const seen = new Set<string>();
	return workspaceFileGroups
		.map(({ folder, label, route }) => ({ folder, label, route }))
		.filter((fr) => {
			if (seen.has(fr.folder)) return false;
			seen.add(fr.folder);
			return true;
		});
})();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFolderForRoute(route: string): string {
	const normalized = route || "/start";
	if (normalized === "/start" || ["/readme", "/roadmap"].includes(normalized)) return "~";
	if (normalized === "/about" || normalized === "/contact") return "src/routes";
	if (normalized === "/works") return "src/routes/works";
	return "~";
}

function getFilesInFolder(folder: string): ReadonlyArray<EditorFileEntry> {
	return editorFiles.filter((f) => f.folder === folder);
}

/** Direct lookup by full id (e.g. "about/README.md"). */
export function findEditorFile(id: string): EditorFileEntry | null {
	const normalized = id.trim().toLowerCase();
	return (
		editorFiles.find((f) => f.id.toLowerCase() === normalized) ??
		editorFiles.find((f) => f.folder === "~" && f.name.toLowerCase() === normalized) ??
		null
	);
}

/** Check if a string is a valid file id. */
export function isEditorFileName(id: string): id is EditorFileName {
	return findEditorFile(id) !== null;
}

export function findEditorFileByRoute(route: string): EditorFileEntry | null {
	const pathname = route.trim().split("?")[0]?.replace(/\/$/, "") || "/start";
	return editorFiles.find((f) => f.route === pathname) ?? null;
}

export function getEditorFileRoute(id: string): string {
	return findEditorFile(id)?.route ?? "/start";
}

export function getDisplayRouteName(route: string): string {
	const file = findEditorFileByRoute(route);
	return file ? getDisplayFileName(file.id) : route;
}

export function getDisplayFileName(id: string): string {
	const file = findEditorFile(id);
	if (!file) return id.split("/").at(-1) ?? id;
	if (file.id === "src/routes/works/index.md") return "works.md";
	if (file.folder === "~") return file.name;
	if (file.folder.startsWith("src/")) return file.name;

	return `${file.folder}/${file.name}`;
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

	// Absolute path: map to virtual folder structure via route lookup
	if (normalized.startsWith("/")) {
		// First, try the full id (strip leading /)
		const idLookup = normalized.slice(1);
		const direct = findEditorFile(idLookup);
		if (direct) return direct;

		// Try route-based lookup: /works/index.md → route /works, file index.md
		const lastSlash = normalized.lastIndexOf("/");
		if (lastSlash > 0) {
			const routePart = normalized.slice(0, lastSlash) || "/";
			const fileName = normalized.slice(lastSlash + 1);
			const folder = getFolderForRoute(routePart);
			if (folder) {
				const found = editorFiles.find(
					(f) => f.folder === folder && f.name.toLowerCase() === fileName.toLowerCase(),
				);
				if (found) return found;
			}
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

	if (!currentRoute) {
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
