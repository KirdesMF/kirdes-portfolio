export type SidePanelSearchValue = "open" | "closed";

export type EditorSearch = {
	left: SidePanelSearchValue;
	right: SidePanelSearchValue;
};

function isSidePanelSearchValue(value: unknown): value is SidePanelSearchValue {
	return value === "open" || value === "closed";
}

export function validateEditorSearch(search: Record<string, unknown>): EditorSearch {
	return {
		left: isSidePanelSearchValue(search.left) ? search.left : "closed",
		right: isSidePanelSearchValue(search.right) ? search.right : "closed",
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
