import { useHotkeys } from "@tanstack/react-hotkeys";
import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { SpaceIcon } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { contactInfo } from "#/data";
import { ScrambleText } from "#/design-system/scramble-text";
import { findEditorFileByRoute, getDisplayFileName } from "#/editor/editor-files";
import { CommandMenu } from "#/ide/command-menu";
import { CommandHistoryDialog, CommandModeDialog } from "#/ide/command-mode-dialog";
import { ContactsDialog } from "#/ide/contacts-dialog";
import { FindFileDialog } from "#/ide/find-file-dialog";
import { FindTextDialog } from "#/ide/find-text-dialog";
import { HelpDialog } from "#/ide/help-dialog";
import { NeoTree } from "#/ide/neo-tree";
import { RecentFilesDialog } from "#/ide/recent-files-dialog";
import { parseIdeSearch } from "#/ide/search";
import { StatusBar } from "#/ide/status-bar";
import { useIdeStore } from "#/ide/store";
import { SettingsDialog } from "#/settings-dialog";

export const Route = createFileRoute("/_app")({
	validateSearch: parseIdeSearch,
	component: IdeShell,
});

const defaultPageLineCount = 80;
const pageLineHeight = 16;
const pageLineOverscan = 8;

function getPageLineCount(scrollElement: HTMLElement) {
	return Math.max(defaultPageLineCount, Math.ceil(scrollElement.scrollHeight / pageLineHeight));
}

function PageLineNumbers({
	hoveredLine,
	lineCount,
	scrollTop,
}: {
	hoveredLine: number | null;
	lineCount: number;
	scrollTop: number;
}) {
	const startLine = Math.max(1, Math.floor(scrollTop / pageLineHeight) + 1 - pageLineOverscan);
	const offsetY = -scrollTop + (startLine - 1) * pageLineHeight;
	const visibleLineCount = Math.min(
		lineCount - startLine + 1,
		defaultPageLineCount + pageLineOverscan * 2,
	);
	const pageLineNumbers = Array.from({ length: visibleLineCount }, (_, index) => startLine + index);

	return (
		<aside
			aria-hidden="true"
			className="min-h-full w-8 shrink-0 overflow-hidden border-r-thin border-border/60 bg-background py-1 text-end font-mono text-tiny select-none"
		>
			<div style={{ transform: `translateY(${offsetY}px)` }}>
				{pageLineNumbers.map((line) => (
					<div
						className={`px-2 leading-4 text-tiny ${hoveredLine === line ? "text-foreground" : "text-muted-foreground/45"}`}
						key={line}
					>
						{line}
					</div>
				))}
			</div>
		</aside>
	);
}

function PageLineNumberFrame({
	children,
	enabled,
	onHoveredLineChange,
	onLineCountChange,
}: {
	children: ReactNode;
	enabled: boolean;
	onHoveredLineChange: (line: number | null) => void;
	onLineCountChange: (count: number) => void;
}) {
	const [hoveredLine, setHoveredLine] = useState<number | null>(null);
	const [lineCount, setLineCount] = useState(defaultPageLineCount);
	const [scrollTop, setScrollTop] = useState(0);
	const hoveredLineRef = useRef<number | null>(null);
	const wrapperRef = useRef<HTMLDivElement | null>(null);

	function updateHoveredLine(line: number | null) {
		if (hoveredLineRef.current === line) return;
		hoveredLineRef.current = line;
		setHoveredLine(line);
		onHoveredLineChange(line);
	}

	const updateScrollMetrics = useCallback(
		(scrollElement: HTMLElement) => {
			const nextLineCount = getPageLineCount(scrollElement);
			setLineCount((current) => (current === nextLineCount ? current : nextLineCount));
			onLineCountChange(nextLineCount);
			setScrollTop((current) =>
				current === scrollElement.scrollTop ? current : scrollElement.scrollTop,
			);
		},
		[onLineCountChange],
	);

	function handleScroll(event: React.UIEvent<HTMLDivElement>) {
		if (!enabled || !(event.target instanceof HTMLElement)) return;
		if (!event.target.matches("[data-page-scroll]")) return;
		updateScrollMetrics(event.target);
	}

	function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
		if (!enabled) return;

		const rect = event.currentTarget.getBoundingClientRect();
		const line = Math.floor((event.clientY - rect.top + scrollTop) / pageLineHeight) + 1;
		updateHoveredLine(line > 0 && line <= lineCount ? line : null);
	}

	useEffect(() => {
		if (!enabled) return;

		const scrollElement = wrapperRef.current?.querySelector<HTMLElement>("[data-page-scroll]");
		if (!scrollElement) return;

		updateScrollMetrics(scrollElement);

		const observer = new ResizeObserver(() => updateScrollMetrics(scrollElement));
		observer.observe(scrollElement);
		return () => observer.disconnect();
	}, [enabled, updateScrollMetrics]);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: Decorative mouse tracking for line-number hover; no user action.
		<div
			className="flex min-h-0 flex-1 overflow-hidden"
			ref={wrapperRef}
			onMouseLeave={() => updateHoveredLine(null)}
			onMouseMove={handleMouseMove}
			onScrollCapture={handleScroll}
		>
			{enabled && (
				<PageLineNumbers hoveredLine={hoveredLine} lineCount={lineCount} scrollTop={scrollTop} />
			)}
			<div className="min-w-0 flex-1 overflow-hidden">{children}</div>
		</div>
	);
}

