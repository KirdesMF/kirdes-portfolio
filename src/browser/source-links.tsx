import { Link } from "@tanstack/react-router";
import { findEditorFile, getDisplayFileName } from "#/editor/editor-files";
import type { WorkspaceViewMetadata } from "#/workspace/workspace-catalogue";

type SourceLinksProps = {
	meta: WorkspaceViewMetadata;
	to?: string;
};

export function SourceLinks({ meta: m, to: _to = "/start" }: SourceLinksProps) {
	const rendererFile = findEditorFile(m.renderer);
	return (
		<div className="mt-4 border-t border-border pt-3 text-muted-foreground/60">
			<div className="mb-1 text-tiny uppercase tracking-wider">implementation</div>
			<div className="flex flex-col gap-0.5">
				<span>
					renderer:{" "}
					{rendererFile ? (
						<Link
							className="text-primary underline-offset-2 hover:underline"
							to={rendererFile.route}
						>
							{getDisplayFileName(m.renderer)}
						</Link>
					) : (
						getDisplayFileName(m.renderer)
					)}
				</span>
				<span>
					content:{" "}
					{m.contentFiles.map((file, i) => {
						const contentFile = findEditorFile(`${m.folder}/${file}`);
						return (
							<span key={file}>
								{contentFile ? (
									<Link
										className="text-primary underline-offset-2 hover:underline"
										to={contentFile.route}
									>
										{file}
									</Link>
								) : (
									file
								)}
								{i < m.contentFiles.length - 1 ? ", " : ""}
							</span>
						);
					})}
				</span>
			</div>
		</div>
	);
}
