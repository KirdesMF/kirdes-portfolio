import { json, md } from "#/editor/editor-file-builders";
import type { EditorFileInput } from "#/editor/editor-files.types";

export const aboutFiles: ReadonlyArray<EditorFileInput> = [
	{
		name: "README.md",
		folder: "about",
		language: "markdown",
		content: md(
			"# /about",
			"",
			"Product engineer building for the web — frontend architecture,",
			"design systems, and developer tooling.",
			"",
			"Currently exploring TanStack Start, Cloudflare Workers,",
			"and the intersection of DX and UX.",
			"",
			"See `skills.json` for technical skills and `values.md` for principles.",
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
