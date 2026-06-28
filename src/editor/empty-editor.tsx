import { useHotkeys } from "@tanstack/react-hotkeys";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { animate, createScope, stagger } from "animejs";
import {
	Compass,
	FileText,
	FolderTreeIcon,
	HelpCircle,
	History,
	type LucideIcon,
	Mail,
	RotateCw,
	Search,
	Settings,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "#/design-system/cn";
import { CommandDialog, CommandInput, CommandItem, CommandList } from "#/design-system/command";
import { useScrambleRef } from "#/design-system/use-scramble-ref";
import { AsciiBanner } from "#/editor/ascii-banner/ascii-banner";
import { useIdeStore } from "#/ide/store";

const emptyEditorCommands: Array<{
	id: string;
	Icon: LucideIcon;
	label: string;
	shortcut: string;
}> = [
	{ id: "explorer", Icon: FolderTreeIcon, label: "Explorer", shortcut: "e" },
	{ id: "find-file", Icon: Search, label: "Find File", shortcut: "f" },
	{ id: "navigation", Icon: Compass, label: "Navigation", shortcut: "n" },
	{ id: "find-text", Icon: FileText, label: "Find Text", shortcut: "g" },
	{ id: "recent-files", Icon: History, label: "Recent Files", shortcut: "r" },
	{ id: "contacts", Icon: Mail, label: "Contacts", shortcut: "c" },
	{ id: "settings", Icon: Settings, label: "Settings", shortcut: "s" },
	{ id: "reload", Icon: RotateCw, label: "Reload", shortcut: "R" },
	{ id: "help", Icon: HelpCircle, label: "Help", shortcut: "?" },
];

const navigationItems = [
	{ label: "About", route: "/about" },
	{ label: "Contact", route: "/contact" },
	{ label: "Works", route: "/works" },
] as const;

const loaderCells = Array.from({ length: 9 }, (_, index) => index);
const diagonalOrder = [0, 1, 2, 1, 2, 3, 2, 3, 4] as const;

function TinyDiagonalLoader() {
	const rootRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const scope = createScope({
			mediaQueries: { reduceMotion: "(prefers-reduced-motion: reduce)" },
			root: rootRef,
		}).add((self) => {
			if (self?.matches.reduceMotion) return;
			animate("[data-tiny-loader-cell]", {
				delay: stagger(75, { use: "data-index" }),
				duration: 900,
				loop: true,
				opacity: [0.25, 1, 0.25],
			});
		});

		return () => scope.revert();
	}, []);

	return (
		<div aria-hidden="true" className="grid grid-cols-3 gap-0.5" ref={rootRef}>
			{loaderCells.map((cell) => (
				<span
					className="size-1 border-thin border-current bg-current text-primary"
					data-index={diagonalOrder[cell]}
					data-tiny-loader-cell=""
					key={cell}
				/>
			))}
		</div>
	);
}

