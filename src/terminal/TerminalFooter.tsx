import { GitBranch, BoomBox } from "lucide-react";

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
				<BoomBox className="size-3" />
			</div>
		</div>
	);
}
