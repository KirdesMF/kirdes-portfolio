import { useHotkeys, type RegisterableHotkey } from "@tanstack/react-hotkeys";
import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { SpaceIcon } from "#/icons/space-icon";
import { AboutWindow } from "#/ide/about-window";
import { CommandMenu } from "#/ide/command-menu";
import { CommandHistoryDialog, CommandModeDialog } from "#/ide/command-mode-dialog";
import { HelpDialog } from "#/ide/help-dialog";
import { parseIdeSearch } from "#/ide/search";
import { StatusBar } from "#/ide/status-bar";
import { useIdeStore } from "#/ide/store";
import { SettingsDialog } from "#/settings-dialog";

export const Route = createFileRoute("/_app")({
	validateSearch: parseIdeSearch,
	component: IdeShell,
});

function IdeShell() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const navigate = useNavigate();
	const pageTitle =
		pathname === "/home"
			? "[h] home"
			: pathname.startsWith("/works")
				? "[w] works"
				: pathname.startsWith("/lab")
					? "lab"
					: undefined;
	const settingsOpen = useIdeStore((s) => s.settingsOpen);
	const setSettingsOpen = useIdeStore((s) => s.setSettingsOpen);
	const commandMenuOpen = useIdeStore((s) => s.commandMenuOpen);
	const commandModeOpen = useIdeStore((s) => s.commandModeOpen);
	const commandHistoryOpen = useIdeStore((s) => s.commandHistoryOpen);
	const setCommandModeOpen = useIdeStore((s) => s.setCommandModeOpen);
	const setCommandHistoryOpen = useIdeStore((s) => s.setCommandHistoryOpen);
	const setEditorMode = useIdeStore((s) => s.setEditorMode);
	const helpOpen = useIdeStore((s) => s.helpOpen);
	const setHelpOpen = useIdeStore((s) => s.setHelpOpen);
	const toggleCommandMenu = useIdeStore((s) => s.toggleCommandMenu);

	function openHome() {
		void navigate({
			to: "/home",
			search: (prev) => prev,
		});
	}

	const dialogHotkeysBlocked = settingsOpen || helpOpen || commandModeOpen || commandHistoryOpen;

	useHotkeys(
		[
			{
				hotkey: "Space",
				callback: () => {
					if (!commandMenuOpen) toggleCommandMenu();
				},
			},
			{
				hotkey: { key: "?", shift: true },
				callback: () => {
					if (!commandMenuOpen) setHelpOpen(true);
				},
			},
			{
				hotkey: "S",
				callback: () => {
					if (!commandMenuOpen) setSettingsOpen(true);
				},
			},
			{
				hotkey: "H",
				callback: () => {
					if (!commandMenuOpen) openHome();
				},
			},
			{
				hotkey: ":" as RegisterableHotkey,
				callback: () => {
					if (commandMenuOpen) {
						setCommandHistoryOpen(true);
						return;
					}

					setCommandModeOpen(true);
					setEditorMode("command");
				},
			},
		],
		{
			enabled: !dialogHotkeysBlocked,
			ignoreInputs: true,
			preventDefault: true,
		},
	);

	return (
		<div className="grid h-dvh grid-rows-[auto_minmax(0,1fr)] px-3 pb-3">
			<header className="flex h-status-bar shrink-0 items-center justify-end bg-background text-tiny text-muted-foreground">
				<div className="flex items-center gap-2 p-2">
					<button
						className="flex cursor-pointer items-center px-2.5 py-0.5 text-status-muted-foreground transition hover:bg-status-primary hover:text-status-primary-foreground focus:bg-status-primary focus:text-status-primary-foreground focus:outline-none"
						type="button"
						onClick={toggleCommandMenu}
					>
						[<SpaceIcon className="inline size-3" />] menu
					</button>
				</div>
			</header>
			<div className="relative grid min-h-0 grid-cols-1">
				<main className="relative min-h-0 min-w-0">
					<div className="flex size-full flex-col overflow-hidden border-thin border-border">
						<div className="min-w-0 flex-1 overflow-hidden">
							<Outlet />
						</div>
						<StatusBar />
					</div>
					{pageTitle && (
						<div className="pointer-events-none absolute top-0 left-2 z-raised -translate-y-1/2 bg-background px-2 text-primary text-tiny">
							{pageTitle}
						</div>
					)}
				</main>
			</div>
			<CommandMenu />
			<CommandModeDialog />
			<CommandHistoryDialog />
			<SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
			<HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
			<AboutWindow />
		</div>
	);
}
