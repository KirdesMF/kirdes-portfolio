import type { EditorFileInput, FileGroup } from "#/editor/editor-files.types";
import aboutSectionSource from "#/portfolio/about/AboutSection.tsx?raw";
import { aboutFiles } from "#/portfolio/about/about.files";
import contactSectionSource from "#/portfolio/contact/ContactSection.tsx?raw";
import { contactFiles } from "#/portfolio/contact/contact.files";
import { rootFiles } from "#/portfolio/root.files";
import workDetailSectionSource from "#/portfolio/work/WorkDetailSection.tsx?raw";
import workSectionSource from "#/portfolio/work/WorkSection.tsx?raw";
import { workFiles } from "#/portfolio/work/work.files";

export type WorkspaceView = {
	readonly route: string;
	readonly folder: string;
	readonly label: string;
	readonly renderer: string;
	readonly files: ReadonlyArray<EditorFileInput>;
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
		route: "/terminal/about",
		folder: "about",
		label: "about",
		renderer: "src/portfolio/about/AboutSection.tsx",
		files: aboutFiles,
	},
	{
		route: "/terminal/work",
		folder: "work",
		label: "work",
		renderer: "src/portfolio/work/WorkSection.tsx",
		files: workFiles,
	},
	{
		route: "/terminal/contact",
		folder: "contact",
		label: "contact",
		renderer: "src/portfolio/contact/ContactSection.tsx",
		files: contactFiles,
	},
] as const;

export const workspaceFileGroups: ReadonlyArray<FileGroup> = [
	{ folder: "~", label: "~", route: "/terminal", files: rootFiles },
	...workspaceViews.map(({ files, folder, label, route }) => ({ folder, label, route, files })),
];

export const workspaceViewMetadata: Record<string, WorkspaceViewMetadata> = Object.fromEntries(
	workspaceViews.map((view) => [
		view.route,
		{
			route: view.route,
			folder: view.folder,
			label: view.label,
			renderer: view.renderer,
			contentFiles: view.files.map((file) => file.name),
		},
	]),
);

export const workspaceSourceFiles: ReadonlyArray<EditorFileInput> = [
	{
		name: "AboutSection.tsx",
		folder: "src/portfolio/about",
		language: "tsx",
		content: aboutSectionSource,
	},
	{
		name: "WorkSection.tsx",
		folder: "src/portfolio/work",
		language: "tsx",
		content: workSectionSource,
	},
	{
		name: "WorkDetailSection.tsx",
		folder: "src/portfolio/work",
		language: "tsx",
		content: workDetailSectionSource,
	},
	{
		name: "ContactSection.tsx",
		folder: "src/portfolio/contact",
		language: "tsx",
		content: contactSectionSource,
	},
];

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
