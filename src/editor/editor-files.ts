export type EditorFakeFile = {
	content: string;
	id: string;
	language: "json" | "markdown" | "typescript";
	name: string;
	path: string;
};

export type EditorFakeFileNode = {
	children?: readonly EditorFakeFileNode[];
	fileId?: string;
	name: string;
	type: "directory" | "file";
};

export const editorFakeFiles: readonly EditorFakeFile[] = [
	{
		id: "readme",
		name: "README.md",
		path: "src/welcome/README.md",
		language: "markdown",
		content: "# Welcome\n\nFake markdown file for welcome route preview.",
	},
	{
		id: "content",
		name: "content.md",
		path: "src/welcome/content.md",
		language: "markdown",
		content: "# Content\n\nPortfolio intro copy lives here for now.",
	},
	{
		id: "welcome",
		name: "welcome.ts",
		path: "src/welcome/welcome.ts",
		language: "typescript",
		content:
			'export const welcome = {\n\ttitle: "Welcome",\n\tdescription: "Fake TypeScript content.",\n};\n',
	},
	{
		id: "packages-json",
		name: "packages.json",
		path: "src/welcome/packages.json",
		language: "json",
		content: '{\n\t"name": "welcome",\n\t"private": true\n}\n',
	},
];

export const editorFakeFileTree: readonly EditorFakeFileNode[] = [
	{
		name: "src",
		type: "directory",
		children: [
			{
				name: "welcome",
				type: "directory",
				children: editorFakeFiles.map(({ id, name }) => ({ fileId: id, name, type: "file" })),
			},
		],
	},
];

export function getEditorFakeFile(fileId: string | undefined): EditorFakeFile | undefined {
	return editorFakeFiles.find((file) => file.id === fileId);
}
