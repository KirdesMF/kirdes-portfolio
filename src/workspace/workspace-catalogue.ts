export type WorkspaceView = {
	readonly route: string;
	readonly folder: string;
	readonly label: string;
	renderer: string;
};

export type WorkspaceViewMetadata = WorkspaceView;

export const workspaceViews: ReadonlyArray<WorkspaceView> = [
	{
		route: "/home",
		folder: "~",
		label: "home",
		renderer: "src/routes/_app/home.tsx",
	},
] as const;

export const workspaceViewMetadata: Record<string, WorkspaceViewMetadata> = Object.fromEntries(
	workspaceViews.map((view) => [view.route, view]),
);

export function getWorkspaceViewByRoute(route: string): WorkspaceViewMetadata | null {
	return workspaceViewMetadata[route] ?? null;
}

export function getWorkspaceViewByFolder(folder: string): WorkspaceViewMetadata | null {
	const normalized = folder.toLowerCase().replace(/^~\//, "").replace(/^~$/, "");
	return (
		Object.values(workspaceViewMetadata).find((view) => view.folder.toLowerCase() === normalized) ??
		null
	);
}

export function getWorkspaceViewByLabel(label: string): WorkspaceViewMetadata | null {
	const normalized = label.toLowerCase().replace(/^\//, "");
	return (
		Object.values(workspaceViewMetadata).find(
			(view) => view.label.toLowerCase() === normalized || view.folder.toLowerCase() === normalized,
		) ?? null
	);
}
