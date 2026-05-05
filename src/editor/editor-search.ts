export type EditorPanelSearchValue = "open" | "closed";

export type EditorSearch = {
	left: EditorPanelSearchValue;
	right: EditorPanelSearchValue;
	terminal: EditorPanelSearchValue;
};

function isEditorPanelSearchValue(value: unknown): value is EditorPanelSearchValue {
	return value === "open" || value === "closed";
}

export function validateEditorSearch(search: Record<string, unknown>): EditorSearch {
	return {
		left: isEditorPanelSearchValue(search.left) ? search.left : "closed",
		right: isEditorPanelSearchValue(search.right) ? search.right : "closed",
		terminal: isEditorPanelSearchValue(search.terminal) ? search.terminal : "closed",
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
		terminal: search.terminal === "open" ? "closed" : "open",
	};
}
