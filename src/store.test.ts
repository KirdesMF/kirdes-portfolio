import { beforeEach, describe, expect, it } from "vitest";
import { useAppStore } from "./store";

const initialState = {
	shellMode: "normal" as const,
	commandMenuOpen: false,
	commandModeOpen: false,
	commandHistoryOpen: false,
	commandHistory: [] as string[],
	settingsOpen: false,
	helpOpen: false,
	statusOpen: true,
};

beforeEach(() => {
	useAppStore.setState(initialState);
});

describe("AppStore initial state", () => {
	it("has mode normal", () => {
		expect(useAppStore.getState().shellMode).toBe("normal");
	});

	it("has dialogs closed and status open", () => {
		const s = useAppStore.getState();
		expect(s.commandMenuOpen).toBe(false);
		expect(s.commandModeOpen).toBe(false);
		expect(s.commandHistoryOpen).toBe(false);
		expect(s.settingsOpen).toBe(false);
		expect(s.helpOpen).toBe(false);
		expect(s.statusOpen).toBe(true);
	});

	it("has empty histories", () => {
		const s = useAppStore.getState();
		expect(s.commandHistory).toEqual([]);
	});
});

describe("toggleCommandMenu", () => {
	it("flips false → true → false", () => {
		const { toggleCommandMenu } = useAppStore.getState();
		toggleCommandMenu();
		expect(useAppStore.getState().commandMenuOpen).toBe(true);
		toggleCommandMenu();
		expect(useAppStore.getState().commandMenuOpen).toBe(false);
	});
});

describe("toggleStatus", () => {
	it("flips true → false → true", () => {
		const { toggleStatus } = useAppStore.getState();
		toggleStatus();
		expect(useAppStore.getState().statusOpen).toBe(false);
		toggleStatus();
		expect(useAppStore.getState().statusOpen).toBe(true);
	});
});

describe("addCommandHistory", () => {
	it("adds a command to the front", () => {
		const { addCommandHistory } = useAppStore.getState();
		addCommandHistory("help");
		expect(useAppStore.getState().commandHistory).toEqual(["help"]);
	});

	it("deduplicates and moves most recent to the front", () => {
		const { addCommandHistory } = useAppStore.getState();
		addCommandHistory("help");
		addCommandHistory("ls");
		addCommandHistory("help");
		expect(useAppStore.getState().commandHistory).toEqual(["help", "ls"]);
	});

	it("caps at 20", () => {
		const { addCommandHistory } = useAppStore.getState();
		for (let i = 0; i < 25; i++) {
			addCommandHistory(`cmd-${i}`);
		}
		expect(useAppStore.getState().commandHistory).toHaveLength(20);
		expect(useAppStore.getState().commandHistory[0]).toBe("cmd-24");
	});
});
