import { type SubmitEvent, useId, useState } from "react";

export interface TerminalEntry {
	id: string;
	type: "input" | "output";
	content: string;
}

export function TerminalPrompt({ onSubmit }: { onSubmit: (command: string) => void }) {
	const [value, setValue] = useState("");
	const inputId = useId();

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const trimmed = value.trim();
		if (!trimmed) return;

		onSubmit(trimmed);
		setValue("");
	}

	return (
		<form
			className="flex shrink-0 items-center gap-2 border-t border-border px-3 py-1.5 text-sm"
			onSubmit={handleSubmit}
		>
			<label className="flex shrink-0 items-center gap-2 text-xs" htmlFor={inputId}>
				<span className="shrink-0 text-primary">~</span>
				<span className="shrink-0 text-muted-foreground">$</span>
			</label>
			<input
				autoComplete="off"
				className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/70 placeholder:text-xs text-xs"
				id={inputId}
				placeholder="type a command..."
				spellCheck={false}
				type="text"
				value={value}
				onChange={(event) => setValue(event.target.value)}
			/>
		</form>
	);
}
