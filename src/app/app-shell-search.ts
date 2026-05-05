export type SidePanelSearchValue = "open";

export type AppShellSearch = {
	left?: SidePanelSearchValue;
	right?: SidePanelSearchValue;
};

function isSidePanelSearchValue(value: unknown): value is SidePanelSearchValue {
	return value === "open";
}

export function validateAppShellSearch(search: Record<string, unknown>): AppShellSearch {
	return {
		left: isSidePanelSearchValue(search.left) ? search.left : undefined,
		right: isSidePanelSearchValue(search.right) ? search.right : undefined,
	};
}
