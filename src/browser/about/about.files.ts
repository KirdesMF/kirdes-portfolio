import { json, md } from "#/editor/editor-file-builders";
import type { EditorFileInput } from "#/editor/editor-files.types";

export const aboutFiles: ReadonlyArray<EditorFileInput> = [
	{
		name: "route.tsx",
		folder: "about",
		language: "tsx",
		content: md(
			'import { createFileRoute } from "@tanstack/react-router";',
			"",
			'export const Route = createFileRoute("/_browser/about")({',
			"\tcomponent: RouteComponent,",
			"});",
			"",
			"function RouteComponent() {",
			"\treturn (",
			"\t\t<section>",
			"\t\t\t<h1>about</h1>",
			"\t\t\t<p>product engineer / interface builder</p>",
			"\t\t</section>",
			"\t);",
			"}",
		),
	},
	{
		name: "skills.json",
		folder: "about",
		language: "json",
		content: json({
			languages: ["TypeScript", "JavaScript", "HTML", "CSS"],
			frontend: ["React", "TanStack Start", "Tailwind CSS", "PixiJS"],
			backend: ["Node.js", "Cloudflare Workers", "Hono"],
			tools: ["Bun", "Biome", "Valibot", "Shiki"],
			design: ["Figma", "Design Tokens", "Design Systems"],
		}),
	},
	{
		name: "values.md",
		folder: "about",
		language: "markdown",
		content: md(
			"# values",
			"",
			"- **simplicity** — code is a liability; ship less, mean more.",
			"- **craft** — sweat the details that users feel.",
			'- **curiosity** — the best solutions come from asking "why not?"',
			"- **openness** — share what you learn; good ideas compound.",
		),
	},
];
