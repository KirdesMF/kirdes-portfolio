import { aboutFiles } from "#/browser/about/about.files";
import aboutSectionSource from "#/browser/about/about-section.tsx?raw";
import { contactFiles } from "#/browser/contact/contact.files";
import contactSectionSource from "#/browser/contact/contact-section.tsx?raw";
import homeSectionSource from "#/browser/home/home-section.tsx?raw";
import { rootFiles } from "#/browser/root.files";
import { workFiles } from "#/browser/work/work.files";
import workDetailSectionSource from "#/browser/work/work-detail-section.tsx?raw";
import workSectionSource from "#/browser/work/work-section.tsx?raw";
import type { EditorFileInput, FileGroup } from "#/editor/editor-files.types";

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
		route: "/editor",
		folder: "~",
		label: "home",
		renderer: "src/browser/home/home-section.tsx",
		files: rootFiles,
	},
	{
		route: "/about",
		folder: "about",
		label: "about",
		renderer: "src/browser/about/about-section.tsx",
		files: aboutFiles,
	},
	{
		route: "/work",
		folder: "work",
		label: "work",
		renderer: "src/browser/work/work-section.tsx",
		files: workFiles,
	},
	{
		route: "/contact",
		folder: "contact",
		label: "contact",
		renderer: "src/browser/contact/contact-section.tsx",
		files: contactFiles,
	},
] as const;

export const workspaceFileGroups: ReadonlyArray<FileGroup> = workspaceViews.map(
	({ files, folder, label, route }) => ({ folder, label, route, files }),
);

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
		name: "home-section.tsx",
		folder: "src/browser/home",
		language: "tsx",
		content: homeSectionSource,
	},
	{
		name: "about-section.tsx",
		folder: "src/browser/about",
		language: "tsx",
		content: aboutSectionSource,
	},
	{
		name: "work-section.tsx",
		folder: "src/browser/work",
		language: "tsx",
		content: workSectionSource,
	},
	{
		name: "work-detail-section.tsx",
		folder: "src/browser/work",
		language: "tsx",
		content: workDetailSectionSource,
	},
	{
		name: "contact-section.tsx",
		folder: "src/browser/contact",
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
