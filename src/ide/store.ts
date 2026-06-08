import { create } from "zustand";

type IdeStore = {
	commandMenuOpen: boolean;
	setCommandMenuOpen: (open: boolean) => void;
	toggleCommandMenu: () => void;

	settingsOpen: boolean;
	setSettingsOpen: (open: boolean) => void;

	cursorLine: number;
	cursorColumn: number;
	setCursorPosition: (line: number, column: number) => void;
	resetCursor: () => void;
};

export const useIdeStore = create<IdeStore>((set) => ({
	commandMenuOpen: false,
	setCommandMenuOpen: (open) => set({ commandMenuOpen: open }),
	toggleCommandMenu: () => set((s) => ({ commandMenuOpen: !s.commandMenuOpen })),

	settingsOpen: false,
	setSettingsOpen: (open) => set({ settingsOpen: open }),

	cursorLine: 1,
	cursorColumn: 1,
	setCursorPosition: (line, column) => set({ cursorLine: line, cursorColumn: column }),
	resetCursor: () => set({ cursorLine: 1, cursorColumn: 1 }),
}));
