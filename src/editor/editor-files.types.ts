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
