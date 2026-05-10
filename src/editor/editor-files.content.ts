import type { EditorFileInput } from "./editor-files";

function json(content: Record<string, unknown> | Array<unknown>): string {
	return JSON.stringify(content, null, 2);
}

function md(...lines: Array<string>): string {
	return lines.join("\n");
}

// ─── Root files (~/) ─────────────────────────────────────────────────────────

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
			"- `cd <route>` — navigate to a section",
			"- `cat <file>` — print file contents",
			"- `open <file>` — open in read-only editor",
			"- `close` — close editor",
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
];

// ─── About files (/about/) ────────────────────────────────────────────────────

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
			"- **curiosity** — the best solutions come from asking \"why not?\"",
			"- **openness** — share what you learn; good ideas compound.",
		),
	},
];

// ─── Work files (/work/) ──────────────────────────────────────────────────────

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

// ─── Projects files (/projects/) ──────────────────────────────────────────────

export const projectFiles: ReadonlyArray<EditorFileInput> = [
	{
		name: "README.md",
		folder: "projects",
		language: "markdown",
		content: md(
			"# /projects",
			"",
			"Selected projects and side quests.",
			"",
			"Open individual `.json` files for details.",
		),
	},
	{
		name: "kirdes-portfolio.json",
		folder: "projects",
		language: "json",
		content: json({
			name: "kirdes portfolio",
			stack: ["TanStack Start", "React", "Tailwind CSS", "TypeScript"],
			status: "live",
			url: "https://kirdes.dev",
			highlights: [
				"terminal-first interface",
				"server-rendered syntax highlighting",
				"context-aware command routing",
			],
		}),
	},
	{
		name: "ui-kit.json",
		folder: "projects",
		language: "json",
		content: json({
			name: "UI Kit",
			stack: ["Design Tokens", "React", "Tailwind CSS"],
			status: "in progress",
			description:
				"Component library and design system for consistent, scalable UIs.",
		}),
	},
	{
		name: "notes.md",
		folder: "projects",
		language: "markdown",
		content: md(
			"# project notes",
			"",
			"- portfolio needs a dark mode toggle that feels good",
			"- ui-kit should ship with a playground",
			"- write more about the \"why\" not just the \"what\"",
			"- maybe add a guestbook? low priority.",
		),
	},
];

// ─── Contact files (/contact/) ────────────────────────────────────────────────

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
			"",
			"Prefer async communication. I'll get back to you within a day.",
		),
	},
];

// ─── All files grouped by folder ──────────────────────────────────────────────

export const fileGroupedByFolder: ReadonlyArray<{
	folder: string;
	label: string;
	route: string;
	files: ReadonlyArray<EditorFileInput>;
}> = [
	{ folder: "~", label: "~", route: "/terminal", files: rootFiles },
	{ folder: "about", label: "about", route: "/terminal/about", files: aboutFiles },
	{ folder: "work", label: "work", route: "/terminal/work", files: workFiles },
	{
		folder: "projects",
		label: "projects",
		route: "/terminal/projects",
		files: projectFiles,
	},
	{
		folder: "contact",
		label: "contact",
		route: "/terminal/contact",
		files: contactFiles,
	},
];
