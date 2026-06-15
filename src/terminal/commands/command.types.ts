import type { ReactNode } from "react";
import type { EditorFileEntry } from "#/editor/editor-files.types";

export type CommandHandler = (ctx: CommandContext) => boolean;

export type CommandContext = {
	/** Original command string as typed */
	raw: string;
	/** Trimmed, lowercased command */
	normalized: string;

	/** Push output to terminal history */
	pushHistory: (output: ReactNode) => void;

	/** Navigate to a route, optionally with search params */
	navigate: (to: string, search?: Record<string, unknown>) => void;
	/** Return to the boot splash route. */
	reload: () => void;

	/** Current route path (e.g. "/start", "/terminal", "/about") */
	currentRoute: string;

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

	/** Set color mode to "light" or "dark" */
	setMode: (mode: "light" | "dark") => void;
};
