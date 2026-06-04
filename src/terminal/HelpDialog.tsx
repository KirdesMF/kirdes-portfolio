import { ChevronRightIcon, CircleHelpIcon, FolderIcon, TerminalIcon } from "lucide-react";
import { cn } from "#/design-system/cn";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "#/design-system/dialog";
import { getCommandSummary, routeDescriptions } from "#/terminal/terminal-command-docs";
import { terminalCommands } from "#/terminal/terminal-commands";
import { terminalRoutes } from "#/terminal/terminal-routes";

type HelpDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

function getShortcut(value: string, used: Set<string>): string {
	for (const character of value.replace(/^\//, "")) {
		if (!/[a-z0-9]/i.test(character)) continue;
		const shortcut = character.toLowerCase();
		if (used.has(shortcut)) continue;
		used.add(shortcut);
		return shortcut;
	}

	return "•";
}

export function HelpDialog(props: HelpDialogProps) {
	const usedShortcuts = new Set<string>();

	return (
		<Dialog open={props.open} onOpenChange={props.onOpenChange}>
			<DialogContent className="max-h-none w-[min(92vw,38rem)] overflow-visible border-0 bg-transparent p-0 shadow-none">
				<div className="relative flex max-h-[min(90dvh,42rem)] flex-col rounded border-2 border-border bg-popover p-4 pt-5 text-popover-foreground shadow-lg">
					<DialogTitle className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-popover px-2 leading-none text-primary">
						Help
					</DialogTitle>
					<DialogDescription className="shrink-0 border-b border-border pb-3">
						Available routes and commands. Use{" "}
						<span className="text-foreground">man &lt;command&gt;</span> for details.
					</DialogDescription>

					<div className="min-h-0 flex-1 overflow-y-auto py-3">
						<div className="space-y-1 font-mono text-sm">
							{terminalRoutes.map((route) => (
								<HelpRow
									description={routeDescriptions[route]?.split(" — ")[1] ?? ""}
									icon="route"
									key={route}
									label={route}
									shortcut={getShortcut(route, usedShortcuts)}
								/>
							))}
							{terminalCommands.map((command) => (
								<HelpRow
									description={getCommandSummary(command) ?? ""}
									icon={command === "help" ? "help" : "command"}
									key={command}
									label={command}
									shortcut={getShortcut(command, usedShortcuts)}
								/>
							))}
						</div>
					</div>

					<div className="flex shrink-0 items-center justify-center gap-6 border-t border-border pt-3 text-muted-foreground text-xs">
						<span>
							<kbd className="text-primary">ESC</kbd> close
						</span>
						<span>
							<kbd className="text-primary">←</kbd> back
						</span>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function HelpRow(props: {
	description: string;
	icon: "command" | "help" | "route";
	label: string;
	shortcut: string;
}) {
	const Icon =
		props.icon === "route" ? FolderIcon : props.icon === "help" ? CircleHelpIcon : TerminalIcon;

	return (
		<div className="grid grid-cols-[1.5rem_1rem_1rem_minmax(0,1fr)] items-center gap-2 rounded px-1 py-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
			<span className="text-right font-medium text-primary">{props.shortcut}</span>
			<ChevronRightIcon className="size-3.5 text-muted-foreground/70" />
			<Icon className={cn("size-3.5 text-primary")} />
			<span className="min-w-0 truncate">
				<span className="text-foreground">{props.label}</span>
				{props.description ? (
					<span className="text-muted-foreground"> — {props.description}</span>
				) : null}
			</span>
		</div>
	);
}
