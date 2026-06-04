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
			<DialogContent className="w-[min(92vw,38rem)] space-y-3 p-4">
				<div className="space-y-1 border-b border-border pb-3">
					<DialogTitle>Help</DialogTitle>
					<DialogDescription>
						Available routes and commands. Use{" "}
						<span className="text-foreground">man &lt;command&gt;</span> for details.
					</DialogDescription>
				</div>

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

				<div className="flex items-center justify-center gap-6 border-t border-border pt-3 text-muted-foreground text-xs">
					<span>
						<kbd className="text-primary">ESC</kbd> close
					</span>
					<span>
						<kbd className="text-primary">←</kbd> back
					</span>
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
			<Icon
				className={cn(
					"size-3.5",
					props.icon === "route" && "text-cyan-400",
					props.icon === "command" && "text-primary",
					props.icon === "help" && "text-status-open",
				)}
			/>
			<span className="min-w-0 truncate">
				<span className="text-foreground">{props.label}</span>
				{props.description ? (
					<span className="text-muted-foreground"> — {props.description}</span>
				) : null}
			</span>
		</div>
	);
}
