import { Outlet, useRouter, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "#/design-system/cn";
import { AppHeader } from "#/layout/AppHeader";
import { TerminalFooter } from "./TerminalFooter";
import { TerminalPrompt } from "./TerminalPrompt";
import { TerminalRouteList } from "./TerminalRouteList";
import { TerminalSessionHeader } from "./TerminalSessionHeader";
import { parseTerminalCommand } from "./terminal-commands";
import { parseTerminalRoute, parseTerminalRouteTarget, terminalRoutes } from "./terminal-routes";

type TerminalHistoryEntry = {
	id: string;
	input: string;
	output: ReactNode;
};

let nextHistoryEntryId = 0;

function createHistoryEntry(input: string, output: ReactNode): TerminalHistoryEntry {
	return {
		id: String(nextHistoryEntryId++),
		input,
		output,
	};
}

function getHelpOutput(): string {
	return `available routes: ${terminalRoutes.join(" ")} | commands: cd clear help ls whoami`;
}

function getWelcomeOutput(): ReactNode {
	return (
		<div className="flex flex-col gap-0.5">
			<div>Welcome to kirdes terminal.</div>
			<div className="text-muted-foreground">Type help to list available commands.</div>
		</div>
	);
}

function getWhoamiOutput(): ReactNode {
	return (
		<div className="flex flex-col gap-0.5">
			<div>kirdes</div>
			<div className="text-muted-foreground">product engineer / interface builder</div>
		</div>
	);
}

function createInitialHistory(): Array<TerminalHistoryEntry> {
	return [
		createHistoryEntry("welcome", getWelcomeOutput()),
		createHistoryEntry("whoami", getWhoamiOutput()),
	];
}

export function Terminal() {
	const router = useRouter();
	const isHomeRoute = useRouterState({
		select: (state) => state.matches.at(-1)?.routeId === "/terminal",
	});
	const [history, setHistory] = useState<Array<TerminalHistoryEntry>>(createInitialHistory);

	function pushHistory(input: string, output: ReactNode) {
		const entry = createHistoryEntry(input, output);
		setHistory((previous) => [...previous, entry]);
	}

	function handleSubmit(command: string) {
		const route = parseTerminalRoute(command);
		if (route) {
			pushHistory(command, `opening ${command}`);
			void router.navigate({ to: route });
			return;
		}

		const normalizedCommand = command.trim().toLowerCase();
		if (normalizedCommand === "cd" || normalizedCommand.startsWith("cd ")) {
			const target = normalizedCommand.slice(2).trim();
			const targetRoute = parseTerminalRouteTarget(target);
			if (targetRoute) {
				pushHistory(command, `opening ${target || "~"}`);
				void router.navigate({ to: targetRoute });
				return;
			}

			pushHistory(command, `directory not found: ${target}`);
			return;
		}

		const terminalCommand = parseTerminalCommand(command);
		if (terminalCommand === "clear") {
			setHistory([]);
			return;
		}

		if (terminalCommand === "help") {
			pushHistory(command, getHelpOutput());
			return;
		}

		if (terminalCommand === "ls") {
			pushHistory(command, <TerminalRouteList />);
			return;
		}

		if (terminalCommand === "whoami") {
			pushHistory(command, getWhoamiOutput());
			return;
		}

		pushHistory(command, `command not found: ${command}`);
	}

	return (
		<div className="flex h-dvh flex-col">
			<AppHeader />
			<div className="flex min-h-0 flex-1">
				<div
					className={cn(
						"flex min-w-0 flex-col",
						isHomeRoute ? "flex-1" : "w-1/2 border-r border-border",
					)}
				>
					<TerminalSessionHeader />
					<div className="min-h-0 flex-1 overflow-y-auto p-3 text-xs">
						{history.map((entry) => (
							<div className="mb-4 last:mb-0" key={entry.id}>
								<div className="text-muted-foreground">
									<span className="text-primary">$</span> {entry.input}
								</div>
								<div className="mt-1 text-foreground/90">{entry.output}</div>
							</div>
						))}
					</div>
					<div className="shrink-0">
						<div className="px-3 py-1 text-tiny text-muted-foreground/70">
							TIP: type help for commands -- / to navigate
						</div>
						<TerminalPrompt onSubmit={handleSubmit} />
						<TerminalFooter />
					</div>
				</div>
				{isHomeRoute ? null : (
					<aside className="w-1/2 min-w-0 overflow-y-auto p-3 text-xs">
						<Outlet />
					</aside>
				)}
			</div>
		</div>
	);
}
