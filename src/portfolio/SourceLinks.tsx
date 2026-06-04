import { Link } from "@tanstack/react-router";
import type { WorkspaceViewMetadata } from "#/workspace/workspace-catalogue";

type SourceLinksProps = {
	meta: WorkspaceViewMetadata;
	/** Route to keep when opening files in editor. Defaults to "." */
	to?: string;
};

export function SourceLinks({ meta: m, to = "." }: SourceLinksProps) {
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
							editor: "open" as const,
							files: prev.files ? [...new Set([...prev.files, m.renderer])] : [m.renderer],
							panel: "editor" as const,
						})}
						to={to}
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
										editor: "open" as const,
										files: prev.files ? [...new Set([...prev.files, id])] : [id],
										panel: "editor" as const,
									};
								}}
								to={to}
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
