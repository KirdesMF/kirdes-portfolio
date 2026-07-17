import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
	commandModeCommands,
	findCommand,
	normalizeCommand,
} from "#/components/command-mode-dialog/command-mode-commands";
import {
	CommandDialog,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from "#/design-system/command";
import { setLocale } from "#/paraglide/runtime";
import { useAppStore } from "#/store";
import { useTheme } from "#/theme/use-theme";

export function CommandModeDialog() {
	const open = useAppStore((s) => s.commandModeOpen);
	const setOpen = useAppStore((s) => s.setCommandModeOpen);
	const setShellMode = useAppStore((s) => s.setShellMode);
	const addCommandHistory = useAppStore((s) => s.addCommandHistory);
	const { appearance, setAppearance } = useTheme();
	const navigate = useNavigate();
	const [input, setInput] = useState("");
	const [error, setError] = useState("");

	const normalized = normalizeCommand(input);
	const suggestions = useMemo(() => {
		if (!normalized) return commandModeCommands;
		return commandModeCommands.filter((command) =>
			[command.name, ...command.aliases].some((value) => value.includes(normalized)),
		);
	}, [normalized]);

	function handleOpenChange(nextOpen: boolean) {
		setOpen(nextOpen);
		if (nextOpen) {
			setShellMode("command");
			return;
		}

		setShellMode("normal");
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
		setShellMode("normal");
		setInput("");
		setError("");
	}

	return (
		<CommandDialog
			commandClassName="h-auto"
			contentClassName="w-[min(92vw,42rem)]"
			description="Run a command."
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
						if (event.key === "Enter" && suggestions.length === 0) {
							event.preventDefault();
							executeInput();
						}
					}}
					onValueChange={(value) => {
						setInput(value);
						setError("");
					}}
					onFocus={() => setShellMode("command")}
				/>
			</div>
			{error ? <p className="px-2 pt-2 text-muted-foreground text-xs">{error}</p> : null}
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
		</CommandDialog>
	);
}

export function CommandHistoryDialog() {
	const open = useAppStore((s) => s.commandHistoryOpen);
	const setOpen = useAppStore((s) => s.setCommandHistoryOpen);
	const setShellMode = useAppStore((s) => s.setShellMode);
	const history = useAppStore((s) => s.commandHistory);
	const addCommandHistory = useAppStore((s) => s.addCommandHistory);
	const { appearance, setAppearance } = useTheme();
	const navigate = useNavigate();

	function handleOpenChange(nextOpen: boolean) {
		setOpen(nextOpen);
		if (!nextOpen) setShellMode("normal");
	}

	function executeHistoryCommand(commandText: string) {
		const command = findCommand(commandText);
		if (!command) return;

		command.execute({ appearance, setAppearance, setLocale, navigate });
		addCommandHistory(commandText);
		setOpen(false);
		setShellMode("normal");
	}

	return (
		<CommandDialog
			commandClassName="h-[min(70dvh,18rem)]"
			contentClassName="w-[min(92vw,42rem)]"
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
						onSelect={() => executeHistoryCommand(command)}
					>
						<span className="text-primary">:</span>
						<span className="truncate">{command}</span>
					</CommandItem>
				))}
			</CommandList>
		</CommandDialog>
	);
}
