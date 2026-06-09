import { json, md } from "#/editor/editor-file-builders";
import type { EditorFileInput } from "#/editor/editor-files.types";

export const rootFiles: ReadonlyArray<EditorFileInput> = [
	{
		name: "README.md",
		folder: "~",
		language: "markdown",
		content: md(
			"# kirdes portfolio",
			"",
			"Terminal-first portfolio interface built with TanStack Start, React, and Tailwind CSS.",
			"",
			"Explore by navigating folders and opening files:",
			"",
			"- `ls` — list routes and files",
			"- `cd <route>` — navigate to a workspace view",
			"- `cat <file>` — print file contents",
			"- `open <file>` — open in read-only editor",
			"- `exit` — close editor",
		),
	},
	{
		name: "TODO.md",
		folder: "~",
		language: "markdown",
		content: md(
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
		),
	},
	{
		name: "stack.json",
		folder: "~",
		language: "json",
		content: json({
			framework: "TanStack Start",
			runtime: "Cloudflare Workers",
			ui: ["React", "Tailwind CSS"],
			language: "TypeScript",
		}),
	},
	{
		name: "profile.ts",
		folder: "~",
		language: "typescript",
		content: md(
			"export const profile = {",
			'  name: "kirdes",',
			'  role: "product engineer / interface builder",',
			'  focus: ["frontend architecture", "design systems", "developer tooling"],',
			"} as const",
		),
	},
	{
		name: "infos.txt",
		folder: "~",
		language: "text",
		content: md(
			"LOCATION    Paris, France",
			"FOCUS       frontend architecture — design systems — dev tooling",
			"CONTACT     cedric@kirdes.dev / github.com/kirdesmf",
			"STATUS      open for freelance & collaboration",
		),
	},
];