function IdeShell() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const search = useRouterState({ select: (s) => s.location.search }) as { neotree?: "open" };
	const navigate = useNavigate();
	const currentFile = findEditorFileByRoute(pathname)?.id;
	const pageTitle =
		pathname === "/start" ? "[h] home" : currentFile ? getDisplayFileName(currentFile) : undefined;
	const showPageLineNumbers = pathname !== "/start";
	const [hoveredPageLine, setHoveredPageLine] = useState<number | null>(null);
	const [pageLineCount, setPageLineCount] = useState(defaultPageLineCount);
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

	function toggleExplorer() {
		void navigate({
			to: pathname,
			search: (prev) => ({
				...prev,
				neotree: prev.neotree === "open" ? undefined : "open",
			}),
		});
	}

	function openHome() {
		void navigate({
			to: "/start",
			search: (prev) => prev,
		});
	}

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
				hotkey: "S",
				callback: () => {
					if (!commandMenuOpen) setSettingsOpen(true);
				},
			},
			{
				hotkey: "E",
				callback: () => {
					if (!commandMenuOpen) toggleExplorer();
				},
			},
			{
				hotkey: "H",
				callback: () => {
					if (!commandMenuOpen) openHome();
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
		<div className="flex h-dvh flex-col pb-2">
			<div className="relative flex min-h-0 flex-1">
				<NeoTree />
				<main
					className={`relative min-w-0 flex-1 overflow-hidden ${search.neotree === "open" ? "pt-3 pr-3 pb-0 pl-0" : "px-3 pt-3 pb-0"}`}
				>
					<div className="flex size-full flex-col overflow-hidden border-thin border-border">
						<PageLineNumberFrame
							enabled={showPageLineNumbers}
							onHoveredLineChange={setHoveredPageLine}
							onLineCountChange={setPageLineCount}
						>
							<Outlet />
						</PageLineNumberFrame>
						<StatusBar
							currentFile={currentFile}
							pageLine={showPageLineNumbers ? hoveredPageLine : null}
							pageLineCount={showPageLineNumbers ? pageLineCount : null}
						/>
					</div>
					{pageTitle && (
						<div className="pointer-events-none absolute top-3 left-5 z-raised -translate-y-1/2 bg-background px-2 text-primary text-tiny">
							{pageTitle}
						</div>
					)}
				</main>
			</div>
			<footer className="flex shrink-0 items-center justify-between border-x-thin border-b-thin border-border bg-background mx-3 p-2 text-tiny text-muted-foreground">
				<div className="flex h-full items-center gap-2">
					<div className="hidden h-full items-center bg-status-muted px-4 text-status-muted-foreground md:flex">
						<ScrambleText text={`©${new Date().getFullYear()}`} />
					</div>
					<a
						className="flex h-full items-center bg-status-muted px-4 text-status-muted-foreground transition hover:bg-status-primary hover:text-status-primary-foreground"
						href={contactInfo.github.url}
						target="_blank"
						rel="noreferrer"
					>
						github
					</a>
				</div>
				<div className="flex h-full items-center gap-2">
					<button
						className="flex h-full cursor-pointer items-center bg-status-muted px-4 text-status-muted-foreground transition hover:bg-status-primary hover:text-status-primary-foreground"
						type="button"
						onClick={toggleCommandMenu}
					>
						<SpaceIcon className="me-1 inline size-3 align-[-0.125em]" /> menu
					</button>
					<button
						className="flex h-full cursor-pointer items-center bg-status-muted px-4 text-status-muted-foreground transition hover:bg-status-primary hover:text-status-primary-foreground"
						type="button"
						onClick={toggleExplorer}
					>
						e explorer
					</button>
					<button
						className="hidden h-full cursor-pointer items-center bg-status-muted px-4 text-status-muted-foreground transition hover:bg-status-primary hover:text-status-primary-foreground md:flex"
						type="button"
						onClick={() => setSettingsOpen(true)}
					>
						s settings
					</button>
					<button
						className="hidden h-full cursor-pointer items-center bg-status-muted px-4 text-status-muted-foreground transition hover:bg-status-primary hover:text-status-primary-foreground md:flex"
						type="button"
						onClick={() => setHelpOpen(true)}
					>
						? help
					</button>
				</div>
			</footer>
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
