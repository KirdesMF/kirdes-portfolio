import { Separator } from "@base-ui/react/separator";
import { Link, useSearch } from "@tanstack/react-router";
import { PanelLeftOpen, PanelRightOpen } from "lucide-react";

import { toggleLeftPanelSearch, toggleRightPanelSearch } from "#/editor/editor-search";
import { ThemeToggle } from "#/theme/ThemeToggle";

export function EditorHeader(): React.ReactNode {
	const search = useSearch({ from: "/editor" });
	const isLeftPanelOpen = search.left === "open";
	const isRightPanelOpen = search.right === "open";

	return (
		<header className="flex h-8 items-center justify-between border-b border-border px-2">
			<Link
				aria-label={isLeftPanelOpen ? "Close left panel" : "Open left panel"}
				aria-pressed={isLeftPanelOpen}
				className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring data-[active=true]:text-primary"
				data-active={isLeftPanelOpen}
				from="/editor"
				search={toggleLeftPanelSearch}
			>
				<PanelLeftOpen className="size-3.5" />
			</Link>
			<div className="flex items-center gap-1">
				<ThemeToggle />
				<Separator className="h-4 w-px bg-border" orientation="vertical" />
				<Link
					aria-label={isRightPanelOpen ? "Close right panel" : "Open right panel"}
					aria-pressed={isRightPanelOpen}
					className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring data-[active=true]:text-primary"
					data-active={isRightPanelOpen}
					from="/editor"
					search={toggleRightPanelSearch}
				>
					<PanelRightOpen className="size-3.5" />
				</Link>
			</div>
		</header>
	);
}
