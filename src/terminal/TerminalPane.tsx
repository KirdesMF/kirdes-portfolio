import { useEffect, useRef } from "react";
import { cn } from "#/design-system/cn";
import { TerminalFooter } from "./TerminalFooter";
import { TerminalPrompt } from "./TerminalPrompt";
import { TerminalSessionHeader } from "./TerminalSessionHeader";
import type { TerminalHistoryEntry } from "./terminal-history";

export function TerminalPane({
	className,
	currentRoute,
	hasRightPanel,
	history,
	onSubmit,
}: {
	className?: string;
	currentRoute?: string;
	hasRightPanel: boolean;
	history: Array<TerminalHistoryEntry>;
	onSubmit: (command: string) => void;
}) {
	const scrollRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom when new output is added
	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollTop = el.scrollHeight;
	}, [history.length]);

	return (
		<div
			className={cn(
				"min-w-0 flex-1 flex-col",
				hasRightPanel ? "md:flex-none md:w-1/2 md:border-r md:border-border" : "md:flex-1",
				className,
			)}
		>
			<TerminalSessionHeader />
			<div className="min-h-0 flex-1 overflow-y-auto p-3 text-xs" ref={scrollRef}>
				{history.map((entry) => (
					<div className="mb-4 last:mb-0" key={entry.id}>
						<div className="text-muted-foreground">
							<span className="text-primary">$</span> {entry.input}
						</div>
						<div className="mt-1 text-foreground/90">{entry.output}</div>
					</div>
				))}
			</div>
			<div className="shrink-0">
				<div className="px-3 py-1 text-tiny text-muted-foreground/70">
					TIP: type help for commands -- / to navigate
				</div>
				<TerminalPrompt currentRoute={currentRoute} onSubmit={onSubmit} />
				<TerminalFooter />
			</div>
		</div>
	);
}
