import { Link } from "@tanstack/react-router";
import type { EditorFileEntry, FolderRoute } from "#/editor/editor-files.types";
import { openEditorFileSearch, showRoutePanelSearch } from "#/terminal/terminal-search-transitions";

function formatRouteLabel(label: string): string {
	if (label === "~") return "~/";

	return `${label}/`;
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
						className="text-foreground/80 underline-offset-2 hover:text-primary hover:underline"
						key={folder}
						search={showRoutePanelSearch}
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
						className="text-foreground/80 underline-offset-2 hover:text-primary hover:underline"
						key={file.id}
						search={(previous) => openEditorFileSearch(previous, file.id)}
						to="."
					>
						{file.name}
					</Link>
				))}
			</div>
		</div>
	);
}
