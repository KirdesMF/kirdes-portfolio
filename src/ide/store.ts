import { create } from "zustand";

type EditorMode = "normal" | "insert" | "command";

export type WorkspaceTab = {
	id: string;
	label: string;
	route: string;
	kind: "file" | "terminal";
};

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

	contactsOpen: boolean;
	setContactsOpen: (open: boolean) => void;

	navigationOpen: boolean;
	setNavigationOpen: (open: boolean) => void;

	findFileOpen: boolean;
	setFindFileOpen: (open: boolean) => void;

	findTextOpen: boolean;
	setFindTextOpen: (open: boolean) => void;

	recentFilesOpen: boolean;
	setRecentFilesOpen: (open: boolean) => void;
	recentFiles: string[];
	addRecentFile: (fileId: string) => void;

	cursorLine: number;
	cursorColumn: number;
	cursorLineCount: number;
	setCursorPosition: (line: number, column: number) => void;
	setCursorLineCount: (count: number) => void;
	resetCursor: () => void;

	editorFocusRequest: number;
	requestEditorFocus: () => void;

	workspaceTabs: WorkspaceTab[];
	activeWorkspaceTabId: string | null;
	openWorkspaceTab: (tab: WorkspaceTab) => void;
	closeWorkspaceTab: (id: string) => void;
	setActiveWorkspaceTab: (id: string) => void;
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

	contactsOpen: false,
	setContactsOpen: (open) => set({ contactsOpen: open }),

	navigationOpen: false,
	setNavigationOpen: (open) => set({ navigationOpen: open }),

	findFileOpen: false,
	setFindFileOpen: (open) => set({ findFileOpen: open }),

	findTextOpen: false,
	setFindTextOpen: (open) => set({ findTextOpen: open }),

	recentFilesOpen: false,
	setRecentFilesOpen: (open) => set({ recentFilesOpen: open }),
	recentFiles: [],
	addRecentFile: (fileId) =>
		set((s) => ({
			recentFiles: [fileId, ...s.recentFiles.filter((id) => id !== fileId)].slice(0, 20),
		})),

	cursorLine: 1,
	cursorColumn: 1,
	cursorLineCount: 1,
	setCursorPosition: (line, column) => set({ cursorLine: line, cursorColumn: column }),
	setCursorLineCount: (count) => set({ cursorLineCount: Math.max(count, 1) }),
	resetCursor: () => set({ cursorLine: 1, cursorColumn: 1 }),

	editorFocusRequest: 0,
	requestEditorFocus: () => set((s) => ({ editorFocusRequest: s.editorFocusRequest + 1 })),

	workspaceTabs: [],
	activeWorkspaceTabId: null,
	openWorkspaceTab: (tab) =>
		set((s) => {
			const exists = s.workspaceTabs.find((t) => t.id === tab.id);
			return {
				workspaceTabs: exists ? s.workspaceTabs : [...s.workspaceTabs, tab],
				activeWorkspaceTabId: tab.id,
			};
		}),
	closeWorkspaceTab: (id) =>
		set((s) => ({
			workspaceTabs: s.workspaceTabs.filter((t) => t.id !== id),
			activeWorkspaceTabId: s.activeWorkspaceTabId === id ? null : s.activeWorkspaceTabId,
		})),
	setActiveWorkspaceTab: (id) => set({ activeWorkspaceTabId: id }),
}));
