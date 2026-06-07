import {
	Braces,
	Clock,
	FileText,
	FileType,
	FolderOpen,
	GitBranch,
	History,
	type LucideIcon,
	Map as MapIcon,
	Maximize2,
	Minimize2,
	Search,
	X,
	Zap,
} from "lucide-react";
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { AsciiBanner } from "#/ascii-banner/AsciiBanner";
import { cn } from "#/design-system/cn";
import { Separator } from "#/design-system/Separator";
import { useScrambleRef } from "#/design-system/useScrambleRef";
import { getDisplayFileName } from "#/editor/editor-files";
import { getRandomNumber } from "#/utils/random-number";

const fileExtensionIcon: Record<string, LucideIcon> = {
	json: Braces,
	md: FileText,
	ts: FileType,
	tsx: FileType,
	txt: FileText,
};

type StatusSide = "left" | "right";
type StatusVariant = "primary" | "muted";

type StatusItem = {
	id: string;
	variant: StatusVariant;
	content: ReactNode;
};

const variantClass = {
	primary: {
		background: "bg-status-primary",
		foreground: "text-status-primary-foreground",
		fill: "fill-status-primary",
	},
	muted: {
		background: "bg-status-muted",
		foreground: "text-status-muted-foreground",
		fill: "fill-status-muted",
	},
} as const;

const EDITOR_BRANCH_NAME = "feat/portfolio";
const EDITOR_VERSION = "kirdes v1.0.0";

const emptyEditorCommands: Array<{
	id: string;
	Icon: LucideIcon;
	label: string;
	shortcut: string;
}> = [
	{ id: "search-file", Icon: Search, label: "Search File", shortcut: "f" },
	{ id: "find-text", Icon: FileText, label: "Find Text", shortcut: "g" },
	{ id: "explorer", Icon: FolderOpen, label: "Explorer", shortcut: "e" },
	{ id: "recent-files", Icon: History, label: "Recent Files", shortcut: "r" },
	{ id: "source-map", Icon: MapIcon, label: "Source Map", shortcut: "m" },
	{ id: "changelog", Icon: Clock, label: "Changelog", shortcut: "c" },
	{ id: "git-branch", Icon: GitBranch, label: "Git Branch", shortcut: "b" },
	{ id: "quit", Icon: X, label: "Quit", shortcut: "q" },
];

function getFileIcon(fileName: string): LucideIcon | null {
	const extension = fileName.split(".").pop()?.toLowerCase();
	if (!extension) return null;
	return fileExtensionIcon[extension] ?? null;
}

function FileIcon({ fileName }: { fileName: string }) {
	const Icon = getFileIcon(fileName);
	if (!Icon) return null;

	return <Icon className="size-3 shrink-0" />;
}

function EditorBody({ highlightedEditorFile }: { highlightedEditorFile: ReactNode | null }) {
	if (highlightedEditorFile) return highlightedEditorFile;

	return <div className="p-3 text-muted-foreground">highlighting file...</div>;
}

function EditorStatusBar({ activeFileName }: { activeFileName?: string }) {
	const leftItems: StatusItem[] = [
		{
			id: "mode",
			variant: "primary",
			content: <span className="font-medium">NORMAL</span>,
		},
		{
			id: "branch",
			variant: "muted",
			content: (
				<>
					<GitBranch className="size-3 shrink-0" />
					<span className="truncate">{EDITOR_BRANCH_NAME}</span>
				</>
			),
		},
		...(activeFileName
			? [
					{
						id: "file",
						variant: "primary" as const,
						content: <span className="truncate">{getDisplayFileName(activeFileName)}</span>,
					} as StatusItem,
				]
			: []),
	];
	const rightItems: StatusItem[] = [
		{
			id: "cursor",
			variant: "muted",
			content: <span className="tabular-nums">1:1</span>,
		},
		{
			id: "version",
			variant: "primary",
			content: <span className="text-nowrap">{EDITOR_VERSION}</span>,
		},
	];

	return (
		<footer className="flex h-status-bar shrink-0 items-stretch justify-between border-t border-border bg-status text-status-foreground">
			<StatusGroup items={leftItems} side="left" />
			<StatusGroup items={rightItems} side="right" />
		</footer>
	);
}

