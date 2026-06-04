import {
	Braces,
	FileText,
	FileType,
	GitBranch,
	List,
	type LucideIcon,
	Maximize2,
	Minimize2,
	X,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "#/design-system/cn";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "#/design-system/Menu";
import { editorFiles } from "#/editor/editor-files";

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

const EDITOR_BRANCH_NAME = "feature/kirdes-app";
const EDITOR_VERSION = "kish v1.0.0";

// Only root files in the empty editor (globally accessible)
const rootEditorFiles = editorFiles.filter((f) => f.folder === "~");

function getFileIcon(fileName: string): LucideIcon | null {
	const extension = fileName.split(".").pop()?.toLowerCase();
	if (!extension) return null;
	return fileExtensionIcon[extension] ?? null;
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
		{
			id: "file",
			variant: "primary",
			content: <span className="truncate">{activeFileName ?? "[No Name]"}</span>,
		},
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
			content: <span>{EDITOR_VERSION}</span>,
		},
	];

	return (
		<footer className="flex h-status-bar shrink-0 items-stretch justify-between border-t border-border bg-status">
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
				"flex min-w-0 items-stretch",
				variant.foreground,
				props.side === "left" && !props.isFirst && "-ms-2.5",
				props.side === "right" && !props.isLast && "-me-2.5",
			)}
			style={{ zIndex: props.stack }}
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

function renderEditorTabs({
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
	const MAX_VISIBLE_TABS = 3;
	const visibleFiles = openFileNames.slice(0, MAX_VISIBLE_TABS);
	const overflowCount = openFileNames.length - MAX_VISIBLE_TABS;

	return (
		<div className="flex h-8 w-full shrink-0 items-center justify-between border-b border-border bg-background/60">
			<div className="flex min-w-0 flex-1 items-center overflow-x-auto self-stretch">
				{visibleFiles.map((fileName) => (
					<div
						className={cn(
							"flex h-full max-w-40 shrink-0 items-center border-r border-border text-tiny text-muted-foreground hover:bg-muted/30 hover:text-foreground",
							activeFileName === fileName && "bg-muted/40 text-foreground",
						)}
						key={fileName}
					>
						<button
							className="flex h-full min-w-0 items-center gap-1.5 pl-3 pr-2"
							type="button"
							onClick={() => onSelectFile(fileName)}
						>
							{(() => {
								const Icon = getFileIcon(fileName);
								return Icon ? <Icon className="size-3 shrink-0" /> : null;
							})()}
							<span className="truncate">{fileName}</span>
						</button>
						<button
							aria-label={`Close ${fileName}`}
							className="h-full px-2 text-muted-foreground hover:text-foreground"
							type="button"
							onClick={() => onCloseFile(fileName)}
						>
							<X className="size-3" />
						</button>
					</div>
				))}
				{overflowCount > 0 ? (
					<Menu>
						<MenuTrigger
							aria-label="All open files"
							className="flex h-full shrink-0 items-center gap-1 border-r border-border px-2 text-tiny text-muted-foreground/70 hover:text-foreground"
						>
							<List className="size-3" />
							<span className="tabular-nums">+{overflowCount}</span>
						</MenuTrigger>
						<MenuContent align="start" side="bottom" sideOffset={0}>
							{openFileNames.map((fileName) => (
								<MenuItem
									className={cn(activeFileName === fileName && "text-foreground")}
									key={fileName}
									onClick={() => onSelectFile(fileName)}
								>
									{fileName}
								</MenuItem>
							))}
						</MenuContent>
					</Menu>
				) : null}
			</div>
			<div className="flex items-center shrink-0 self-stretch">
				<button
					aria-label={isMaximized ? "Minimize panel" : "Maximize panel"}
					className="flex h-full shrink-0 items-center border-s border-border px-2 text-tiny text-muted-foreground/70 hover:text-foreground"
					type="button"
					onClick={onToggleMaximize}
				>
					{isMaximized ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
				</button>
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

function renderEmptyEditor({ onOpenFile }: { onOpenFile: (fileName: string) => void }) {
	return (
		<div className="flex min-h-0 flex-1 items-center justify-center p-4 text-xs">
			<div className="flex max-w-sm flex-col items-center gap-3 text-center">
				<div className="text-foreground">No file open</div>
				<div className="text-muted-foreground">Open a file to inspect portfolio source.</div>
				<div className="flex flex-wrap justify-center gap-2">
					<p className="text-muted-foreground/60">
						root files — use <kbd className="rounded border border-border px-1">cd</kbd> to navigate
						to a folder for its files
					</p>
					{rootEditorFiles.map((file) => (
						<button
							className="rounded border border-border px-2 py-1 text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
							key={file.id}
							type="button"
							onClick={() => onOpenFile(file.id)}
						>
							{file.name}
						</button>
					))}
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
	return (
		<section className="relative flex h-full w-full min-h-0 flex-col border-border text-xs">
			{renderEditorTabs({
				activeFileName,
				isMaximized,
				onCloseEditor,
				onCloseFile,
				onSelectFile,
				onToggleMaximize,
				openFileNames,
			})}
			<div className="min-h-0 flex-1 overflow-auto">
				{activeFileName ? (
					<EditorBody highlightedEditorFile={highlightedEditorFile} key={activeFileName} />
				) : (
					renderEmptyEditor({ onOpenFile })
				)}
			</div>
			<EditorStatusBar activeFileName={activeFileName} />
		</section>
	);
}