export function EmptyEditor() {
	const [compact, setCompact] = useState(false);
	const [navigationOpen, setNavigationOpen] = useState(false);
	const [navigationSearch, setNavigationSearch] = useState("");
	const search = useRouterState({ select: (s) => s.location.search }) as { neotree?: "open" };
	const commandMenuOpen = useIdeStore((s) => s.commandMenuOpen);
	const settingsOpen = useIdeStore((s) => s.settingsOpen);
	const findFileOpen = useIdeStore((s) => s.findFileOpen);
	const findTextOpen = useIdeStore((s) => s.findTextOpen);
	const setFindFileOpen = useIdeStore((s) => s.setFindFileOpen);
	const setFindTextOpen = useIdeStore((s) => s.setFindTextOpen);
	const setEditorMode = useIdeStore((s) => s.setEditorMode);
	const setRecentFilesOpen = useIdeStore((s) => s.setRecentFilesOpen);
	const recentFilesOpen = useIdeStore((s) => s.recentFilesOpen);
	const helpOpen = useIdeStore((s) => s.helpOpen);
	const contactsOpen = useIdeStore((s) => s.contactsOpen);
	const setHelpOpen = useIdeStore((s) => s.setHelpOpen);
	const setSettingsOpen = useIdeStore((s) => s.setSettingsOpen);
	const setContactsOpen = useIdeStore((s) => s.setContactsOpen);
	const emptyEditorHotkeysBlocked =
		commandMenuOpen ||
		helpOpen ||
		settingsOpen ||
		contactsOpen ||
		findFileOpen ||
		findTextOpen ||
		recentFilesOpen ||
		navigationOpen;
	const navigate = useNavigate();
	const containerRef = useRef<HTMLDivElement | null>(null);
	const rootRef = useScrambleRef<HTMLDivElement>({
		selector: "[data-anim-editor-status]",
		staggerMs: 0,
	});

	function runEmptyEditorCommand(commandId: string) {
		switch (commandId) {
			case "explorer":
				void navigate({
					to: "/start",
					search: { neotree: "open" as const },
				});
				break;
			case "find-file":
				setFindFileOpen(true);
				break;
			case "navigation":
				setNavigationOpen(true);
				setEditorMode("insert");
				break;
			case "find-text":
				setFindTextOpen(true);
				break;
			case "settings":
				setSettingsOpen(true);
				break;
			case "contacts":
				setContactsOpen(true);
				break;
			case "recent-files":
				setRecentFilesOpen(true);
				break;
			case "help":
				setHelpOpen(true);
				break;
			case "reload":
				void navigate({ to: "/" });
				break;
		}
	}

	useHotkeys(
		[
			{ hotkey: "Shift+R", callback: () => runEmptyEditorCommand("reload") },
			{ hotkey: "F", callback: () => runEmptyEditorCommand("find-file") },
			{ hotkey: "N", callback: () => runEmptyEditorCommand("navigation") },
			{ hotkey: "C", callback: () => runEmptyEditorCommand("contacts") },
			{ hotkey: "G", callback: () => runEmptyEditorCommand("find-text") },
			{ hotkey: "R", callback: () => runEmptyEditorCommand("recent-files") },
		],
		{
			enabled: !emptyEditorHotkeysBlocked,
			ignoreInputs: true,
			preventDefault: true,
		},
	);

	const filteredNavigationItems = navigationItems.filter((item) =>
		item.label.toLowerCase().includes(navigationSearch.trim().toLowerCase()),
	);

	function openNavigationRoute(route: (typeof navigationItems)[number]["route"]) {
		void navigate({ to: route, search });
		setNavigationOpen(false);
		setNavigationSearch("");
		setEditorMode("normal");
	}

	function handleNavigationOpenChange(open: boolean) {
		setNavigationOpen(open);
		setEditorMode(open ? "insert" : "normal");
		if (!open) setNavigationSearch("");
	}

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		let frame = 0;
		const updateCompact = () => {
			const nextCompact = container.getBoundingClientRect().height < 460;
			setCompact((previous) => (previous === nextCompact ? previous : nextCompact));
		};
		const scheduleUpdate = () => {
			if (frame) return;
			frame = window.requestAnimationFrame(() => {
				frame = 0;
				updateCompact();
			});
		};
		const observer = new ResizeObserver(scheduleUpdate);
		observer.observe(container);
		updateCompact();

		return () => {
			observer.disconnect();
			if (frame) window.cancelAnimationFrame(frame);
		};
	}, []);

	return (
		<div className="flex min-h-full items-center justify-center p-6 text-xs" ref={containerRef}>
			<div
				className={cn(
					"flex w-full max-w-3xl flex-col items-center text-primary/80",
					compact ? "gap-4" : "gap-7",
				)}
			>
				<AsciiBanner className={cn("w-full", compact ? "max-w-sm" : "max-w-lg")} />
				<div className={cn("grid w-full max-w-sm gap-1", compact && "grid-cols-2")}>
					{emptyEditorCommands.map(({ Icon, id, label, shortcut }) => (
						<button
							className="relative grid grid-cols-[auto_1fr_1ch] items-center gap-4 px-2 py-1.5 text-left text-primary/90 before:absolute before:inset-y-0 before:s-0 before:w-1 before:bg-transparent hover:bg-accent hover:text-accent-foreground hover:before:bg-primary/60"
							key={id}
							type="button"
							onClick={() => runEmptyEditorCommand(id)}
						>
							<Icon aria-hidden="true" className="size-4 text-primary" />
							<span className="truncate">{label}</span>
							<span className="text-command-shortcut text-end">{shortcut}</span>
						</button>
					))}
				</div>
				<div
					className="flex items-center justify-center gap-1.5 text-primary/70 text-tiny"
					ref={rootRef}
				>
					<TinyDiagonalLoader />
					<Link
						className="text-primary/70 transition hover:text-primary"
						search={search}
						to="/contact"
					>
						<span data-anim-editor-status>open to freelance and full-time opportunities</span>
					</Link>
				</div>
			</div>
			<CommandDialog
				commandClassName="h-[min(70dvh,18rem)]"
				description="Choose a route to open in the editor."
				open={navigationOpen}
				title="NAVIGATION"
				onOpenChange={handleNavigationOpenChange}
			>
				<CommandInput
					autoFocus
					className="h-9 border-b-0 px-0 text-xs"
					placeholder="Navigate..."
					value={navigationSearch}
					onFocus={() => setEditorMode("insert")}
					onValueChange={setNavigationSearch}
				/>
				<CommandList className="min-h-0 flex-1 p-0 pt-2">
					{filteredNavigationItems.map((item) => (
						<CommandItem
							className="rounded-none px-2 text-muted-foreground"
							key={item.route}
							value={`${item.label} ${item.route}`}
							onSelect={() => openNavigationRoute(item.route)}
						>
							<Compass className="size-3 shrink-0" />
							<span>{item.label}</span>
							<span className="ms-auto text-command-shortcut">{item.route}</span>
						</CommandItem>
					))}
				</CommandList>
			</CommandDialog>
		</div>
	);
}
