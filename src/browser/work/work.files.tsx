import { json, md } from "#/editor/editor-file-builders";
import type { EditorFileInput } from "#/editor/editor-files.types";

export const workFiles: ReadonlyArray<EditorFileInput> = [
	{
		name: "README.md",
		folder: "work",
		language: "markdown",
		content: md(
			"# /work",
			"",
			"Selected work experience and freelance engagements.",
			"",
			"See `experience.json` for the timeline and `freelance.md`",
			"for current availability.",
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
];