function StatusGroup(props: { items: StatusItem[]; side: StatusSide }) {
	return (
		<div className="flex min-w-0 items-stretch text-tiny">
			{props.items.map((item, index) => (
				<StatusSegment
					isFirst={index === 0}
					isLast={index === props.items.length - 1}
					item={item}
					key={item.id}
					side={props.side}
					stack={props.side === "left" ? props.items.length - index : index + 1}
				/>
			))}
		</div>
	);
}

function StatusSegment(props: {
	isFirst: boolean;
	isLast: boolean;
	item: StatusItem;
	side: StatusSide;
	stack: number;
}) {
	const variant = variantClass[props.item.variant];

	return (
		<div
			className={cn(
				"flex min-w-0 items-stretch z-(--status-segment-stack)",
				variant.foreground,
				props.side === "left" && !props.isFirst && "-ms-2.5",
				props.side === "right" && !props.isLast && "-me-2.5",
			)}
			style={{ "--status-segment-stack": props.stack } as CSSProperties}
		>
			{props.side === "right" && <Chevron direction="left" variant={props.item.variant} />}

			<div
				className={cn(
					"flex min-w-0 items-center gap-2",
					variant.background,
					props.side === "left" && props.isFirst && "ps-2 pe-4",
					props.side === "left" && !props.isFirst && "pe-4 ps-5",
					props.side === "right" && "ps-3",
					props.side === "right" && !props.isLast && "pe-5",
					props.side === "right" && props.isLast && "pe-4",
				)}
			>
				{props.item.content}
			</div>

			{props.side === "left" && <Chevron direction="right" variant={props.item.variant} />}
		</div>
	);
}

function Chevron(props: { direction: "left" | "right"; variant: StatusVariant }) {
	return (
		<svg
			aria-hidden="true"
			className={cn("h-full w-2.5 shrink-0", variantClass[props.variant].fill)}
			preserveAspectRatio="none"
			viewBox="0 0 16 20"
		>
			<polygon points={props.direction === "left" ? "16,0 0,10 16,20" : "0,0 16,10 0,20"} />
		</svg>
	);
}

