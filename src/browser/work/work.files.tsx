import { json, md } from "#/editor/editor-file-builders";
import type { EditorFileInput } from "#/editor/editor-files.types";

export const workFiles: ReadonlyArray<EditorFileInput> = [
	{
		name: "route.tsx",
		folder: "work",
		language: "tsx",
		content: md(
			'import { createFileRoute } from "@tanstack/react-router";',
			"",
			'export const Route = createFileRoute("/_browser/work")({',
			"\tcomponent: RouteComponent,",
			"});",
			"",
			"function RouteComponent() {",
			"\treturn (",
			"\t\t<section>",
			"\t\t\t<h1>work</h1>",
			"\t\t\t<p>selected projects and experience</p>",
			"\t\t</section>",
			"\t);",
			"}",
		),
	},
	{
		name: "experience.json",
		folder: "work",
		language: "json",
		content: json([
			{
				name: "kirdes",
				period: "2023 → now",
				role: "freelance product engineer",
			},
			{
				name: "indie",
				period: "2021 → now",
				role: "building tools and ui systems",
			},
		]),
	},
	{
		name: "freelance.md",
		folder: "work",
		language: "markdown",
		content: md(
			"# freelance",
			"",
			"Available for frontend architecture, design systems,",
			"and developer tooling projects.",
			"",
			"Contact via `/contact` or email cedric@kirdes.dev.",
		),
	},
	{
		name: "list.json",
		folder: "work/projects",
		language: "json",
		content: json([]),
	},
];
