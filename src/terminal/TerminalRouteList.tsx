import { Link } from "@tanstack/react-router";
import type { EditorFileEntry, FolderRoute } from "#/editor/editor-files.types";

function formatRouteLabel(label: string): string {
	if (label === "~") return "~/";

	return `${label}/`;
}

function addOpenFile(files: ReadonlyArray<string>, fileName: string): Array<string> {
	if (files.includes(fileName)) return [...files, fileName];

	return [...files, fileName];
}

export function TerminalRouteList({
	files,
	folders,
}: {
	files: ReadonlyArray<EditorFileEntry>;
	folders: ReadonlyArray<FolderRoute>;
}) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-wrap gap-x-4 gap-y-1">
				<span className="w-10 text-muted-foreground/60">dirs</span>
				{folders.map(({ folder, label, route }) => (
					<Link
						activeOptions={{ exact: true }}
						activeProps={{ className: "text-primary" }}
						className="text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
						key={folder}
						search={(previous) => ({
							activeFile: previous.activeFile,
							dialog: previous.dialog,
							editor: previous.editor,
							files: previous.files ?? [],
							panel: "route",
						})}
						to={route}
					>
						{formatRouteLabel(label)}
					</Link>
				))}
			</div>
			<div className="flex flex-wrap gap-x-4 gap-y-1">
				<span className="w-10 text-muted-foreground/60">files</span>
				{files.map((file) => (
					<Link
						className="text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
						key={file.id}
						search={(previous) => ({
							activeFile: file.id,
							dialog: previous.dialog,
							editor: "open",
							files: addOpenFile(previous.files ?? [], file.id),
							panel: "editor",
						})}
						to="."
					>
						{file.name}
					</Link>
				))}
			</div>
		</div>
	);
}