function EditorTabs({
	activeFileName,
	isMaximized,
	onCloseEditor,
	onCloseFile,
	onSelectFile,
	onToggleMaximize,
	openFileNames,
}: {
	activeFileName?: string;
	isMaximized?: boolean;
	onCloseEditor: () => void;
	onCloseFile: (fileName: string) => void;
	onSelectFile: (fileName: string) => void;
	onToggleMaximize: () => void;
	openFileNames: Array<string>;
}) {
	return (
		<div className="hidden h-status-bar w-full shrink-0 items-center justify-between border-b border-border bg-background/60 md:flex">
			<div className="flex min-w-0 flex-1 items-center overflow-x-auto self-stretch scrollbar-none">
				{openFileNames.map((fileName) => {
					const displayFileName = getDisplayFileName(fileName);
					const active = activeFileName === fileName;

					return (
						<div
							className={cn(
								"relative flex h-full max-w-40 shrink-0 items-center border-r border-border text-tiny text-muted-foreground hover:bg-muted/30 hover:text-foreground",
								active && "bg-muted/40 text-foreground",
							)}
							key={fileName}
						>
							{active ? <span className="absolute inset-y-0 left-0 w-0.5 bg-primary" /> : null}
							<button
								className="flex h-full min-w-0 items-center gap-1.5 pl-3 pr-2"
								type="button"
								onClick={() => onSelectFile(fileName)}
							>
								<FileIcon fileName={fileName} />
								<span className="truncate">{displayFileName}</span>
							</button>
							<button
								aria-label={`Close ${displayFileName}`}
								className="h-full px-2 text-muted-foreground hover:text-foreground"
								type="button"
								onClick={() => onCloseFile(fileName)}
							>
								<X className="size-3" />
							</button>
						</div>
					);
				})}
			</div>
			<div className="flex items-center shrink-0 self-stretch">
				<Separator className="h-full" orientation="vertical" />
				<button
					aria-label={isMaximized ? "Minimize panel" : "Maximize panel"}
					className="hidden h-full shrink-0 items-center px-2 text-tiny text-muted-foreground/70 hover:text-foreground md:flex"
					type="button"
					onClick={onToggleMaximize}
				>
					{isMaximized ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
				</button>
				<Separator className="hidden h-full md:block" orientation="vertical" />
				<button
					aria-label="Close editor"
					className="flex h-full shrink-0 items-center px-3 text-tiny text-muted-foreground/70 hover:text-foreground"
					type="button"
					onClick={onCloseEditor}
				>
					<X className="size-3.5" />
				</button>
			</div>
		</div>
	);
}

function EmptyEditor() {
	const [loadingTime, setLoadingTime] = useState(20);
	const [compact, setCompact] = useState(false);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const rootRef = useScrambleRef<HTMLDivElement>({
		selector: "[data-anim-editor-status]",
		staggerMs: 0,
	});

	useEffect(() => {
		setLoadingTime(getRandomNumber({ max: 100, min: 20 }));
	}, []);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const updateCompact = () => {
			setCompact(container.getBoundingClientRect().height < 460);
		};
		const observer = new ResizeObserver(updateCompact);
		observer.observe(container);
		updateCompact();

		return () => observer.disconnect();
	}, []);

	return (
		<div className="flex min-h-full items-center justify-center p-6 text-sm" ref={containerRef}>
			<div
				className={cn(
					"flex w-full max-w-3xl flex-col items-center text-primary/80",
					compact ? "gap-4" : "gap-7",
				)}
			>
				<AsciiBanner className={cn("w-full", compact ? "max-w-sm" : "max-w-lg")} />
				<div className={cn("grid w-full max-w-md", compact ? "grid-cols-2 gap-2" : "gap-4")}>
					{emptyEditorCommands.map(({ Icon, id, label, shortcut }) => (
						<div className="grid grid-cols-[1.5rem_1fr_1rem] items-center gap-4" key={id}>
							<Icon aria-hidden="true" className="size-4 text-primary" />
							<span className="tracking-wide text-primary/90">{label}</span>
							<span className="text-end text-command-shortcut">{shortcut}</span>
						</div>
					))}
				</div>
				<div
					className="flex items-center justify-center gap-1.5 text-primary/70 text-tiny"
					ref={rootRef}
				>
					<Zap aria-hidden="true" className="size-3 text-primary" />
					<span data-anim-editor-status>
						Neovim loaded <span className="text-status-primary">5/38</span> plugins in {loadingTime}
						ms
					</span>
				</div>
			</div>
		</div>
	);
}

export function ReadOnlyFileEditor({
	activeFileName,
	highlightedEditorFile,
	isMaximized,
	onCloseEditor,
	onCloseFile,
	onOpenFile,
	onSelectFile,
	onToggleMaximize,
	openFileNames,
}: {
	activeFileName?: string;
	highlightedEditorFile: ReactNode | null;
	isMaximized?: boolean;
	onCloseEditor: () => void;
	onCloseFile: (fileName: string) => void;
	onOpenFile: (fileName: string) => void;
	onSelectFile: (fileName: string) => void;
	onToggleMaximize: () => void;
	openFileNames: Array<string>;
}) {
	void onOpenFile;

	return (
		<section className="relative flex h-full w-full min-h-0 flex-col border-border text-xs">
			<EditorTabs
				activeFileName={activeFileName}
				isMaximized={isMaximized}
				onCloseEditor={onCloseEditor}
				onCloseFile={onCloseFile}
				onSelectFile={onSelectFile}
				onToggleMaximize={onToggleMaximize}
				openFileNames={openFileNames}
			/>
			<div className="min-h-0 flex-1 overflow-auto scrollbar-gutter-both">
				{activeFileName ? (
					<EditorBody highlightedEditorFile={highlightedEditorFile} key={activeFileName} />
				) : (
					<EmptyEditor />
				)}
			</div>
			<EditorStatusBar activeFileName={activeFileName} />
		</section>
	);
}
