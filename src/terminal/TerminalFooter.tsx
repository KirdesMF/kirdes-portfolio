import { Link } from "@tanstack/react-router";
import { FileTerminal, GitBranch } from "lucide-react";
import { Separator } from "#/design-system/Separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "#/design-system/Tooltip";
import { useScrambleRef } from "#/design-system/useScrambleRef";
import { AvailabilityStatus } from "#/portfolio/AvailabilityStatus";

export function TerminalFooter() {
	const rootRef = useScrambleRef<HTMLDivElement>({
		selector: "[data-anim-footer]",
		staggerMs: 100,
	});

	return (
		<div
			ref={rootRef}
			className="flex shrink-0 items-center justify-between border-t border-border px-3 py-1.5 text-tiny text-muted-foreground"
		>
			<div className="flex items-center gap-1.5">
				<GitBranch className="size-3" />
				<span data-anim-footer>feature/kirdes-app</span>
			</div>
			<div className="flex items-center gap-1.5">
				<AvailabilityStatus status="open-to-work" />
				<Separator orientation="vertical" />
				<Tooltip>
					<TooltipTrigger>
						<Link
							activeOptions={{ includeSearch: true }}
							activeProps={{ className: "text-primary" }}
							aria-label="Open editor"
							className="transition-colors hover:text-foreground"
							search={(previous) => ({
								activeFile: previous.activeFile,
								editor: "open",
								files: previous.files ?? [],
								panel: "editor",
							})}
							to="."
						>
							<FileTerminal className="size-3" />
						</Link>
					</TooltipTrigger>
					<TooltipContent>Editor</TooltipContent>
				</Tooltip>
			</div>
		</div>
	);
}
