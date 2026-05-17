import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ScrambleTitle } from "#/design-system/ScrambleTitle";
import { sectionMetadata } from "#/terminal/section-metadata";
import { projects, statusColors } from "./work.data";

const meta = sectionMetadata["/terminal/work"];

export function WorkSection(): ReactNode {
	return (
		<div className="flex flex-1 flex-col gap-3 p-4 text-xs">
			<div className="text-muted-foreground">{"/* work */"}</div>

			<table className="w-full border-collapse">
				<thead>
					<tr className="border-b border-border text-left text-tiny text-muted-foreground/70">
						<th className="whitespace-nowrap pb-1.5 pr-4 font-medium">NAME</th>
						<th className="whitespace-nowrap pb-1.5 pr-4 font-medium">VERSION</th>
						<th className="whitespace-nowrap pb-1.5 pr-4 font-medium">STATUS</th>
						<th className="pb-1.5 font-medium">DESCRIPTION</th>
					</tr>
				</thead>
				<tbody>
					{projects.map((entry) => (
						<tr key={entry.name} className="border-b border-border/50 last:border-none">
							<td className="whitespace-nowrap py-1.5 pr-4">
								<Link
									className="text-primary underline-offset-2 hover:underline"
									to="/terminal/work/$project"
									params={{ project: entry.name }}
									search={(previous) => ({
										activeFile: previous.activeFile,
										dialog: previous.dialog,
										editor: previous.editor,
										files: previous.files ?? [],
										maximized: previous.maximized,
										panel: previous.panel ?? "route",
									})}
								>
									<ScrambleTitle>{entry.name}</ScrambleTitle>
								</Link>
							</td>
							<td className="whitespace-nowrap py-1.5 pr-4 text-muted-foreground">
								{entry.version}
							</td>
							<td className={`whitespace-nowrap py-1.5 pr-4 ${statusColors[entry.status]}`}>
								{entry.status}
							</td>
							<td className="py-1.5 text-muted-foreground">{entry.description}</td>
						</tr>
					))}
				</tbody>
			</table>

			<p className="text-muted-foreground">
				click a project name for details. see{" "}
				<span className="text-primary">cat projects.json</span> for structured data.
			</p>

			{meta ? <SourceLinks meta={meta} /> : null}
		</div>
	);
}

function SourceLinks({ meta: m }: { meta: NonNullable<(typeof sectionMetadata)[string]> }) {
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
						to="/terminal/work"
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
									const id = `${m.folder}/${file}`;
									return {
										activeFile: id,
										dialog: prev.dialog,
										editor: "open" as const,
										files: prev.files ? [...new Set([...prev.files, id])] : [id],
										panel: "editor" as const,
									};
								}}
								to="/terminal/work"
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
