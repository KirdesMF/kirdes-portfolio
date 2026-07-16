import { type RegisterableHotkey, useHotkeys } from "@tanstack/react-hotkeys";
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { SpaceIcon } from "#/icons/space-icon";
import { CommandMenu } from "#/ide/command-menu";
import { CommandHistoryDialog, CommandModeDialog } from "#/ide/command-mode-dialog";
import { ContactDialog } from "#/ide/contact-dialog";
import { HelpDialog } from "#/ide/help-dialog";
import { parseIdeSearch } from "#/ide/search";
import { StatusBar } from "#/ide/status-bar";
import { StatusBox } from "#/ide/status-box";
import { getCurrentWeather } from "#/ide/status-box.functions";
import { useIdeStore } from "#/ide/store";
import { SettingsDialog } from "#/settings-dialog";

export const Route = createFileRoute("/_app")({
	validateSearch: parseIdeSearch,
	loader: () => getCurrentWeather(),
	staleTime: 5 * 60 * 1000,
	component: IdeShell,
});

function IdeShell() {
	const weather = Route.useLoaderData();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const search = useRouterState({ select: (s) => s.location.search }) as {
		contact?: "open";
	};
	const navigate = useNavigate();
	const pageTitle =
		pathname === "/home"
			? "[h] home"
			: pathname === "/about"
				? "[a] about"
				: pathname.startsWith("/works")
					? "[w] works"
					: pathname.startsWith("/lab")
						? "[l] lab"
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
	const statusOpen = useIdeStore((s) => s.statusOpen);
	const setStatusOpen = useIdeStore((s) => s.setStatusOpen);
	const toggleStatus = useIdeStore((s) => s.toggleStatus);
	const toggleCommandMenu = useIdeStore((s) => s.toggleCommandMenu);

	function openHome() {
		void navigate({
			to: "/home",
			search: (prev) => prev,
		});
	}

	function openAbout() {
		void navigate({ to: "/about", search: {} });
	}

	function openLab() {
		void navigate({ to: "/lab", search: {} });
	}

	function openWorks() {
		void navigate({ to: "/works", search: {} });
	}

	const contactOpen = search.contact === "open";
	const dialogHotkeysBlocked =
		contactOpen || settingsOpen || helpOpen || commandModeOpen || commandHistoryOpen;

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
				hotkey: "I",
				callback: () => {
					if (!commandMenuOpen) toggleStatus();
				},
			},
			{
				hotkey: "H",
				callback: () => {
					if (!commandMenuOpen) openHome();
				},
			},
			{
				hotkey: "A",
				callback: () => {
					if (!commandMenuOpen) openAbout();
				},
			},
			{
				hotkey: "L",
				callback: () => {
					if (!commandMenuOpen) openLab();
				},
			},
			{
				hotkey: "W",
				callback: () => {
					if (!commandMenuOpen) openWorks();
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
		<div className="grid h-dvh grid-rows-[var(--spacing-status-bar)_minmax(0,1fr)] px-3 pb-3">
			<header className="grid min-h-0 grid-cols-[1fr_auto_1fr] items-center bg-background text-tiny leading-none text-muted-foreground">
				<nav className="col-start-2 flex h-full items-center gap-1">
					<Link
						className="flex h-full items-center px-2 hover:bg-status-primary hover:text-status-primary-foreground focus:bg-status-primary focus:text-status-primary-foreground focus:outline-none"
						to="/home"
					>
						[h] home
					</Link>
					<Link
						className="flex h-full items-center px-2 hover:bg-status-primary hover:text-status-primary-foreground focus:bg-status-primary focus:text-status-primary-foreground focus:outline-none"
						search={{}}
						to="/about"
					>
						[a] about
					</Link>
					<Link
						className="flex h-full items-center px-2 hover:bg-status-primary hover:text-status-primary-foreground focus:bg-status-primary focus:text-status-primary-foreground focus:outline-none"
						search={{}}
						to="/works"
					>
						[w] works
					</Link>
					<Link
						className="flex h-full items-center px-2 hover:bg-status-primary hover:text-status-primary-foreground focus:bg-status-primary focus:text-status-primary-foreground focus:outline-none"
						search={{}}
						to="/lab"
					>
						[l] lab
					</Link>
				</nav>
				<div className="col-start-3 flex h-full items-center justify-end gap-2">
					<button
						className="flex h-full cursor-pointer items-center px-2.5 text-status-muted-foreground transition hover:bg-status-primary hover:text-status-primary-foreground focus:bg-status-primary focus:text-status-primary-foreground focus:outline-none"
						type="button"
						onClick={toggleCommandMenu}
					>
						[<SpaceIcon className="inline size-3" />] menu
					</button>
					<StatusBox open={statusOpen} weather={weather} onOpenChange={setStatusOpen} />
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
			<ContactDialog />
		</div>
	);
}
