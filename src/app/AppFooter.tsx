import { Separator } from "@base-ui/react/separator";
import { Sparkles, Terminal } from "lucide-react";

export function AppFooter(): React.ReactNode {
	return (
		<footer className="flex h-8 items-center gap-1 border-t border-border px-2">
			<button
				aria-label="Open AI agent panel"
				className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
				type="button"
			>
				<Sparkles className="size-3.5" />
			</button>
			<Separator className="h-4 w-px bg-border" orientation="vertical" />
			<button
				aria-label="Open terminal panel"
				className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
				type="button"
			>
				<Terminal className="size-3.5" />
			</button>
		</footer>
	);
}
