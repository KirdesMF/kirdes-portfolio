import { create } from "zustand";

type EditorMode = "normal" | "insert" | "command";

type IdeStore = {
	editorMode: EditorMode;
	setEditorMode: (mode: EditorMode) => void;

	commandMenuOpen: boolean;
	setCommandMenuOpen: (open: boolean) => void;
	toggleCommandMenu: () => void;

	commandModeOpen: boolean;
	setCommandModeOpen: (open: boolean) => void;
	commandHistoryOpen: boolean;
	setCommandHistoryOpen: (open: boolean) => void;
	commandHistory: string[];
	addCommandHistory: (command: string) => void;

	settingsOpen: boolean;
	setSettingsOpen: (open: boolean) => void;

	findFileOpen: boolean;
	setFindFileOpen: (open: boolean) => void;

	findTextOpen: boolean;
	setFindTextOpen: (open: boolean) => void;

	cursorLine: number;
	cursorColumn: number;
	setCursorPosition: (line: number, column: number) => void;
	resetCursor: () => void;
};

export const useIdeStore = create<IdeStore>((set) => ({
	editorMode: "normal",
	setEditorMode: (mode) => set({ editorMode: mode }),

	commandMenuOpen: false,
	setCommandMenuOpen: (open) => set({ commandMenuOpen: open }),
	toggleCommandMenu: () => set((s) => ({ commandMenuOpen: !s.commandMenuOpen })),

	commandModeOpen: false,
	setCommandModeOpen: (open) => set({ commandModeOpen: open }),
	commandHistoryOpen: false,
	setCommandHistoryOpen: (open) => set({ commandHistoryOpen: open }),
	commandHistory: [],
	addCommandHistory: (command) =>
		set((s) => ({
			commandHistory: [command, ...s.commandHistory.filter((item) => item !== command)].slice(0, 20),
		})),

	settingsOpen: false,
	setSettingsOpen: (open) => set({ settingsOpen: open }),

	findFileOpen: false,
	setFindFileOpen: (open) => set({ findFileOpen: open }),

	findTextOpen: false,
	setFindTextOpen: (open) => set({ findTextOpen: open }),

	cursorLine: 1,
	cursorColumn: 1,
	setCursorPosition: (line, column) => set({ cursorLine: line, cursorColumn: column }),
	resetCursor: () => set({ cursorLine: 1, cursorColumn: 1 }),
}));
