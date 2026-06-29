import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
	Compass,
	FolderTreeIcon,
	HelpCircle,
	History,
	House,
	Languages,
	LogOut,
	type LucideIcon,
	RotateCw,
	Settings,
	Sun,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Command, CommandItem, CommandList } from "#/design-system/command";
import { Drawer, DrawerContent, DrawerHandle, DrawerPopup } from "#/design-system/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "#/design-system/popover";
import { toastManager } from "#/design-system/toast";
import { useIsMobile } from "#/design-system/use-media-query";
import { SpaceIcon } from "#/icons/space-icon";
import { useIdeStore } from "#/ide/store";
import { getLocale, setLocale } from "#/paraglide/runtime";
import { useTheme } from "#/theme/theme-provider";

type Item = {
	id: string;
	Icon: LucideIcon;
	label: string;
	shortcut: string;
	action: () => void;
};

export function CommandMenu() {
	const isMobile = useIsMobile();
	const open = useIdeStore((s) => s.commandMenuOpen);
	const setOpen = useIdeStore((s) => s.setCommandMenuOpen);
	const setSettingsOpen = useIdeStore((s) => s.setSettingsOpen);
	const setRecentFilesOpen = useIdeStore((s) => s.setRecentFilesOpen);
	const setCommandHistoryOpen = useIdeStore((s) => s.setCommandHistoryOpen);
	const setEditorMode = useIdeStore((s) => s.setEditorMode);
	const setNavigationOpen = useIdeStore((s) => s.setNavigationOpen);
	const setHelpOpen = useIdeStore((s) => s.setHelpOpen);
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const search = useRouterState({ select: (s) => s.location.search }) as {
		neotree?: "open";
	};
	const { appearance, setAppearance } = useTheme();

	const commands: Item[] = [
		{
			id: "home",
			Icon: House,
			label: "Home",
			shortcut: "h",
			action: () => {
				void navigate({
					to: "/home",
					search,
				});
				setOpen(false);
			},
		},
		{
			id: "explorer",
			Icon: FolderTreeIcon,
			label: "Explorer",
			shortcut: "e",
			action: () => {
				void navigate({
					to: pathname,
					search: (prev) => ({
						...prev,
						neotree: prev.neotree === "open" ? undefined : "open",
					}),
				});
				setOpen(false);
			},
		},
		{
			id: "navigation",
			Icon: Compass,
			label: "Navigation",
			shortcut: "n",
			action: () => {
				setNavigationOpen(true);
				setEditorMode("insert");
				setOpen(false);
			},
		},
		{
			id: "command-history",
			Icon: History,
			label: "Command History",
			shortcut: ":",
			action: () => {
				setCommandHistoryOpen(true);
				setOpen(false);
			},
		},
		{
			id: "recent-files",
			Icon: History,
			label: "Recent Files",
			shortcut: "r",
			action: () => {
				setRecentFilesOpen(true);
				setOpen(false);
			},
		},
		{
			id: "theme-mode",
			Icon: Sun,
			label: "Theme Mode",
			shortcut: "T",
			action: () => {
				const modeCycle = ["system", "light", "dark"] as const;
				const modeLabels: Record<string, string> = {
					system: "System",
					light: "Light",
					dark: "Dark",
				};
				const currentIndex = modeCycle.indexOf(appearance.mode);
				const nextMode = modeCycle[(currentIndex + 1) % modeCycle.length];
				setAppearance({ ...appearance, mode: nextMode });
				toastManager.add({
					description: `Theme mode set to ${modeLabels[nextMode]}.`,
					title: "Theme updated",
					type: "success",
				});
				setOpen(false);
			},
		},
		{
			id: "language",
			Icon: Languages,
			label: "Toggle Language",
			shortcut: "l",
			action: () => {
				const nextLocale = getLocale() === "en" ? "fr" : "en";
				setOpen(false);
				setLocale(nextLocale);
			},
		},
		{
			id: "reload",
			Icon: RotateCw,
			label: "Reload",
			shortcut: "R",
			action: () => {
				void navigate({ to: "/" });
				setOpen(false);
			},
		},
		{
			id: "settings",
			Icon: Settings,
			label: "Settings",
			shortcut: "s",
			action: () => {
				setSettingsOpen(true);
				setOpen(false);
			},
		},
		{
			id: "help",
			Icon: HelpCircle,
			label: "Help",
			shortcut: "?",
			action: () => {
				setHelpOpen(true);
				setOpen(false);
			},
		},
		{
			id: "quit",
			Icon: LogOut,
			label: "Quit",
			shortcut: "q",
			action: () => {
				if (pathname !== "/home") {
					void navigate({
						to: "/home",
						search: { neotree: search.neotree },
					});
				} else {
					void navigate({ to: "/" });
				}
				setOpen(false);
			},
		},
	];

	if (isMobile) {
		return (
			<Drawer open={open} onOpenChange={setOpen}>
				<DrawerPopup className="px-3 pb-3">
					<DrawerHandle />
					<DrawerContent>
						<CommandMenuInner commands={commands} onClose={() => setOpen(false)} />
					</DrawerContent>
				</DrawerPopup>
			</Drawer>
		);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				aria-label="Open command menu"
				className="pointer-events-none fixed right-[calc(0.75rem+var(--border-width-thin))] bottom-[calc(var(--spacing-status-bar)*2)] size-0 opacity-0"
			/>
			<PopoverContent align="end" className="p-0" initialFocus side="top" sideOffset={0}>
				<CommandMenuInner commands={commands} onClose={() => setOpen(false)} />
			</PopoverContent>
		</Popover>
	);
}

