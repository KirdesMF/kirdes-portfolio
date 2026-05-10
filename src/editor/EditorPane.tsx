import type { ReactNode } from "react";
import { cn } from "#/design-system/cn";
import type { EditorFileName } from "./editor-files";
import { ReadOnlyFileEditor } from "./ReadOnlyFileEditor";

export function EditorPane({
	activeFileName,
	className,
	highlightedEditorFile,
	onCloseEditor,
	onCloseFile,
	onOpenFile,
	onSelectFile,
	openFileNames,
}: {
	activeFileName?: EditorFileName;
	className?: string;
	highlightedEditorFile: ReactNode | null;
	onCloseEditor: () => void;
	onCloseFile: (fileName: string) => void;
	onOpenFile: (fileName: string) => void;
	onSelectFile: (fileName: string) => void;
	openFileNames: Array<EditorFileName>;
}) {
	return (
		<div className={cn("min-h-0 w-full flex-1 overflow-hidden", className)}>
			<ReadOnlyFileEditor
				activeFileName={activeFileName}
				highlightedEditorFile={highlightedEditorFile}
				onCloseEditor={onCloseEditor}
				onCloseFile={onCloseFile}
				onOpenFile={onOpenFile}
				onSelectFile={onSelectFile}
				openFileNames={openFileNames}
			/>
		</div>
	);
}
