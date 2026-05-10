import { cn } from "#/design-system/cn";
import type { EditorFileName } from "./editor-files";
import { ReadOnlyFileEditor } from "./ReadOnlyFileEditor";

export function EditorPane({
	activeFileName,
	className,
	onCloseEditor,
	onCloseFile,
	onOpenFile,
	onSelectFile,
	openFileNames,
}: {
	activeFileName?: EditorFileName;
	className?: string;
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
				onCloseEditor={onCloseEditor}
				onCloseFile={onCloseFile}
				onOpenFile={onOpenFile}
				onSelectFile={onSelectFile}
				openFileNames={openFileNames}
			/>
		</div>
	);
}
