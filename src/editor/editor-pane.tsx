import type { ReactNode } from "react";
import { cn } from "#/design-system/cn";
import type { EditorFileName } from "./editor-files";
import { ReadOnlyFileEditor } from "./read-only-file-editor";

export function EditorPane({
	activeFileName,
	className,
	highlightedEditorFile,
	isMaximized,
	onCloseEditor,
	onCloseFile,
	onOpenFile,
	onSelectFile,
	onToggleMaximize,
	openFileNames,
}: {
	activeFileName?: EditorFileName;
	className?: string;
	highlightedEditorFile: ReactNode | null;
	isMaximized?: boolean;
	onCloseEditor: () => void;
	onCloseFile: (fileName: string) => void;
	onOpenFile: (fileName: string) => void;
	onSelectFile: (fileName: string) => void;
	onToggleMaximize: () => void;
	openFileNames: Array<EditorFileName>;
}) {
	return (
		<div className={cn("min-h-0 w-full flex-1 overflow-hidden", className)}>
			<ReadOnlyFileEditor
				activeFileName={activeFileName}
				highlightedEditorFile={highlightedEditorFile}
				isMaximized={isMaximized}
				onCloseEditor={onCloseEditor}
				onCloseFile={onCloseFile}
				onOpenFile={onOpenFile}
				onSelectFile={onSelectFile}
				onToggleMaximize={onToggleMaximize}
				openFileNames={openFileNames}
			/>
		</div>
	);
}
