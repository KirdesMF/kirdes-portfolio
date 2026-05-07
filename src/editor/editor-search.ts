import {
	type EditorProjectValue,
	type EditorWorkspaceValue,
	isEditorProjectInWorkspace,
	isEditorProjectValue,
	isEditorWorkspaceValue,
} from "#/editor/editor-projects";

export type EditorPanelSearchValue = "open" | "closed";
export type EditorProjectSearchValue = EditorProjectValue;
export type EditorTerminalSearchValue = "open" | "closed" | "fullscreen";
export type EditorWorkspaceSearchValue = EditorWorkspaceValue;

export type EditorWorkspaceSelectionsSearchValue = Partial<
	Record<EditorWorkspaceSearchValue, EditorProjectSearchValue>
>;

export type EditorSearch = {
	left: EditorPanelSearchValue;
	open: readonly EditorProjectSearchValue[];
	right: EditorPanelSearchValue;
	selected: EditorWorkspaceSelectionsSearchValue;
	terminal: EditorTerminalSearchValue;
};

function isEditorPanelSearchValue(value: unknown): value is EditorPanelSearchValue {
	return value === "open" || value === "closed";
}

function isEditorProjectSearchValueArray(
	value: unknown,
): value is readonly EditorProjectSearchValue[] {
	return Array.isArray(value) && value.every(isEditorProjectValue);
}

function isEditorTerminalSearchValue(value: unknown): value is EditorTerminalSearchValue {
	return value === "open" || value === "closed" || value === "fullscreen";
}

function validateEditorWorkspaceSelectionsSearch(
	value: unknown,
): EditorWorkspaceSelectionsSearchValue {
	if (!value || typeof value !== "object" || Array.isArray(value)) return {};

	return Object.fromEntries(
		Object.entries(value).filter(
			(entry): entry is [EditorWorkspaceSearchValue, EditorProjectSearchValue] => {
				const [workspace, project] = entry;

				return (
					isEditorWorkspaceValue(workspace) &&
					isEditorProjectValue(project) &&
					isEditorProjectInWorkspace(project, workspace)
				);
			},
		),
	);
}

export function validateEditorSearch(search: Record<string, unknown>): EditorSearch {
	return {
		left: isEditorPanelSearchValue(search.left) ? search.left : "open",
		open: isEditorProjectSearchValueArray(search.open) ? search.open : [],
		right: isEditorPanelSearchValue(search.right) ? search.right : "open",
		selected: validateEditorWorkspaceSelectionsSearch(search.selected),
		terminal: isEditorTerminalSearchValue(search.terminal) ? search.terminal : "closed",
	};
}

function normalizeEditorSearch(search: Partial<EditorSearch>): EditorSearch {
	return validateEditorSearch(search as Record<string, unknown>);
}

export function selectEditorProjectSearch(
	search: Partial<EditorSearch>,
	workspace: EditorWorkspaceSearchValue,
	project: EditorProjectSearchValue,
): EditorSearch {
	const nextSearch = normalizeEditorSearch(search);

	return {
		...nextSearch,
		open: nextSearch.open.includes(project) ? nextSearch.open : [...nextSearch.open, project],
		selected: {
			...nextSearch.selected,
			[workspace]: project,
		},
	};
}

export function toggleEditorProjectOpenSearch(
	search: Partial<EditorSearch>,
	project: EditorProjectSearchValue,
): EditorSearch {
	const nextSearch = normalizeEditorSearch(search);
	const isOpen = nextSearch.open.includes(project);

	return {
		...nextSearch,
		open: isOpen
			? nextSearch.open.filter((openProject) => openProject !== project)
			: [...nextSearch.open, project],
	};
}

export function selectEditorWorkspaceSearch(
	search: Partial<EditorSearch>,
	workspace: EditorWorkspaceSearchValue,
	project: EditorProjectSearchValue,
): EditorSearch {
	const nextSearch = normalizeEditorSearch(search);

	return {
		...nextSearch,
		open: nextSearch.open.includes(project) ? nextSearch.open : [...nextSearch.open, project],
		selected: {
			...nextSearch.selected,
			[workspace]: project,
		},
	};
}

export function toggleLeftPanelSearch(search: Partial<EditorSearch>): EditorSearch {
	const nextSearch = normalizeEditorSearch(search);

	return {
		...nextSearch,
		left: nextSearch.left === "open" ? "closed" : "open",
	};
}

export function toggleRightPanelSearch(search: Partial<EditorSearch>): EditorSearch {
	const nextSearch = normalizeEditorSearch(search);

	return {
		...nextSearch,
		right: nextSearch.right === "open" ? "closed" : "open",
	};
}

export function toggleTerminalSearch(search: Partial<EditorSearch>): EditorSearch {
	const nextSearch = normalizeEditorSearch(search);

	return {
		...nextSearch,
		terminal: nextSearch.terminal === "closed" ? "open" : "closed",
	};
}

export function closeTerminalSearch(search: Partial<EditorSearch>): EditorSearch {
	return {
		...normalizeEditorSearch(search),
		terminal: "closed",
	};
}

export function toggleTerminalFullscreenSearch(search: Partial<EditorSearch>): EditorSearch {
	const nextSearch = normalizeEditorSearch(search);

	return {
		...nextSearch,
		terminal: nextSearch.terminal === "fullscreen" ? "open" : "fullscreen",
	};
}
