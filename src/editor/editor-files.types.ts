// ─── Helpers ──────────────────────────────────────────────────────────────────

export function json(content: Record<string, unknown> | Array<unknown>): string {
	return JSON.stringify(content, null, 2);
}

export function md(...lines: Array<string>): string {
	return lines.join("\n");
}

export function tsx(str: TemplateStringsArray): string {
	return str[0];
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type EditorFileInput = {
	readonly name: string;
	readonly folder: string;
	readonly language: string;
	readonly content: string;
};

export type EditorFileEntry = EditorFileInput & {
	/** Unique identifier, e.g. "~/README.md", "about/skills.json" */
	readonly id: string;
};

export type FolderRoute = {
	readonly folder: string;
	readonly label: string;
	readonly route: string;
};

export type FileGroup = {
	folder: string;
	label: string;
	route: string;
	files: ReadonlyArray<EditorFileInput>;
};
