import { Link } from "@tanstack/react-router";
import { getDisplayFileName } from "#/editor/editor-files";
import type { WorkspaceViewMetadata } from "#/workspace/workspace-catalogue";

type SourceLinksProps = {
	meta: WorkspaceViewMetadata;
	to?: string;
};

export function SourceLinks({ meta: m, to = "/editor" }: SourceLinksProps) {
	return (
		<div className="mt-4 border-t border-border pt-3 text-muted-foreground/60">
			<div className="mb-1 text-tiny uppercase tracking-wider">implementation</div>
			<div className="flex flex-col gap-0.5">
				<span>
					renderer:{" "}
					<Link
						className="text-primary underline-offset-2 hover:underline"
						search={{ file: m.renderer }}
						to={to}
					>
						{getDisplayFileName(m.renderer)}
					</Link>
				</span>
				<span>
					content:{" "}
					{m.contentFiles.map((file, i) => (
						<span key={file}>
							<Link
								className="text-primary underline-offset-2 hover:underline"
								search={{ file: `${m.folder}/${file}` }}
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
