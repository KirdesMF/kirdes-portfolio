import { create } from "zustand";

type ShellMode = "normal" | "command";

type AppStore = {
	shellMode: ShellMode;
	setShellMode: (mode: ShellMode) => void;

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
};

export const useAppStore = create<AppStore>((set) => ({
	shellMode: "normal",
	setShellMode: (mode) => set({ shellMode: mode }),

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
}));
