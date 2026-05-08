function lines(values: ReadonlyArray<string>): string {
	return values.join("\n");
}

const stack = {
	framework: "TanStack Start",
	runtime: "Cloudflare Workers",
	ui: ["React", "Tailwind CSS"],
	language: "TypeScript",
} as const;

export const editorFiles = [
	{
		name: "README.md",
		language: "markdown",
		content: lines([
			"# kirdes portfolio",
			"",
			"Terminal-first portfolio interface built with TanStack Start, React, and Tailwind CSS.",
			"",
			"Use commands to explore:",
			"",
			"- ls: list routes and files",
			"- cd work: navigate sections",
			"- cat README.md: print file contents",
			"- open README.md: open read-only editor",
			"- close: close editor",
		]),
	},
	{
		name: "stack.json",
		language: "json",
		content: JSON.stringify(stack, null, 2),
	},
	{
		name: "profile.ts",
		language: "typescript",
		content: lines([
			"export const profile = {",
			'  name: "kirdes",',
			'  role: "product engineer / interface builder",',
			'  focus: ["frontend architecture", "design systems", "developer tooling"],',
			"} as const",
			"",
		]),
	},
] as const;

export type EditorFileName = (typeof editorFiles)[number]["name"];

export function findEditorFile(name: string) {
	const normalized = name.trim().toLowerCase();
	return editorFiles.find((file) => file.name.toLowerCase() === normalized) ?? null;
}

export function isEditorFileName(name: string): name is EditorFileName {
	return findEditorFile(name) !== null;
}
