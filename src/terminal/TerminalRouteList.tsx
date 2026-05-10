import { Link } from "@tanstack/react-router";
import { type EditorFileName, editorFiles } from "../editor/editor-files";
import { terminalNavigationItems } from "./terminal-routes";

function formatRouteLabel(label: string): string {
	if (label === "~") return "~/";

	return `${label}/`;
}

function addOpenFile(
	files: Array<EditorFileName>,
	fileName: EditorFileName,
): Array<EditorFileName> {
	if (files.includes(fileName)) return files;

	return [...files, fileName];
}

export function TerminalRouteList() {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-wrap gap-x-4 gap-y-1">
				<span className="w-10 text-muted-foreground/60">dirs</span>
				{terminalNavigationItems.map(({ command, label, to }) => (
					<Link
						activeOptions={{ exact: true }}
						activeProps={{ className: "text-primary" }}
						className="text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
						key={command}
						search={(previous) => ({
							activeFile: previous.activeFile,
							dialog: previous.dialog,
							editor: previous.editor,
							files: previous.files ?? [],
							panel: "route",
						})}
						to={to}
					>
						{formatRouteLabel(label)}
					</Link>
				))}
			</div>
			<div className="flex flex-wrap gap-x-4 gap-y-1">
				<span className="w-10 text-muted-foreground/60">files</span>
				{editorFiles.map(({ name }) => (
					<Link
						className="text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
						key={name}
						search={(previous) => ({
							activeFile: name,
							dialog: previous.dialog,
							editor: "open",
							files: addOpenFile(previous.files ?? [], name),
							panel: "editor",
						})}
						to="."
					>
						{name}
					</Link>
				))}
			</div>
		</div>
	);
}
