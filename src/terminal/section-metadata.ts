export type SectionMetadata = {
	route: string;
	folder: string;
	label: string;
	renderer: string;
	contentFiles: Array<string>;
};

export const sectionMetadata: Record<string, SectionMetadata> = {
	"/terminal/about": {
		route: "/terminal/about",
		folder: "about",
		label: "about",
		renderer: "src/pages/About.tsx",
		contentFiles: ["README.md", "skills.json", "values.md"],
	},
	"/terminal/work": {
		route: "/terminal/work",
		folder: "work",
		label: "work",
		renderer: "src/pages/Work.tsx",
		contentFiles: ["README.md", "experience.json", "freelance.md"],
	},
	"/terminal/contact": {
		route: "/terminal/contact",
		folder: "contact",
		label: "contact",
		renderer: "src/pages/Contact.tsx",
		contentFiles: ["README.md", "links.json", "contact.md"],
	},
};

export function getSectionByRoute(route: string): SectionMetadata | null {
	return sectionMetadata[route] ?? null;
}

export function getSectionByFolder(folder: string): SectionMetadata | null {
	const normalized = folder.toLowerCase().replace(/^~\//, "").replace(/^~$/, "");
	return Object.values(sectionMetadata).find((s) => s.folder.toLowerCase() === normalized) ?? null;
}

export function getSectionByLabel(label: string): SectionMetadata | null {
	const normalized = label.toLowerCase().replace(/^\//, "");
	return (
		Object.values(sectionMetadata).find(
			(s) => s.label.toLowerCase() === normalized || s.folder.toLowerCase() === normalized,
		) ?? null
	);
}
