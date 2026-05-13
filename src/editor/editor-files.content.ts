import type { EditorFileInput } from "./editor-files";

function json(content: Record<string, unknown> | Array<unknown>): string {
	return JSON.stringify(content, null, 2);
}

function md(...lines: Array<string>): string {
	return lines.join("\n");
}

function tsx(str: TemplateStringsArray): string {
	return str[0];
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
	{
		name: "status.txt",
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
			'- **curiosity** — the best solutions come from asking "why not?"',
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

// ─── Source page files (src/pages/) ───────────────────────────────────────────

export const sourceFiles: ReadonlyArray<EditorFileInput> = [
	{
		name: "About.tsx",
		folder: "src/pages",
		language: "tsx",
		content: tsx`import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { sectionMetadata } from "#/terminal/section-metadata";

const meta = sectionMetadata["/terminal/about"];

export function AboutPage(): ReactNode {
	return (
		<div className="flex flex-1 flex-col gap-3 p-4 text-xs">
			<div className="text-muted-foreground">── about ──</div>
			<div className="flex flex-col gap-1 text-muted-foreground">
				<p>product engineer / interface builder</p>
				<p className="mt-2">
					see <span className="text-primary">cat README.md</span> for details,
					<span className="text-primary"> skills.json</span> for skills, and{" "}
					<span className="text-primary">values.md</span> for principles.
				</p>
			</div>
			{meta ? <SourceLinks meta={meta} /> : null}
		</div>
	);
}

function SourceLinks({ meta: m }: { meta: NonNullable<typeof sectionMetadata[string]> }) {
	return (
		<div className="mt-4 border-t border-border pt-3 text-muted-foreground/60">
			<div className="mb-1 text-tiny uppercase tracking-wider">implementation</div>
			<div className="flex flex-col gap-0.5">
				<span>
					renderer:{" "}
					<Link
						className="text-primary underline-offset-2 hover:underline"
						search={(prev) => ({
							activeFile: m.renderer,
							dialog: prev.dialog,
							editor: "open" as const,
							files: prev.files ? [...new Set([...prev.files, m.renderer])] : [m.renderer],
							panel: "editor" as const,
						})}
						to="."
					>
						{m.renderer}
					</Link>
				</span>
				<span>
					content:{" "}
					{m.contentFiles.map((file, i) => (
						<span key={file}>
							<Link
								className="text-primary underline-offset-2 hover:underline"
								search={(prev) => {
									const id = \`\${m.folder}/\${file}\`;
									return {
										activeFile: id,
										dialog: prev.dialog,
										editor: "open" as const,
										files: prev.files ? [...new Set([...prev.files, id])] : [id],
										panel: "editor" as const,
									};
								}}
								to="."
							>
								{file}
							</Link>
							{i < m.contentFiles.length - 1 ? ", " : ""}
						</span>
					))}
				</span>
			</div>
		</div>
	);
}
`,
	},
	{
		name: "Work.tsx",
		folder: "src/pages",
		language: "tsx",
		content: tsx`import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { sectionMetadata } from "#/terminal/section-metadata";

type WorkEntry = {
	name: string;
	period: string;
	role: string;
};

const workEntries: Array<WorkEntry> = [
	{ name: "kirdes", period: "2023 → now", role: "freelance product engineer" },
	{ name: "indie", period: "2021 → now", role: "building tools and ui systems" },
];

const meta = sectionMetadata["/terminal/work"];

export function WorkPage(): ReactNode {
	return (
		<div className="flex flex-1 flex-col gap-3 p-4 text-xs">
			<div className="text-muted-foreground">── work ──</div>
			<div className="flex flex-col gap-2">
				{workEntries.map(({ name, period, role }) => (
					<div className="flex gap-4" key={name}>
						<span className="text-primary">{name}</span>
						<span>{period}</span>
						<span className="text-muted-foreground">{role}</span>
					</div>
				))}
			</div>
			<p className="text-muted-foreground">
				see <span className="text-primary">cat experience.json</span> for details and{" "}
				<span className="text-primary">freelance.md</span> for availability.
			</p>
			{meta ? <SourceLinks meta={meta} /> : null}
		</div>
	);
}

function SourceLinks({ meta: m }: { meta: NonNullable<typeof sectionMetadata[string]> }) {
	return (
		<div className="mt-4 border-t border-border pt-3 text-muted-foreground/60">
			<div className="mb-1 text-tiny uppercase tracking-wider">implementation</div>
			<div className="flex flex-col gap-0.5">
				<span>
					renderer:{" "}
					<Link
						className="text-primary underline-offset-2 hover:underline"
						search={(prev) => ({
							activeFile: m.renderer,
							dialog: prev.dialog,
							editor: "open" as const,
							files: prev.files ? [...new Set([...prev.files, m.renderer])] : [m.renderer],
							panel: "editor" as const,
						})}
						to="."
					>
						{m.renderer}
					</Link>
				</span>
				<span>
					content:{" "}
					{m.contentFiles.map((file, i) => (
						<span key={file}>
							<Link
								className="text-primary underline-offset-2 hover:underline"
								search={(prev) => {
									const id = \`\${m.folder}/\${file}\`;
									return {
										activeFile: id,
										dialog: prev.dialog,
										editor: "open" as const,
										files: prev.files ? [...new Set([...prev.files, id])] : [id],
										panel: "editor" as const,
									};
								}}
								to="."
							>
								{file}
							</Link>
							{i < m.contentFiles.length - 1 ? ", " : ""}
						</span>
					))}
				</span>
			</div>
		</div>
	);
}
`,
	},
	{
		name: "Contact.tsx",
		folder: "src/pages",
		language: "tsx",
		content: tsx`import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { sectionMetadata } from "#/terminal/section-metadata";

const meta = sectionMetadata["/terminal/contact"];

export function ContactPage(): ReactNode {
	return (
		<div className="flex flex-1 flex-col gap-3 p-4 text-xs">
			<div className="text-muted-foreground">── contacts ──</div>
			<div className="flex flex-col gap-2">
				<div className="flex gap-4">
					<span className="text-primary">twitter</span>
					<span>@kirdesmf</span>
				</div>
				<div className="flex gap-4">
					<span className="text-primary">email</span>
					<span>cedric@kirdes.dev</span>
				</div>
				<div className="flex gap-4">
					<span className="text-primary">github</span>
					<span>github.com/kirdesmf</span>
				</div>
			</div>
			<p className="text-muted-foreground">
				see <span className="text-primary">cat links.json</span> for structured data, or{" "}
				<span className="text-primary">contact.md</span> for more info.
			</p>
			{meta ? <SourceLinks meta={meta} /> : null}
		</div>
	);
}

function SourceLinks({ meta: m }: { meta: NonNullable<typeof sectionMetadata[string]> }) {
	return (
		<div className="mt-4 border-t border-border pt-3 text-muted-foreground/60">
			<div className="mb-1 text-tiny uppercase tracking-wider">implementation</div>
			<div className="flex flex-col gap-0.5">
				<span>
					renderer:{" "}
					<Link
						className="text-primary underline-offset-2 hover:underline"
						search={(prev) => ({
							activeFile: m.renderer,
							dialog: prev.dialog,
							editor: "open" as const,
							files: prev.files ? [...new Set([...prev.files, m.renderer])] : [m.renderer],
							panel: "editor" as const,
						})}
						to="."
					>
						{m.renderer}
					</Link>
				</span>
				<span>
					content:{" "}
					{m.contentFiles.map((file, i) => (
						<span key={file}>
							<Link
								className="text-primary underline-offset-2 hover:underline"
								search={(prev) => {
									const id = \`\${m.folder}/\${file}\`;
									return {
										activeFile: id,
										dialog: prev.dialog,
										editor: "open" as const,
										files: prev.files ? [...new Set([...prev.files, id])] : [id],
										panel: "editor" as const,
									};
								}}
								to="."
							>
								{file}
							</Link>
							{i < m.contentFiles.length - 1 ? ", " : ""}
						</span>
					))}
				</span>
			</div>
		</div>
	);
}
`,
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
		folder: "contact",
		label: "contact",
		route: "/terminal/contact",
		files: contactFiles,
	},
];
