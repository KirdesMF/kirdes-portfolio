import { useHotkeys } from "@tanstack/react-hotkeys";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { CommandMenu } from "#/ide/command-menu";
import { GhosttyHeader } from "#/ide/ghostty-header";
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
	const navigate = useNavigate();

	useHotkeys(
		[
			{
				hotkey: "Space",
				callback: () => {
					if (!commandMenuOpen) toggleCommandMenu();
				},
			},
			{
				hotkey: "Escape",
				callback: () => {
					if (commandMenuOpen) {
						useIdeStore.getState().setCommandMenuOpen(false);
						return;
					}
					if (file) {
						void navigate({ to: "/editor", search: {} });
					}
				},
			},
			{
				hotkey: "E",
				callback: () => {
					if (!commandMenuOpen) {
						void navigate({
							to: "/editor",
							search: { neotree: neotree === "open" ? "closed" : "open" },
						});
					}
				},
			},
			{
				hotkey: "T",
				callback: () => {
					if (!commandMenuOpen) {
						void navigate({ to: "/terminal" });
					}
				},
			},
			{
				hotkey: "/",
				callback: () => {
					if (!commandMenuOpen) {
						void navigate({ to: "/editor" });
					}
				},
			},
		],
		{ ignoreInputs: true },
	);

	return (
		<div className="flex h-dvh flex-col">
			<GhosttyHeader />
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
