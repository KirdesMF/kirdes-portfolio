import { Link, useSearch } from "@tanstack/react-router";
import { Sparkles, Terminal } from "lucide-react";

import { Separator } from "#/design-system/Separator";
import { toggleTerminalSearch } from "#/editor/editor-search";

export function EditorFooter(): React.ReactNode {
	const search = useSearch({ from: "/editor" });
	const isTerminalOpen = search.terminal === "open";

	return (
		<footer className="flex h-8 items-center gap-1 border-t border-border px-2">
			<button
				aria-label="Open AI agent panel"
				className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
				type="button"
			>
				<Sparkles className="size-3.5" />
			</button>
			<Separator orientation="vertical" />
			<Link
				aria-label={isTerminalOpen ? "Close terminal panel" : "Open terminal panel"}
				aria-pressed={isTerminalOpen}
				className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring data-[active=true]:text-primary"
				data-active={isTerminalOpen}
				from="/editor"
				search={toggleTerminalSearch}
			>
				<Terminal className="size-3.5" />
			</Link>
		</footer>
	);
}