function CommandMenuInner({ commands, onClose }: { commands: Item[]; onClose: () => void }) {
	const commandRef = useRef<HTMLDivElement>(null);
	const [selectedId, setSelectedId] = useState(commands[0]?.id ?? "");

	useEffect(() => {
		commandRef.current?.focus();
	}, []);

	const selectCommand = useCallback(
		(cmd: Item) => {
			cmd.action();
			onClose();
		},
		[onClose],
	);

	function moveSelection(direction: 1 | -1) {
		const currentIndex = commands.findIndex((cmd) => cmd.id === selectedId);
		const nextIndex =
			currentIndex < 0 ? 0 : (currentIndex + direction + commands.length) % commands.length;
		setSelectedId(commands[nextIndex]?.id ?? "");
	}

	function handleKeyDown(event: React.KeyboardEvent) {
		const shortcutIndex = commands.findIndex((cmd) => cmd.shortcut === event.key);

		if (shortcutIndex >= 0) {
			event.preventDefault();
			event.stopPropagation();
			selectCommand(commands[shortcutIndex]);
			return;
		}

		switch (event.key) {
			case "j":
				event.preventDefault();
				event.stopPropagation();
				moveSelection(1);
				break;
			case "k":
				event.preventDefault();
				event.stopPropagation();
				moveSelection(-1);
				break;
			case "Escape":
				event.preventDefault();
				event.stopPropagation();
				onClose();
				break;
		}
	}

	return (
		<div className="relative w-full border-thin border-border bg-popover p-1 pt-2 text-popover-foreground">
			<div className="absolute top-0 left-3 z-raised -translate-y-1/2 bg-popover px-2 text-primary">
				<SpaceIcon className="size-3" />
			</div>
			<button
				aria-label="Close command menu"
				className="absolute top-0 end-2 z-raised -translate-y-1/2 bg-popover px-1 text-primary text-tiny leading-none focus:text-accent-foreground focus:outline-none"
				type="button"
				onClick={onClose}
			>
				[X]
			</button>
			<Command
				className="rounded-none bg-transparent outline-none"
				onKeyDownCapture={handleKeyDown}
				ref={commandRef}
				shouldFilter={false}
				value={selectedId}
				onValueChange={setSelectedId}
			>
				<CommandList className="p-0 outline-none">
					{commands.map((cmd) => (
						<CommandItem
							className="flex items-center gap-2 rounded-none px-2 text-muted-foreground"
							key={cmd.id}
							value={cmd.id}
							onSelect={() => selectCommand(cmd)}
						>
							<span className="text-foreground">{cmd.shortcut}</span>
							<span className="text-muted-foreground">→</span>
							<span className="flex min-w-0 items-center gap-2">
								<cmd.Icon className="size-2.5 shrink-0" />
								<span className="truncate">{cmd.label}</span>
							</span>
						</CommandItem>
					))}
				</CommandList>
				<div className="mt-3 flex items-center justify-center gap-1.5 text-muted-foreground">
					<kbd className="font-bold text-primary text-xxs uppercase">esc</kbd>
					<span className="text-tiny">close</span>
				</div>
			</Command>
		</div>
	);
}
