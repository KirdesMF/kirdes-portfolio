import type { EditorFileInput } from "#/editor/editor-files.types";
import { json, md } from "#/editor/editor-files.types";

export const contactFiles: ReadonlyArray<EditorFileInput> = [
	{
		name: "README.md",
		folder: "contact",
		language: "markdown",
		content: md(
			"# /contact",
			"",
			"Reach out. Always happy to chat about work, collaboration, or ideas.",
			"",
			"See `links.json` for social links and `contact.md` for direct info.",
		),
	},
	{
		name: "links.json",
		folder: "contact",
		language: "json",
		content: json({
			twitter: "@kirdesmf",
			github: "github.com/kirdesmf",
			linkedin: "linkedin.com/in/kirdesmf",
			email: "cedric@kirdes.dev",
			website: "https://kirdes.dev",
		}),
	},
	{
		name: "contact.md",
		folder: "contact",
		language: "markdown",
		content: md(
			"# contact",
			"",
			"**email** — cedric@kirdes.dev (fastest)",
			"**twitter** — @kirdesmf",
			"**github** — github.com/kirdesmf",
			"**linkedin** — linkedin.com/in/kirdesmf",
			"",
			"Prefer async communication. I'll get back to you within a day.",
		),
	},
];
