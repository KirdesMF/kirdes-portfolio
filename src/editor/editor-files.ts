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
		name: "TODO.md",
		language: "markdown",
		content: lines([
			"# TODO",
			"",
			"- [ ] get hired",
			"- [ ] being rich",
			"- [ ] learn to touch type properly (jk i'm fine)",
			"- [ ] fix all the bugs (or rename them features)",
			"- [ ] finally sort that one drawer at home",
			"- [ ] write a readme that's longer than the codebase",
			"- [ ] find the perfect coffee-to-code ratio",
			"- [ ] achieve inbox zero (impossible, next)",
		]),
	},
	{
		name: "stack.json",
		language: "json",
		content: JSON.stringify(stack, null, 2),
	},
	{
		name: "About.tsx",
		language: "tsx",
		content: lines([
			"export function About() {",
			"	return (",
			"		<section>",
			"			<h1>kirdes</h1>",
			"			<p>product engineer -  interface builder</p>",
			"			<p>",
			"				building things for the web — frontend architecture,",
			"				design systems, and developer tooling that clicks.",
			"			</p>",
			"			<p>",
			"				currently exploring TanStack Start, Cloudflare Workers,",
			"				and the intersection of DX and UX.",
			"			</p>",
			"			<a href='https://github.com/kirdes'>github</a>",
			"		</section>",
			"	);",
			"}",
			"",
		]),
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
