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

	helpOpen: boolean;
	setHelpOpen: (open: boolean) => void;

	statusOpen: boolean;
	setStatusOpen: (open: boolean) => void;
	toggleStatus: () => void;

	cursorLine: number;
	cursorColumn: number;
	cursorLineCount: number;
	setCursorPosition: (line: number, column: number) => void;
	setCursorLineCount: (count: number) => void;
	resetCursor: () => void;

	editorFocusRequest: number;
	requestEditorFocus: () => void;
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
			commandHistory: [command, ...s.commandHistory.filter((item) => item !== command)].slice(
				0,
				20,
			),
		})),

	settingsOpen: false,
	setSettingsOpen: (open) => set({ settingsOpen: open }),

	helpOpen: false,
	setHelpOpen: (open) => set({ helpOpen: open }),

	statusOpen: true,
	setStatusOpen: (open) => set({ statusOpen: open }),
	toggleStatus: () => set((s) => ({ statusOpen: !s.statusOpen })),

	cursorLine: 1,
	cursorColumn: 1,
	cursorLineCount: 1,
	setCursorPosition: (line, column) => set({ cursorLine: line, cursorColumn: column }),
	setCursorLineCount: (count) => set({ cursorLineCount: Math.max(count, 1) }),
	resetCursor: () => set({ cursorLine: 1, cursorColumn: 1 }),

	editorFocusRequest: 0,
	requestEditorFocus: () => set((s) => ({ editorFocusRequest: s.editorFocusRequest + 1 })),
}));
