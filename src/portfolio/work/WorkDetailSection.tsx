import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { SourceLinks } from "#/portfolio/SourceLinks";
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

			{meta ? <SourceLinks meta={meta} to="/terminal/work" /> : null}
		</div>
	);
}
