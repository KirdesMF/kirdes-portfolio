import {
	Braces,
	FileText,
	FileType,
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
			{activeFileName ? (
				<>
					<EditorBody highlightedEditorFile={highlightedEditorFile} key={activeFileName} />
					<span className="pointer-events-none absolute bottom-1 right-2 rounded border border-border/50 px-1 py-0.5 text-tiny text-muted-foreground/50">
						read-only
					</span>
				</>
			) : (
				renderEmptyEditor({ onOpenFile })
			)}
		</section>
	);
}
