import { create } from "zustand";

type EditorMode = "normal" | "insert";

type IdeStore = {
	editorMode: EditorMode;
	setEditorMode: (mode: EditorMode) => void;

	commandMenuOpen: boolean;
	setCommandMenuOpen: (open: boolean) => void;
	toggleCommandMenu: () => void;

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
