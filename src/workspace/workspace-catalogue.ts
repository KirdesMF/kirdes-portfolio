import type { FileGroup } from "#/editor/editor-files.types";

export type WorkspaceView = {
	readonly route: string;
	readonly folder: string;
	readonly label: string;
	readonly renderer: string;
	readonly files: ReadonlyArray<string>;
};

export type WorkspaceViewMetadata = {
	readonly route: string;
	readonly folder: string;
	readonly label: string;
	readonly renderer: string;
	readonly contentFiles: ReadonlyArray<string>;
};

export const workspaceViews: ReadonlyArray<WorkspaceView> = [
	{
		route: "/start",
		folder: "~",
		label: "home",
		renderer: "src/routes/_app/start.tsx",
		files: ["README.md", "ROADMAP.md"],
	},
	{
		route: "/about",
		folder: "src/routes",
		label: "about",
		renderer: "src/routes/_app/_workspace/about.tsx",
		files: ["about.md"],
	},
	{
		route: "/contact",
		folder: "src/routes",
		label: "contact",
		renderer: "src/routes/_app/_workspace/contact.tsx",
		files: ["contact.md"],
	},
] as const;

export const workspaceFileGroups: ReadonlyArray<FileGroup> = [
	{ folder: "~", label: "home", route: "/start", files: ["README.md", "ROADMAP.md"] },
	{ folder: "src/routes", label: "about", route: "/about", files: ["about.md"] },
	{ folder: "src/routes", label: "contact", route: "/contact", files: ["contact.md"] },
	{
		folder: "src/routes/works",
		label: "works",
		route: "/works",
		files: ["index.md"],
	},
];

export const workspaceViewMetadata: Record<string, WorkspaceViewMetadata> = Object.fromEntries(
	workspaceViews.map((view) => [
		view.route,
		{
			route: view.route,
			folder: view.folder,
			label: view.label,
			renderer: view.renderer,
			contentFiles: view.files,
		},
	]),
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
