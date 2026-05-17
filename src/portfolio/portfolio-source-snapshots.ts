import { tsx } from "#/editor/editor-file-builders";
import type { EditorFileInput } from "#/editor/editor-files.types";

/**
 * Source code snapshots of portfolio section renderers.
 * These are manually curated — update when section components change.
 */
export const portfolioSourceSnapshots: ReadonlyArray<EditorFileInput> = [
	{
		name: "AboutSection.tsx",
		folder: "src/portfolio/about",
		language: "tsx",
		content: tsx`import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { sectionMetadata } from "#/terminal/section-metadata";

const meta = sectionMetadata["/terminal/about"];

export function AboutSection(): ReactNode {
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
		name: "WorkSection.tsx",
		folder: "src/portfolio/work",
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

export function WorkSection(): ReactNode {
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
		name: "ContactSection.tsx",
		folder: "src/portfolio/contact",
		language: "tsx",
		content: tsx`import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { sectionMetadata } from "#/terminal/section-metadata";

const meta = sectionMetadata["/terminal/contact"];

export function ContactSection(): ReactNode {
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
