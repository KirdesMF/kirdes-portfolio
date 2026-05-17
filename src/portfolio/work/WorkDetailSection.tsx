import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { sectionMetadata } from "#/terminal/section-metadata";
import { projects, statusColors } from "./work.data";

const meta = sectionMetadata["/terminal/work"];

export function WorkDetailSection({ project }: { project: string }): ReactNode {
	const entry = projects.find((p) => p.name === project);

	if (!entry) {
		return (
			<div className="flex flex-1 flex-col gap-3 p-4 text-xs">
				<div className="text-muted-foreground">{"/* work */"}</div>
				<p>
					project <span className="text-primary">{project}</span> not found.
				</p>
				<Link
					className="flex items-center gap-1 text-primary hover:underline"
					to="/terminal/work"
					search={(previous) => ({
						activeFile: previous.activeFile,
						dialog: previous.dialog,
						editor: previous.editor,
						files: previous.files ?? [],
						maximized: previous.maximized,
						panel: previous.panel ?? "route",
					})}
				>
					<ArrowLeft className="size-3" />
					back to projects
				</Link>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col gap-3 p-4 text-xs">
			<div className="flex items-center gap-2 text-muted-foreground">
				<Link
					className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
					to="/terminal/work"
					search={(previous) => ({
						activeFile: previous.activeFile,
						dialog: previous.dialog,
						editor: previous.editor,
						files: previous.files ?? [],
						maximized: previous.maximized,
						panel: previous.panel ?? "route",
					})}
				>
					<ArrowLeft className="size-3" />
					work
				</Link>
				<span>/</span>
				<span className="text-primary">{entry.name}</span>
			</div>

			<div className="flex items-center gap-3">
				<span className="text-lg font-semibold text-foreground">{entry.name}</span>
				<span className="text-tiny text-muted-foreground">{entry.version}</span>
				<span className={`text-tiny ${statusColors[entry.status]}`}>{entry.status}</span>
			</div>

			<p className="text-muted-foreground">{entry.description}</p>

			{entry.detail}

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
