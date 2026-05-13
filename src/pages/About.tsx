import { Link } from "@tanstack/react-router";
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
									const id = `${m.folder}/${file}`;
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
