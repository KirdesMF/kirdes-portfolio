import type { FileGroup } from "#/editor/editor-files.types";
import { aboutFiles } from "#/portfolio/about/about.files";
import { contactFiles } from "#/portfolio/contact/contact.files";
import { rootFiles } from "#/portfolio/root.files";
import { workFiles } from "#/portfolio/work/work.files";

// ─── All content files grouped by folder ─────────────────────────────────────

export const portfolioFileGroups: ReadonlyArray<FileGroup> = [
	{ folder: "~", label: "~", route: "/terminal", files: rootFiles },
	{ folder: "about", label: "about", route: "/terminal/about", files: aboutFiles },
	{ folder: "work", label: "work", route: "/terminal/work", files: workFiles },
	{ folder: "contact", label: "contact", route: "/terminal/contact", files: contactFiles },
] as const;
