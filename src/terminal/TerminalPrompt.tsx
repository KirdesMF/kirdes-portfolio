import { type SubmitEvent, useId, useRef, useState } from "react";
import { getVisibleFileNames } from "#/editor/editor-files";
import { commandNames, terminalNavigationItems } from "#/terminal/terminal-routes";

function formatPromptCwd(route: string): string {
	if (route === "/terminal") return "~";

	return `~/${route.replace("/terminal/", "")}`;
}

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

function findSuggestion(input: string, suggestions: ReadonlyArray<string>): string | undefined {
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
	const historyRef = useRef<Array<string>>([]);
	const historyIndexRef = useRef<number>(-1);
	const savedValueRef = useRef<string>("");
	const [suggestion, setSuggestion] = useState<string | undefined>();
	const inputId = useId();

	const suggestions = buildCommandSuggestions(currentRoute);

	function handleChange(nextValue: string) {
		setValue(nextValue);
		setSuggestion(findSuggestion(nextValue, suggestions));
		// User is typing — reset history navigation
		if (historyIndexRef.current !== -1) {
			historyIndexRef.current = -1;
			savedValueRef.current = "";
		}
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

		// Push to command history, keep most recent last
		if (historyRef.current.at(-1) !== trimmed) {
			historyRef.current.push(trimmed);
		}
		historyIndexRef.current = -1;

		setValue("");
		setSuggestion(undefined);
	}

	function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === "Tab") {
			event.preventDefault();
			acceptSuggestion();
			return;
		}

		if (event.key === "ArrowUp") {
			event.preventDefault();
			const history = historyRef.current;
			if (history.length === 0) return;

			// Save current value when first navigating
			if (historyIndexRef.current === -1) {
				savedValueRef.current = value;
			}

			const nextIndex = Math.min(historyIndexRef.current + 1, history.length - 1);
			historyIndexRef.current = nextIndex;
			setValue(history[history.length - 1 - nextIndex]);
			setSuggestion(undefined);
			return;
		}

		if (event.key === "ArrowDown") {
			event.preventDefault();
			const history = historyRef.current;
			if (historyIndexRef.current === -1) return;

			const nextIndex = historyIndexRef.current - 1;
			if (nextIndex < 0) {
				// Restore saved value
				historyIndexRef.current = -1;
				setValue(savedValueRef.current);
				savedValueRef.current = "";
			} else {
				historyIndexRef.current = nextIndex;
				setValue(history[history.length - 1 - nextIndex]);
			}
			setSuggestion(undefined);
			return;
		}
	}

	return (
		<form
			className="flex shrink-0 items-center gap-2 border-t border-border px-3 py-1.5 text-sm"
			onSubmit={handleSubmit}
		>
			<label className="flex shrink-0 items-center gap-2 text-xs" htmlFor={inputId}>
				<span className="shrink-0 text-primary">
					{currentRoute ? formatPromptCwd(currentRoute) : "~"}
				</span>
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
