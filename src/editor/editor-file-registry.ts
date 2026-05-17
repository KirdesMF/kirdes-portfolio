import { aboutFiles } from "#/portfolio/about/about.files";
import { contactFiles } from "#/portfolio/contact/contact.files";
import { rootFiles } from "#/portfolio/root.files";
import { workFiles } from "#/portfolio/work/work.files";
import type { FileGroup } from "./editor-files.types";

// ─── All content files grouped by folder ─────────────────────────────────────

export const fileGroupedByFolder: ReadonlyArray<FileGroup> = [
	{ folder: "~", label: "~", route: "/terminal", files: rootFiles },
	{ folder: "about", label: "about", route: "/terminal/about", files: aboutFiles },
	{ folder: "work", label: "work", route: "/terminal/work", files: workFiles },
	{ folder: "contact", label: "contact", route: "/terminal/contact", files: contactFiles },
] as const;
