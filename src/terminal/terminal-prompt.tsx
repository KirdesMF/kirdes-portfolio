import { MoveRight } from "lucide-react";
import { type SubmitEvent, useId, useRef, useState } from "react";
import { getVisibleFileNames } from "#/editor/editor-files";
import { m } from "#/paraglide/messages";
import { commandNames, terminalNavigationItems } from "#/terminal/terminal-routes";

const cdSuggestions = [
	"cd ..",
	...terminalNavigationItems.flatMap(({ command, label }) => {
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
			className="flex shrink-0 flex-col border-t border-border px-3 pb-2 pt-1.5 text-xs"
			onSubmit={handleSubmit}
		>
			<span className="text-primary">~/code/kirdes</span>
			<div className="mt-0.5 flex items-center gap-2">
				<MoveRight className="size-3.5 shrink-0 text-muted-foreground/70" />
				<div className="relative flex flex-1 items-center">
					{suggestion ? (
						<div className="pointer-events-none absolute inset-0 flex items-center text-xs text-muted-foreground/30">
							{suggestion}
						</div>
					) : null}
					<input
						autoComplete="off"
						/* biome-ignore lint/a11y/noAutofocus: intentional for terminal UX */
						autoFocus
						className="relative w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/70 [caret-shape:block]"
						id={inputId}
						placeholder={m.prompt_placeholder()}
						spellCheck={false}
						type="text"
						value={value}
						onChange={(event) => handleChange(event.target.value)}
						onKeyDown={handleKeyDown}
					/>
				</div>
			</div>
		</form>
	);
}
