import { Outlet, useRouter, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "#/design-system/cn";
import { ReadOnlyFileEditor } from "#/editor/ReadOnlyFileEditor";
import { AppHeader } from "#/layout/AppHeader";
import { TerminalFooter } from "./TerminalFooter";
import { TerminalPrompt } from "./TerminalPrompt";
import { TerminalRouteList } from "./TerminalRouteList";
import { TerminalSessionHeader } from "./TerminalSessionHeader";
import { parseTerminalCommand } from "./terminal-commands";
import { findTerminalFile } from "./terminal-files";
import type { TerminalPanelName } from "./terminal-panel-types";
import {
	getTerminalRoutePath,
	parseTerminalRoute,
	parseTerminalRouteTarget,
	terminalRoutes,
} from "./terminal-routes";

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
	return `available routes: ${terminalRoutes.join(" ")} | commands: cat cd clear close help ls open reload whoami`;
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

function getMobilePanel(
	activePanel: TerminalPanelName,
	hasOpenFile: boolean,
	isHomeRoute: boolean,
) {
	if (activePanel === "editor" && hasOpenFile) return "editor";
	if (activePanel === "route" && !isHomeRoute) return "route";

	return "terminal";
}

function TerminalPane({
	className,
	hasRightPanel,
	history,
	onSubmit,
}: {
	className?: string;
	hasRightPanel: boolean;
	history: Array<TerminalHistoryEntry>;
	onSubmit: (command: string) => void;
}) {
	return (
		<div
			className={cn(
				"min-w-0 flex-1 flex-col",
				hasRightPanel ? "md:flex-none md:w-1/2 md:border-r md:border-border" : "md:flex-1",
				className,
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
				<TerminalPrompt onSubmit={onSubmit} />
				<TerminalFooter />
			</div>
		</div>
	);
}

function TerminalMobilePanels({
	activePanel,
	fileName,
	hasOpenFile,
	isHomeRoute,
	onSelectPanel,
}: {
	activePanel: TerminalPanelName;
	fileName?: string;
	hasOpenFile: boolean;
	isHomeRoute: boolean;
	onSelectPanel: (panel: TerminalPanelName) => void;
}) {
	const panel = getMobilePanel(activePanel, hasOpenFile, isHomeRoute);

	return (
		<div className="flex shrink-0 items-center gap-1 border-b border-border px-2 py-1 md:hidden">
			<button
				className={cn(
					"rounded border border-transparent px-2 py-1 text-tiny text-muted-foreground",
					panel === "terminal" && "border-primary/40 bg-primary/10 text-primary",
				)}
				type="button"
				onClick={() => onSelectPanel("terminal")}
			>
				terminal
			</button>
			{isHomeRoute ? null : (
				<button
					className={cn(
						"rounded border border-transparent px-2 py-1 text-tiny text-muted-foreground",
						panel === "route" && "border-primary/40 bg-primary/10 text-primary",
					)}
					type="button"
					onClick={() => onSelectPanel("route")}
				>
					route
				</button>
			)}
			{hasOpenFile ? (
				<button
					className={cn(
						"max-w-36 truncate rounded border border-transparent px-2 py-1 text-tiny text-muted-foreground",
						panel === "editor" && "border-primary/40 bg-primary/10 text-primary",
					)}
					type="button"
					onClick={() => onSelectPanel("editor")}
				>
					{fileName}
				</button>
			) : null}
		</div>
	);
}

function RoutePanel({ className, hasOpenFile }: { className?: string; hasOpenFile: boolean }) {
	return (
		<div
			className={cn(
				"min-h-0 w-full flex-1 overflow-y-auto p-3",
				hasOpenFile && "md:border-b md:border-border",
				className,
			)}
		>
			<Outlet />
		</div>
	);
}

function EditorPanel({
	className,
	fileName,
	onClose,
}: {
	className?: string;
	fileName: string;
	onClose: () => void;
}) {
	return (
		<div className={cn("min-h-0 w-full flex-1 overflow-hidden", className)}>
			<ReadOnlyFileEditor fileName={fileName} onClose={onClose} />
		</div>
	);
}

export function Terminal({
	activePanel,
	fileName,
}: {
	activePanel: TerminalPanelName;
	fileName?: string;
}) {
	const router = useRouter();
	const currentTerminalRoute = useRouterState({
		select: (state) => getTerminalRoutePath(state.location.pathname),
	});
	const isHomeRoute = useRouterState({
		select: (state) => state.matches.at(-1)?.routeId === "/terminal",
	});
	const hasOpenFile = typeof fileName === "string";
	const hasRightPanel = !isHomeRoute || hasOpenFile;
	const mobilePanel = getMobilePanel(activePanel, hasOpenFile, isHomeRoute);
	const [history, setHistory] = useState<Array<TerminalHistoryEntry>>(createInitialHistory);

	function pushHistory(input: string, output: ReactNode) {
		const entry = createHistoryEntry(input, output);
		setHistory((previous) => [...previous, entry]);
	}

	function navigateSearch(nextSearch: { file?: string; panel: TerminalPanelName }) {
		return {
			file: nextSearch.file,
			panel: nextSearch.panel,
		};
	}

	function setMobilePanel(panel: TerminalPanelName) {
		void router.navigate({
			search: (previous) => navigateSearch({ file: previous.file, panel }),
			to: currentTerminalRoute,
		});
	}

	function closeFile() {
		void router.navigate({
			search: { file: undefined, panel: isHomeRoute ? "terminal" : "route" },
			to: currentTerminalRoute,
		});
	}

	function openFile(name: string): boolean {
		const file = findTerminalFile(name);
		if (file === null) return false;

		void router.navigate({
			search: { file: file.name, panel: "editor" },
			to: currentTerminalRoute,
		});
		return true;
	}

	function handleSubmit(command: string) {
		const route = parseTerminalRoute(command);
		if (route) {
			pushHistory(command, `opening ${command}`);
			void router.navigate({
				search: (previous) => navigateSearch({ file: previous.file, panel: "route" }),
				to: route,
			});
			return;
		}

		const normalizedCommand = command.trim().toLowerCase();
		if (normalizedCommand === "cd" || normalizedCommand.startsWith("cd ")) {
			const target = normalizedCommand.slice(2).trim();
			const targetRoute = parseTerminalRouteTarget(target);
			if (targetRoute) {
				pushHistory(command, `opening ${target || "~"}`);
				void router.navigate({
					search: (previous) => navigateSearch({ file: previous.file, panel: "route" }),
					to: targetRoute,
				});
				return;
			}

			pushHistory(command, `directory not found: ${target}`);
			return;
		}

		if (normalizedCommand.startsWith("cat ")) {
			const target = normalizedCommand.slice(3).trim();
			const file = findTerminalFile(target);
			if (file) {
				pushHistory(command, file.content);
				return;
			}

			pushHistory(command, `file not found: ${target}`);
			return;
		}

		if (normalizedCommand.startsWith("open ")) {
			const target = normalizedCommand.slice(4).trim();
			if (openFile(target)) {
				pushHistory(command, `opening ${target}`);
				return;
			}

			pushHistory(command, `file not found: ${target}`);
			return;
		}

		const terminalCommand = parseTerminalCommand(command);
		if (terminalCommand === "clear") {
			setHistory([]);
			return;
		}

		if (terminalCommand === "close") {
			closeFile();
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

		if (terminalCommand === "reload") {
			void router.navigate({ to: "/" });
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
			<TerminalMobilePanels
				activePanel={activePanel}
				fileName={fileName}
				hasOpenFile={hasOpenFile}
				isHomeRoute={isHomeRoute}
				onSelectPanel={setMobilePanel}
			/>
			<div className="flex min-h-0 flex-1">
				<TerminalPane
					className={cn(mobilePanel === "terminal" ? "flex" : "hidden", "md:flex")}
					hasRightPanel={hasRightPanel}
					history={history}
					onSubmit={handleSubmit}
				/>
				{hasRightPanel ? (
					<aside
						className={cn(
							"min-w-0 flex-1 overflow-hidden text-xs md:grid md:w-1/2 md:flex-none",
							mobilePanel === "terminal" ? "hidden md:grid" : "grid",
							hasOpenFile && !isHomeRoute ? "md:grid-rows-2" : "md:grid-rows-1",
						)}
					>
						{isHomeRoute ? null : (
							<RoutePanel
								className={cn(mobilePanel === "route" ? "block" : "hidden", "md:block")}
								hasOpenFile={hasOpenFile}
							/>
						)}
						{hasOpenFile ? (
							<EditorPanel
								className={cn(mobilePanel === "editor" ? "block" : "hidden", "md:block")}
								fileName={fileName ?? ""}
								onClose={closeFile}
							/>
						) : null}
					</aside>
				) : null}
			</div>
		</div>
	);
}
