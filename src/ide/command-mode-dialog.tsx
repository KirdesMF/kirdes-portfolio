import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
	CommandDialog,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from "#/design-system/command";
import { commandModeCommands, findCommand, normalizeCommand } from "#/ide/command-mode-commands";
import { useIdeStore } from "#/ide/store";
import { setLocale } from "#/paraglide/runtime";
import { useTheme } from "#/theme/theme-provider";

export function CommandModeDialog() {
	const open = useIdeStore((s) => s.commandModeOpen);
	const setOpen = useIdeStore((s) => s.setCommandModeOpen);
	const setEditorMode = useIdeStore((s) => s.setEditorMode);
	const addCommandHistory = useIdeStore((s) => s.addCommandHistory);
	const { appearance, setAppearance } = useTheme();
	const navigate = useNavigate();
	const [input, setInput] = useState("");
	const [error, setError] = useState("");

	const normalized = normalizeCommand(input);
	const suggestions = useMemo(() => {
		if (!normalized) return [];
		return commandModeCommands.filter((command) =>
			[command.name, ...command.aliases].some((value) => value.includes(normalized)),
		);
	}, [normalized]);

	function handleOpenChange(nextOpen: boolean) {
		setOpen(nextOpen);
		if (nextOpen) {
			setEditorMode("command");
			return;
		}

		setEditorMode("normal");
		setInput("");
		setError("");
	}

	function executeInput(value = input) {
		const commandText = normalizeCommand(value);
		if (!commandText) return;

		const command = findCommand(commandText);
		if (!command) {
			setError("Unknown command");
			return;
		}

		command.execute({ appearance, setAppearance, setLocale, navigate });
		addCommandHistory(commandText);
		setOpen(false);
		setEditorMode("normal");
		setInput("");
		setError("");
	}

	return (
		<CommandDialog
			commandClassName="h-auto"
			description="Run an IDE command."
			open={open}
			title="COMMAND"
			onOpenChange={handleOpenChange}
		>
			<div className="relative flex shrink-0 items-center border-border border-b">
				<span className="px-2 text-primary">:</span>
				<CommandInput
					autoFocus
					className="h-9 border-b-0 px-0 text-xs"
					placeholder="Type a command..."
					value={input}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							executeInput();
						}
					}}
					onValueChange={(value) => {
						setInput(value);
						setError("");
					}}
					onFocus={() => setEditorMode("command")}
				/>
			</div>
			{error ? <p className="px-2 pt-2 text-muted-foreground text-xs">{error}</p> : null}
			{normalized ? (
				<CommandList className="max-h-44 p-0 pt-2">
					<CommandEmpty className="py-4">No commands found.</CommandEmpty>
					{suggestions.map((command) => (
						<CommandItem
							className="rounded-none px-2 text-muted-foreground"
							key={command.name}
							value={command.name}
							onSelect={() => executeInput(command.name)}
						>
							<span className="text-foreground">:{command.name}</span>
							<span className="truncate">{command.description}</span>
						</CommandItem>
					))}
				</CommandList>
			) : null}
		</CommandDialog>
	);
}

export function CommandHistoryDialog() {
	const open = useIdeStore((s) => s.commandHistoryOpen);
	const setOpen = useIdeStore((s) => s.setCommandHistoryOpen);
	const setEditorMode = useIdeStore((s) => s.setEditorMode);
	const history = useIdeStore((s) => s.commandHistory);
	const setCommandModeOpen = useIdeStore((s) => s.setCommandModeOpen);

	function handleOpenChange(nextOpen: boolean) {
		setOpen(nextOpen);
		if (!nextOpen) setEditorMode("normal");
	}

	return (
		<CommandDialog
			commandClassName="h-[min(70dvh,18rem)]"
			description="Previously executed command mode commands."
			open={open}
			title="COMMAND HISTORY"
			onOpenChange={handleOpenChange}
		>
			<CommandList className="min-h-0 flex-1 p-0 pt-2">
				{history.length === 0 ? (
					<p className="py-6 text-center text-muted-foreground">No command history.</p>
				) : null}
				{history.map((command) => (
					<CommandItem
						className="rounded-none px-2 text-muted-foreground"
						key={command}
						value={command}
						onSelect={() => {
							setOpen(false);
							setCommandModeOpen(true);
							setEditorMode("command");
						}}
					>
						<span className="text-primary">:</span>
						<span className="truncate">{command}</span>
					</CommandItem>
				))}
			</CommandList>
		</CommandDialog>
	);
}
