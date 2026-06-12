import { useHotkeys } from "@tanstack/react-hotkeys";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppHeader } from "#/ide/app-header";
import { CommandMenu } from "#/ide/command-menu";
import { CommandHistoryDialog, CommandModeDialog } from "#/ide/command-mode-dialog";
import { FindFileDialog } from "#/ide/find-file-dialog";
import { FindTextDialog } from "#/ide/find-text-dialog";
import { HelpDialog } from "#/ide/help-dialog";
import { NeoTree } from "#/ide/neo-tree";
import { RecentFilesDialog } from "#/ide/recent-files-dialog";
import { parseIdeSearch } from "#/ide/search";
import { StatusBar } from "#/ide/status-bar";
import { useIdeStore } from "#/ide/store";
import { SettingsDialog } from "#/settings-dialog";

export const Route = createFileRoute("/_ide")({
	validateSearch: parseIdeSearch,
	component: IdeShell,
});

function IdeShell() {
	const { neotree, file } = Route.useSearch();
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
	const toggleCommandMenu = useIdeStore((s) => s.toggleCommandMenu);
	const dialogHotkeysBlocked =
		settingsOpen ||
		helpOpen ||
		findFileOpen ||
		findTextOpen ||
		commandModeOpen ||
		commandHistoryOpen ||
		recentFilesOpen;

	useHotkeys(
		[
			{
				hotkey: "Space",
				callback: () => {
					if (!commandMenuOpen) toggleCommandMenu();
				},
			},
			{
				hotkey: "H",
				callback: () => {
					if (!commandMenuOpen) setHelpOpen(true);
				},
			},
		],
		{
			enabled: !dialogHotkeysBlocked,
			ignoreInputs: true,
		},
	);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			const target = event.target;
			const isEditable =
				target instanceof HTMLElement &&
				(target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

			if (event.key !== ":" || isEditable || dialogHotkeysBlocked) {
				return;
			}

			event.preventDefault();
			if (commandMenuOpen) {
				setCommandHistoryOpen(true);
				return;
			}

			setCommandModeOpen(true);
			setEditorMode("command");
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [
		commandMenuOpen,
		dialogHotkeysBlocked,
		setCommandHistoryOpen,
		setCommandModeOpen,
		setEditorMode,
	]);

	return (
		<div className="flex h-dvh flex-col">
			<AppHeader />
			<div className="flex min-h-0 flex-1">
				{neotree === "open" ? <NeoTree /> : null}
				<main className="min-w-0 flex-1 overflow-hidden">
					<Outlet />
				</main>
			</div>
			<StatusBar currentFile={file} />
			<CommandMenu />
			<CommandModeDialog />
			<CommandHistoryDialog />
			<FindFileDialog />
			<FindTextDialog />
			<RecentFilesDialog />
			<SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
			<HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
		</div>
	);
}
