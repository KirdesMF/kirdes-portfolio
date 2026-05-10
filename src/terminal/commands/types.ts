import type { ReactNode } from "react";
import type { EditorFileEntry } from "#/editor/editor-files";

export type CommandHandler = (ctx: CommandContext) => boolean;

export type CommandContext = {
	/** Original command string as typed */
	raw: string;
	/** Trimmed, lowercased command */
	normalized: string;

	/** Push output to terminal history */
	pushHistory: (output: ReactNode) => void;

	/** Router instance for navigation */
	navigate: (to: string, search?: Record<string, unknown>) => void;

	/** Current terminal route path */
	currentRoute: string;

	/** Whether we're at the home route (~) */
	isHomeRoute: boolean;

	/** Currently active file id in the editor */
	activeFileName?: string;

	/** Currently open file ids */
	openFileNames: Array<string>;

	/** Open a file in the editor by name (context-resolved). Returns true if found. */
	openFile: (name: string) => boolean;
	/** Close a file by its id */
	closeFile: (id: string) => void;
	/** Close the entire editor panel */
	closeEditor: () => void;
	/** Open the editor panel */
	openEditor: () => void;

	/** Resolve a filename to a file entry (context-aware) */
	resolveFile: (name: string, route?: string) => EditorFileEntry | null;
	/** List files visible from the current route */
	lsFiles: (route?: string) => {
		folders: ReadonlyArray<{ folder: string; label: string; route: string }>;
		files: ReadonlyArray<EditorFileEntry>;
	};

	/** Raw command history (for `history` command) */
	commandHistory: Array<string>;
	/** Clear terminal display history */
	clearHistory: () => void;

	/** Open a dialog by name */
	openDialog: (name: "music") => void;
};
