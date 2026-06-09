import { GitBranch, MoveRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "#/design-system/cn";
import type { TerminalHistoryEntry } from "./terminal-history";

const BRANCH_NAME = "feat/portfolio";

export function TerminalPane({
	className,
	history,
	onSubmit,
}: {
	className?: string;
	history: Array<TerminalHistoryEntry>;
	onSubmit: (command: string) => void;
}) {
	const [input, setInput] = useState("");
	const scrollRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom when new output is added
	// biome-ignore lint/correctness/useExhaustiveDependencies: history.length triggers scroll on new entries
	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollTop = el.scrollHeight;
	}, [history.length]);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = input.trim();
		if (!trimmed) return;
		onSubmit(trimmed);
		setInput("");
	}

	return (
		<div className={cn("flex min-h-0 flex-1 flex-col", className)}>
			<div className="min-h-0 flex-1 overflow-y-auto p-3 pb-0 text-xs" ref={scrollRef}>
				<div className="flex flex-col gap-4">
					{history.map((entry) => (
						<div className="flex flex-col gap-1" key={entry.id}>
							<div className="text-muted-foreground">
								<span className="text-primary">~/code</span>
								<span> on </span>
								<GitBranch className="mr-0.5 inline-block size-3 align-middle text-muted-foreground/70" />
								<span className="text-foreground">{BRANCH_NAME}</span>
							</div>
							<div className="flex items-center gap-2 text-muted-foreground">
								<MoveRight className="size-3.5 shrink-0" />
								<span className="text-foreground">{entry.input}</span>
							</div>
							<div className="text-foreground/90">{entry.output}</div>
						</div>
					))}
					{/* Prompt — follows the last history entry */}
					<form className="flex flex-col gap-1" onSubmit={handleSubmit}>
						<div className="text-muted-foreground">
							<span className="text-primary">~/code</span>
							<span> on </span>
							<GitBranch className="mr-0.5 inline-block size-3 align-middle text-muted-foreground/70" />
							<span className="text-foreground">{BRANCH_NAME}</span>
						</div>
						<div className="flex items-center gap-2">
							<MoveRight className="size-3.5 shrink-0 text-muted-foreground/70" />
							<input
								aria-label="Terminal input"
								autoComplete="off"
								/* biome-ignore lint/a11y/noAutofocus: intentional for terminal UX */
								autoFocus
								className="w-full bg-transparent text-xs text-foreground outline-none [caret-shape:block]"
								spellCheck={false}
								type="text"
								value={input}
								onChange={(e) => setInput(e.target.value)}
							/>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
