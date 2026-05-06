import { Link, useSearch } from "@tanstack/react-router";
import { Maximize2, Minus, PanelLeftOpen, PanelRightOpen, X } from "lucide-react";

import { Separator } from "#/design-system/Separator";
import { Tooltip } from "#/design-system/Tooltip";
import { toggleLeftPanelSearch, toggleRightPanelSearch } from "#/editor/editor-search";
import { ThemeToggle } from "#/theme/ThemeToggle";

export function EditorHeader(): React.ReactNode {
	const search = useSearch({ from: "/editor" });
	const isLeftPanelOpen = search.left === "open";
	const isRightPanelOpen = search.right === "open";

	return (
		<header className="flex h-8 items-center justify-between border-b border-border px-2">
			<div className="flex items-center gap-2">
				<div className="group flex items-center gap-1.5">
					<button
						aria-label="Close window"
						className="inline-flex size-3 items-center justify-center rounded-full bg-red-500 text-red-950"
						type="button"
					>
						<X className="size-2 opacity-0 transition-opacity group-hover:opacity-100" />
					</button>
					<button
						aria-label="Minimize window"
						className="inline-flex size-3 items-center justify-center rounded-full bg-yellow-500 text-yellow-950"
						type="button"
					>
						<Minus className="size-2 opacity-0 transition-opacity group-hover:opacity-100" />
					</button>
					<button
						aria-label="Zoom window"
						className="inline-flex size-3 items-center justify-center rounded-full bg-green-500 text-green-950"
						type="button"
					>
						<Maximize2 className="size-1.5 opacity-0 transition-opacity group-hover:opacity-100" />
					</button>
				</div>
				<Tooltip content="Toggle left panel" shortcut={["cmd", "E"]}>
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
				</Tooltip>
			</div>
			<div className="flex items-center gap-1">
				<button
					aria-label="Toggle language between French and English"
					className="inline-flex h-6 items-center rounded-sm px-1.5 font-medium text-[0.65rem] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
					type="button"
				>
					FR | EN
				</button>
				<Separator orientation="vertical" />
				<ThemeToggle />
				<Separator orientation="vertical" />
				<Tooltip content="Toggle right panel" shortcut={["cmd", "shift", "E"]}>
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
				</Tooltip>
			</div>
		</header>
	);
}
