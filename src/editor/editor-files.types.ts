export type EditorFileInput = {
	readonly name: string;
	readonly folder: string;
};

export type EditorFileEntry = EditorFileInput & {
	/** Unique identifier, e.g. "~/README.md", "src/routes/about.md" */
	readonly id: string;
	/** Public route that renders this file, e.g. "/readme". */
	readonly route: string;
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
	files: ReadonlyArray<string>;
};
