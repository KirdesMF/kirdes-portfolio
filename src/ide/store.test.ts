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
	navigationOpen: false,
	findFileOpen: false,
	findTextOpen: false,
	recentFilesOpen: false,
	recentFiles: [] as string[],
	cursorLine: 1,
	cursorColumn: 1,
	cursorLineCount: 1,
	editorFocusRequest: 0,
	workspaceTabs: [] as import("./store").WorkspaceTab[],
	activeWorkspaceTabId: null as string | null,
};

beforeEach(() => {
	useIdeStore.setState(initialState);
});

describe("IdeStore initial state", () => {
	it("has mode normal", () => {
		expect(useIdeStore.getState().editorMode).toBe("normal");
	});

	it("has all dialog booleans false", () => {
		const s = useIdeStore.getState();
		expect(s.commandMenuOpen).toBe(false);
		expect(s.commandModeOpen).toBe(false);
		expect(s.commandHistoryOpen).toBe(false);
		expect(s.settingsOpen).toBe(false);
		expect(s.helpOpen).toBe(false);
		expect(s.navigationOpen).toBe(false);
		expect(s.findFileOpen).toBe(false);
		expect(s.findTextOpen).toBe(false);
		expect(s.recentFilesOpen).toBe(false);
	});

	it("has empty histories", () => {
		const s = useIdeStore.getState();
		expect(s.commandHistory).toEqual([]);
		expect(s.recentFiles).toEqual([]);
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

describe("addRecentFile", () => {
	it("adds a file to the front of the list", () => {
		const { addRecentFile } = useIdeStore.getState();
		addRecentFile("file-a");
		expect(useIdeStore.getState().recentFiles).toEqual(["file-a"]);
	});

	it("deduplicates and moves most recent to the front", () => {
		const { addRecentFile } = useIdeStore.getState();
		addRecentFile("file-a");
		addRecentFile("file-b");
		addRecentFile("file-a");
		expect(useIdeStore.getState().recentFiles).toEqual(["file-a", "file-b"]);
	});

	it("caps at 20", () => {
		const { addRecentFile } = useIdeStore.getState();
		for (let i = 0; i < 25; i++) {
			addRecentFile(`file-${i}`);
		}
		expect(useIdeStore.getState().recentFiles).toHaveLength(20);
		// Most recent should be at the front
		expect(useIdeStore.getState().recentFiles[0]).toBe("file-24");
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

describe("workspaceTabs", () => {
	const tabA = { id: "file-a", label: "File A", route: "/a", kind: "file" as const };
	const tabB = { id: "file-b", label: "File B", route: "/b", kind: "file" as const };

	it("starts empty", () => {
		const s = useIdeStore.getState();
		expect(s.workspaceTabs).toEqual([]);
		expect(s.activeWorkspaceTabId).toBeNull();
	});

	it("openWorkspaceTab adds and sets active", () => {
		const { openWorkspaceTab } = useIdeStore.getState();
		openWorkspaceTab(tabA);
		const s = useIdeStore.getState();
		expect(s.workspaceTabs).toEqual([tabA]);
		expect(s.activeWorkspaceTabId).toBe("file-a");
	});

	it("openWorkspaceTab deduplicates by id", () => {
		const { openWorkspaceTab } = useIdeStore.getState();
		openWorkspaceTab(tabA);
		openWorkspaceTab(tabA);
		expect(useIdeStore.getState().workspaceTabs).toHaveLength(1);
	});

	it("openWorkspaceTab sets existing tab as active without duplicating", () => {
		const { openWorkspaceTab } = useIdeStore.getState();
		openWorkspaceTab(tabA);
		openWorkspaceTab(tabB);
		openWorkspaceTab(tabA);
		const s = useIdeStore.getState();
		expect(s.workspaceTabs).toEqual([tabA, tabB]);
		expect(s.activeWorkspaceTabId).toBe("file-a");
	});

	it("closeWorkspaceTab removes a tab", () => {
		const { openWorkspaceTab, closeWorkspaceTab } = useIdeStore.getState();
		openWorkspaceTab(tabA);
		openWorkspaceTab(tabB);
		closeWorkspaceTab("file-a");
		expect(useIdeStore.getState().workspaceTabs).toEqual([tabB]);
	});

	it("closeWorkspaceTab clears activeWorkspaceTabId when closing active tab", () => {
		const { openWorkspaceTab, closeWorkspaceTab } = useIdeStore.getState();
		openWorkspaceTab(tabA);
		closeWorkspaceTab("file-a");
		const s = useIdeStore.getState();
		expect(s.workspaceTabs).toEqual([]);
		expect(s.activeWorkspaceTabId).toBeNull();
	});

	it("setActiveWorkspaceTab changes active", () => {
		const { openWorkspaceTab, setActiveWorkspaceTab } = useIdeStore.getState();
		openWorkspaceTab(tabA);
		openWorkspaceTab(tabB);
		setActiveWorkspaceTab("file-a");
		expect(useIdeStore.getState().activeWorkspaceTabId).toBe("file-a");
	});
});
