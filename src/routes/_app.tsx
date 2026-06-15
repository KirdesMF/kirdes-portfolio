import { useHotkeys } from "@tanstack/react-hotkeys";
import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { contactInfo } from "#/contact/contact-info";
import { findEditorFileByRoute } from "#/editor/editor-files";
import { AppHeader } from "#/ide/app-header";
import { CommandMenu } from "#/ide/command-menu";
import { CommandHistoryDialog, CommandModeDialog } from "#/ide/command-mode-dialog";
import { ContactsDialog } from "#/ide/contacts-dialog";
import { FindFileDialog } from "#/ide/find-file-dialog";
import { FindTextDialog } from "#/ide/find-text-dialog";
import { HelpDialog } from "#/ide/help-dialog";
import { NeoTree } from "#/ide/neo-tree";
import { RecentFilesDialog } from "#/ide/recent-files-dialog";
import { parseIdeSearch } from "#/ide/search";
import { ShimmerLabel } from "#/ide/shimmer-label";
import { StatusBar } from "#/ide/status-bar";
import { useIdeStore } from "#/ide/store";
import { SettingsDialog } from "#/settings-dialog";

export const Route = createFileRoute("/_app")({
	validateSearch: parseIdeSearch,
	component: IdeShell,
});

function IdeShell() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const currentFile = findEditorFileByRoute(pathname)?.id;
	const settingsOpen = useIdeStore((s) => s.settingsOpen);
	const setSettingsOpen = useIdeStore((s) => s.setSettingsOpen);
	const commandMenuOpen = useIdeStore((s) => s.commandMenuOpen);
	const commandModeOpen = useIdeStore((s) => s.commandModeOpen);
	const commandHistoryOpen = useIdeStore((s) => s.commandHistoryOpen);
	const setCommandModeOpen = useIdeStore((s) => s.setCommandModeOpen);
	const setCommandHistoryOpen = useIdeStore((s) => s.setCommandHistoryOpen);
	const setEditorMode = useIdeStore((s) => s.setEditorMode);
	const findFileOpen = useIdeStore((s) => s.findFileOpen);
	const findTextOpen = useIdeStore((s) => s.findTextOpen);
	const recentFilesOpen = useIdeStore((s) => s.recentFilesOpen);
	const helpOpen = useIdeStore((s) => s.helpOpen);
	const setHelpOpen = useIdeStore((s) => s.setHelpOpen);
	const contactsOpen = useIdeStore((s) => s.contactsOpen);
	const setContactsOpen = useIdeStore((s) => s.setContactsOpen);
	const toggleCommandMenu = useIdeStore((s) => s.toggleCommandMenu);

	const dialogHotkeysBlocked =
		settingsOpen ||
		helpOpen ||
		findFileOpen ||
		findTextOpen ||
		commandModeOpen ||
		commandHistoryOpen ||
		recentFilesOpen ||
		contactsOpen;

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
				hotkey: { key: ":", shift: true },
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
		},
	);

	return (
		<div className="flex h-dvh flex-col">
			<AppHeader />
			<div className="relative flex min-h-0 flex-1">
				<NeoTree />
				<main className="min-w-0 flex-1 overflow-hidden">
					<Outlet />
				</main>
			</div>
			<div className="pointer-events-none fixed right-3 bottom-[calc(var(--spacing-status-bar)+0.25rem)]">
				<a
					href={contactInfo.github.url}
					target="_blank"
					rel="noreferrer"
					className="pointer-events-auto text-tiny text-muted-foreground/70 transition hover:text-foreground"
				>
					<ShimmerLabel>[github]</ShimmerLabel>
				</a>
			</div>
			<StatusBar currentFile={currentFile} />
			<CommandMenu />
			<CommandModeDialog />
			<CommandHistoryDialog />
			<FindFileDialog />
			<FindTextDialog />
			<RecentFilesDialog />
			<SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
			<HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
			<ContactsDialog open={contactsOpen} onOpenChange={setContactsOpen} />
		</div>
	);
}
