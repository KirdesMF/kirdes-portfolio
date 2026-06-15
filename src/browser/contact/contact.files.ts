import { contactInfo } from "#/contact/contact-info";
import { json, md } from "#/editor/editor-file-builders";
import type { EditorFileInput } from "#/editor/editor-files.types";

export const contactFiles: ReadonlyArray<EditorFileInput> = [
	{
		name: "route.tsx",
		folder: "contact",
		language: "tsx",
		content: md(
			'import { createFileRoute } from "@tanstack/react-router";',
			"",
			'export const Route = createFileRoute("/_browser/contact")({',
			"\tcomponent: RouteComponent,",
			"});",
			"",
			"function RouteComponent() {",
			"\treturn (",
			"\t\t<section>",
			"\t\t\t<h1>contact</h1>",
			"\t\t\t<p>get in touch</p>",
			"\t\t</section>",
			"\t);",
			"}",
		),
	},
	{
		name: "links.json",
		folder: "contact",
		language: "json",
		content: json({
			twitter: contactInfo.x.handle,
			github: `github.com/${contactInfo.github.handle}`,
			linkedin: `linkedin.com/in/${contactInfo.linkedin.handle}`,
			email: contactInfo.email,
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
			`**email** — [${contactInfo.email}](mailto:${contactInfo.email}) (fastest)`,
			`**x** — [${contactInfo.x.handle}](${contactInfo.x.url})`,
			`**github** — [github.com/${contactInfo.github.handle}](${contactInfo.github.url})`,
			`**linkedin** — [linkedin.com/in/${contactInfo.linkedin.handle}](${contactInfo.linkedin.url})`,
			"",
			"Prefer async communication. I'll get back to you within a day.",
		),
	},
];
