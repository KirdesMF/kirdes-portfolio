import { Braces, FileText, FileType, type LucideIcon, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "#/design-system/cn";
import { editorFiles } from "#/editor/editor-files";

const fileExtensionIcon: Record<string, LucideIcon> = {
	json: Braces,
	md: FileText,
	ts: FileType,
	tsx: FileType,
};

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
	onCloseEditor,
	onCloseFile,
	onSelectFile,
	openFileNames,
}: {
	activeFileName?: string;
	onCloseEditor: () => void;
	onCloseFile: (fileName: string) => void;
	onSelectFile: (fileName: string) => void;
	openFileNames: Array<string>;
}) {
	return (
		<div className="flex h-8 shrink-0 items-center overflow-x-auto border-b border-border bg-background/60">
			{openFileNames.map((fileName) => (
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
			<div className="ms-auto flex h-full shrink-0 items-center gap-2 border-l border-border px-3 text-tiny text-muted-foreground/70">
				<span>read-only</span>
				<button
					aria-label="Close editor"
					className="rounded text-muted-foreground hover:text-foreground"
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
					{editorFiles.map(({ name }) => (
						<button
							className="rounded border border-border px-2 py-1 text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
							key={name}
							type="button"
							onClick={() => onOpenFile(name)}
						>
							{name}
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
	onCloseEditor,
	onCloseFile,
	onOpenFile,
	onSelectFile,
	openFileNames,
}: {
	activeFileName?: string;
	highlightedEditorFile: ReactNode | null;
	onCloseEditor: () => void;
	onCloseFile: (fileName: string) => void;
	onOpenFile: (fileName: string) => void;
	onSelectFile: (fileName: string) => void;
	openFileNames: Array<string>;
}) {
	return (
		<section className="flex h-full min-h-0 flex-col border-border text-xs">
			{renderEditorTabs({
				activeFileName,
				onCloseEditor,
				onCloseFile,
				onSelectFile,
				openFileNames,
			})}
			{activeFileName ? (
				<EditorBody highlightedEditorFile={highlightedEditorFile} key={activeFileName} />
			) : (
				renderEmptyEditor({ onOpenFile })
			)}
		</section>
	);
}
