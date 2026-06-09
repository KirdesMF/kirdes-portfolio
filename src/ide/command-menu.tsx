import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
	FileText,
	FolderTreeIcon,
	LogOut,
	type LucideIcon,
	Settings,
	Terminal,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Command, CommandItem, CommandList } from "#/design-system/command";
import { Drawer, DrawerContent, DrawerHandle } from "#/design-system/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "#/design-system/popover";
import { useIsMobile } from "#/design-system/use-media-query";
import { useIdeStore } from "#/ide/store";

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
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	const commands: Item[] = [
		{
			id: "explorer",
			Icon: FolderTreeIcon,
			label: "Explorer",
			shortcut: "e",
			action: () => {
				void navigate({
					to: "/editor",
					search: (prev) => ({
						...prev,
						neotree: prev.neotree === "open" ? "closed" : "open",
					}),
				});
				setOpen(false);
			},
		},
		{
			id: "explorer-focus",
			Icon: FolderTreeIcon,
			label: "Explorer Focus",
			shortcut: "E",
			action: () => {
				void navigate({
					to: pathname,
					search: (prev) => ({
						...prev,
						neotree: "open",
					}),
				});
				setOpen(false);
			},
		},
		{
			id: "terminal",
			Icon: Terminal,
			label: "Terminal",
			shortcut: "t",
			action: () => {
				void navigate({ to: "/terminal" });
				setOpen(false);
			},
		},
		{
			id: "editor",
			Icon: FileText,
			label: "Editor",
			shortcut: "/",
			action: () => {
				void navigate({ to: "/editor", search: { neotree: "open" as const } });
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
			id: "quit",
			Icon: LogOut,
			label: "Quit",
			shortcut: "q",
			action: () => {
				void navigate({ to: "/" });
				setOpen(false);
			},
		},
	];

	if (isMobile) {
		return (
			<Drawer open={open} onOpenChange={setOpen}>
				<DrawerContent className="px-3 pb-3">
					<DrawerHandle />
					<CommandMenuInner commands={commands} onClose={() => setOpen(false)} />
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				aria-label="Open command menu"
				className="pointer-events-none fixed right-0 bottom-status-bar size-px opacity-0"
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
			currentIndex < 0
				? 0
				: (currentIndex + direction + commands.length) % commands.length;
		setSelectedId(commands[nextIndex]?.id ?? "");
	}

	function handleKeyDown(event: React.KeyboardEvent) {
		const shortcutIndex = commands.findIndex(
			(cmd) => cmd.shortcut === event.key && cmd.id !== "explorer-focus",
		);

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
		<div className="relative w-40 rounded border border-border bg-popover p-1 pt-2 text-popover-foreground">
			<div className="absolute top-0 left-3 z-raised -translate-y-1/2 bg-popover px-2 text-tiny leading-none text-primary">
				SPACE
			</div>
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
				<div className="mt-3 flex items-center justify-center gap-3 text-muted-foreground">
					<kbd className="font-bold text-primary uppercase">esc</kbd>
					<span className="text-tiny">Close</span>
				</div>
			</Command>
		</div>
	);
}
