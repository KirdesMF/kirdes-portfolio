import { useHotkeys } from "@tanstack/react-hotkeys";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CommandMenu } from "#/ide/command-menu";
import { AppHeader } from "#/ide/app-header";
import { NeoTree } from "#/ide/neo-tree";
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
	const toggleCommandMenu = useIdeStore((s) => s.toggleCommandMenu);

	useHotkeys(
		[
			{
				hotkey: "Space",
				callback: () => {
					if (!commandMenuOpen) toggleCommandMenu();
				},
			},
		],
		{ enabled: !settingsOpen, ignoreInputs: true },
	);

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
			<SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
		</div>
	);
}
