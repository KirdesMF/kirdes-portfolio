export const editorProjectSearchValues = [
	"about",
	"projects",
	"skills",
	"contact",
	"help-command",
	"game",
] as const;
export const editorWorkspaceSearchValues = ["1", "2"] as const;

export type EditorPanelSearchValue = "open" | "closed";
export type EditorProjectSearchValue = (typeof editorProjectSearchValues)[number];
export type EditorTerminalSearchValue = "open" | "closed" | "fullscreen";
export type EditorWorkspaceSearchValue = (typeof editorWorkspaceSearchValues)[number];

export type EditorSearch = {
	left: EditorPanelSearchValue;
	openProject?: EditorProjectSearchValue;
	project?: EditorProjectSearchValue;
	right: EditorPanelSearchValue;
	terminal: EditorTerminalSearchValue;
	workspace: EditorWorkspaceSearchValue;
};

const editorProjectSearchValueSet: ReadonlySet<string> = new Set(editorProjectSearchValues);
const editorWorkspaceSearchValueSet: ReadonlySet<string> = new Set(editorWorkspaceSearchValues);

function isEditorPanelSearchValue(value: unknown): value is EditorPanelSearchValue {
	return value === "open" || value === "closed";
}

function isEditorProjectSearchValue(value: unknown): value is EditorProjectSearchValue {
	return typeof value === "string" && editorProjectSearchValueSet.has(value);
}

function isEditorTerminalSearchValue(value: unknown): value is EditorTerminalSearchValue {
	return value === "open" || value === "closed" || value === "fullscreen";
}

function isEditorWorkspaceSearchValue(value: unknown): value is EditorWorkspaceSearchValue {
	return typeof value === "string" && editorWorkspaceSearchValueSet.has(value);
}

export function validateEditorSearch(search: Record<string, unknown>): EditorSearch {
	return {
		left: isEditorPanelSearchValue(search.left) ? search.left : "closed",
		openProject: isEditorProjectSearchValue(search.openProject) ? search.openProject : undefined,
		project: isEditorProjectSearchValue(search.project) ? search.project : undefined,
		right: isEditorPanelSearchValue(search.right) ? search.right : "closed",
		terminal: isEditorTerminalSearchValue(search.terminal) ? search.terminal : "closed",
		workspace: isEditorWorkspaceSearchValue(search.workspace) ? search.workspace : "1",
	};
}

export function selectEditorProjectSearch(
	search: EditorSearch,
	project: EditorProjectSearchValue,
): EditorSearch {
	return {
		...search,
		openProject: search.project === project && search.openProject === project ? undefined : project,
		project,
	};
}

export function selectEditorWorkspaceSearch(
	search: EditorSearch,
	workspace: EditorWorkspaceSearchValue,
): EditorSearch {
	return {
		...search,
		openProject: undefined,
		project: undefined,
		workspace,
	};
}

export function toggleLeftPanelSearch(search: EditorSearch): EditorSearch {
	return {
		...search,
		left: search.left === "open" ? "closed" : "open",
	};
}

export function toggleRightPanelSearch(search: EditorSearch): EditorSearch {
	return {
		...search,
		right: search.right === "open" ? "closed" : "open",
	};
}

export function toggleTerminalSearch(search: EditorSearch): EditorSearch {
	return {
		...search,
		terminal: search.terminal === "closed" ? "open" : "closed",
	};
}

export function closeTerminalSearch(search: EditorSearch): EditorSearch {
	return {
		...search,
		terminal: "closed",
	};
}

export function toggleTerminalFullscreenSearch(search: EditorSearch): EditorSearch {
	return {
		...search,
		terminal: search.terminal === "fullscreen" ? "open" : "fullscreen",
	};
}
