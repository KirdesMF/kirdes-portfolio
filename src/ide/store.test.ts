import { beforeEach, describe, expect, it } from "vitest";
import { useIdeStore } from "./store";

const initialState = {
	editorMode: "normal" as const,
	commandMenuOpen: false,
	commandModeOpen: false,
	commandHistoryOpen: false,
	commandHistory: [] as string[],
	settingsOpen: false,
	helpOpen: false,
	statusOpen: true,
	cursorLine: 1,
	cursorColumn: 1,
	cursorLineCount: 1,
	editorFocusRequest: 0,
};

beforeEach(() => {
	useIdeStore.setState(initialState);
});

describe("IdeStore initial state", () => {
	it("has mode normal", () => {
		expect(useIdeStore.getState().editorMode).toBe("normal");
	});

	it("has dialogs closed and status open", () => {
		const s = useIdeStore.getState();
		expect(s.commandMenuOpen).toBe(false);
		expect(s.commandModeOpen).toBe(false);
		expect(s.commandHistoryOpen).toBe(false);
		expect(s.settingsOpen).toBe(false);
		expect(s.helpOpen).toBe(false);
		expect(s.statusOpen).toBe(true);
	});

	it("has empty histories", () => {
		const s = useIdeStore.getState();
		expect(s.commandHistory).toEqual([]);
	});

	it("has cursor at line 1, column 1, count 1", () => {
		const s = useIdeStore.getState();
		expect(s.cursorLine).toBe(1);
		expect(s.cursorColumn).toBe(1);
		expect(s.cursorLineCount).toBe(1);
	});

	it("has focus request 0", () => {
		expect(useIdeStore.getState().editorFocusRequest).toBe(0);
	});
});

describe("toggleCommandMenu", () => {
	it("flips false → true → false", () => {
		const { toggleCommandMenu } = useIdeStore.getState();
		toggleCommandMenu();
		expect(useIdeStore.getState().commandMenuOpen).toBe(true);
		toggleCommandMenu();
		expect(useIdeStore.getState().commandMenuOpen).toBe(false);
	});
});

describe("toggleStatus", () => {
	it("flips true → false → true", () => {
		const { toggleStatus } = useIdeStore.getState();
		toggleStatus();
		expect(useIdeStore.getState().statusOpen).toBe(false);
		toggleStatus();
		expect(useIdeStore.getState().statusOpen).toBe(true);
	});
});

describe("addCommandHistory", () => {
	it("adds a command to the front", () => {
		const { addCommandHistory } = useIdeStore.getState();
		addCommandHistory("help");
		expect(useIdeStore.getState().commandHistory).toEqual(["help"]);
	});

	it("deduplicates and moves most recent to the front", () => {
		const { addCommandHistory } = useIdeStore.getState();
		addCommandHistory("help");
		addCommandHistory("ls");
		addCommandHistory("help");
		expect(useIdeStore.getState().commandHistory).toEqual(["help", "ls"]);
	});

	it("caps at 20", () => {
		const { addCommandHistory } = useIdeStore.getState();
		for (let i = 0; i < 25; i++) {
			addCommandHistory(`cmd-${i}`);
		}
		expect(useIdeStore.getState().commandHistory).toHaveLength(20);
		expect(useIdeStore.getState().commandHistory[0]).toBe("cmd-24");
	});
});

describe("setCursorLineCount", () => {
	it("clamps 0 to 1", () => {
		const { setCursorLineCount } = useIdeStore.getState();
		setCursorLineCount(0);
		expect(useIdeStore.getState().cursorLineCount).toBe(1);
	});

	it("stores positive values as-is", () => {
		const { setCursorLineCount } = useIdeStore.getState();
		setCursorLineCount(42);
		expect(useIdeStore.getState().cursorLineCount).toBe(42);
	});
});

describe("requestEditorFocus", () => {
	it("increments each call", () => {
		const { requestEditorFocus } = useIdeStore.getState();
		expect(useIdeStore.getState().editorFocusRequest).toBe(0);
		requestEditorFocus();
		expect(useIdeStore.getState().editorFocusRequest).toBe(1);
		requestEditorFocus();
		expect(useIdeStore.getState().editorFocusRequest).toBe(2);
	});
});
