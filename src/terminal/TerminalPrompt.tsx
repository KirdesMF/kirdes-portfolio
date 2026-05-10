import { type SubmitEvent, useId, useState } from "react";
import { getVisibleFileNames } from "#/editor/editor-files";
import { commandNames, terminalNavigationItems } from "#/terminal/terminal-routes";

const cdSuggestions = [
	"cd ..",
	...terminalNavigationItems.flatMap(({ command, label }) => {
		if (label === "~") return ["cd ~", "cd /"];

		return [`cd ${label}`, `cd ${command}`];
	}),
];

const editorCommandSuggestions = ["close all", "close editor", "open editor"] as const;

function buildCommandSuggestions(currentRoute?: string): ReadonlyArray<string> {
	const fileNames = getVisibleFileNames(currentRoute);

	const fileCommandSuggestions = fileNames.flatMap((name) => [
		`cat ${name}`,
		`close ${name}`,
		`open ${name}`,
	]);

	return [
		...commandNames,
		...cdSuggestions,
		...fileCommandSuggestions,
		...editorCommandSuggestions,
	] as const;
}

function findSuggestion(
	input: string,
	suggestions: ReadonlyArray<string>,
): string | undefined {
	if (!input) return undefined;
	const lower = input.toLowerCase();
	return suggestions.find((name) => {
		const nameLower = name.toLowerCase();
		return nameLower.startsWith(lower) && nameLower !== lower;
	});
}

export function TerminalPrompt({
	currentRoute,
	onSubmit,
}: {
	currentRoute?: string;
	onSubmit: (command: string) => void;
}) {
	const [value, setValue] = useState("");
	const [suggestion, setSuggestion] = useState<string | undefined>();
	const inputId = useId();

	const suggestions = buildCommandSuggestions(currentRoute);

	function handleChange(nextValue: string) {
		setValue(nextValue);
		setSuggestion(findSuggestion(nextValue, suggestions));
	}

	function acceptSuggestion() {
		if (suggestion) {
			setValue(suggestion);
			setSuggestion(undefined);
		}
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const trimmed = value.trim();
		if (!trimmed) return;

		onSubmit(trimmed);
		setValue("");
		setSuggestion(undefined);
	}

	function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === "Tab") {
			event.preventDefault();
			acceptSuggestion();
		}
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
			<div className="relative flex-1 flex items-center">
				{suggestion ? (
					<div className="pointer-events-none absolute inset-0 flex items-center text-xs text-muted-foreground/30">
						{suggestion}
					</div>
				) : null}
				<input
					autoComplete="off"
					autoFocus
					className="relative w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/70"
					id={inputId}
					placeholder="type a command..."
					spellCheck={false}
					type="text"
					value={value}
					onChange={(event) => handleChange(event.target.value)}
					onKeyDown={handleKeyDown}
				/>
			</div>
		</form>
	);
}
