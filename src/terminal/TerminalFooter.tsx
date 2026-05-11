import { Link } from "@tanstack/react-router";
import { BoomBox, FileTerminal, GitBranch } from "lucide-react";

import { Separator } from "#/design-system/Separator";

export function TerminalFooter() {
	return (
		<div className="flex shrink-0 items-center justify-between border-t border-border px-3 py-1.5 text-tiny text-muted-foreground">
			<div className="flex items-center gap-1.5">
				<GitBranch className="size-3" />
				<span>feature/kirdes-app</span>
			</div>
			<div className="flex items-center gap-1.5">
				<span className="inline-block size-1.5 rounded-full bg-primary" />
				<span>STATUS: OK</span>
				<Separator orientation="vertical" />
				<Link
					activeOptions={{ includeSearch: true }}
					activeProps={{ className: "text-primary" }}
					aria-label="Open editor"
					className="transition-colors hover:text-foreground"
					search={(previous) => ({
						activeFile: previous.activeFile,
						dialog: previous.dialog,
						editor: "open",
						files: previous.files ?? [],
						panel: "editor",
					})}
					to="."
				>
					<FileTerminal className="size-3" />
				</Link>
				<Separator orientation="vertical" />
				<BoomBox className="size-3" />
			</div>
		</div>
	);
}
