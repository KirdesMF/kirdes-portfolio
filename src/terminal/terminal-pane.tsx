import { useEffect, useRef } from "react";
import { cn } from "#/design-system/cn";
import { TerminalFooter } from "./terminal-footer";
import type { TerminalHistoryEntry } from "./terminal-history";
import { TerminalPrompt } from "./terminal-prompt";
import { TerminalSessionHeader } from "./terminal-session-header";

export function TerminalPane({
	className,
	currentRoute,
	history,
	onSubmit,
}: {
	className?: string;
	currentRoute?: string;
	history: Array<TerminalHistoryEntry>;
	onSubmit: (command: string) => void;
}) {
	const scrollRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom when new output is added
	// biome-ignore lint/correctness/useExhaustiveDependencies: history.length triggers scroll on new entries
	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollTop = el.scrollHeight;
	}, [history.length]);

	return (
		<div className={cn("flex min-h-0 flex-1 flex-col", className)}>
			<TerminalSessionHeader />
			<div className="min-h-0 flex-1 overflow-y-auto p-3 text-xs" ref={scrollRef}>
				<div className="flex flex-col gap-8">
					{history.map((entry) => (
						<div className="flex flex-col gap-1" key={entry.id}>
							<div className="text-muted-foreground">
								<span className="text-primary">$</span> {entry.input}
							</div>
							<div className="text-foreground/90">{entry.output}</div>
						</div>
					))}
				</div>
			</div>
			<div className="shrink-0">
				<TerminalPrompt currentRoute={currentRoute} onSubmit={onSubmit} />
				<TerminalFooter />
			</div>
		</div>
	);
}
