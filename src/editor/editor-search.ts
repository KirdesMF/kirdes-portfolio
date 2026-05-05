export type EditorPanelSearchValue = "open" | "closed";
export type EditorTerminalSearchValue = "open" | "closed" | "fullscreen";

export type EditorSearch = {
	left: EditorPanelSearchValue;
	right: EditorPanelSearchValue;
	terminal: EditorTerminalSearchValue;
};

function isEditorPanelSearchValue(value: unknown): value is EditorPanelSearchValue {
	return value === "open" || value === "closed";
}

function isEditorTerminalSearchValue(value: unknown): value is EditorTerminalSearchValue {
	return value === "open" || value === "closed" || value === "fullscreen";
}

export function validateEditorSearch(search: Record<string, unknown>): EditorSearch {
	return {
		left: isEditorPanelSearchValue(search.left) ? search.left : "closed",
		right: isEditorPanelSearchValue(search.right) ? search.right : "closed",
		terminal: isEditorTerminalSearchValue(search.terminal) ? search.terminal : "closed",
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
