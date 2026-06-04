import { describe, expect, it } from "vitest";
import {
	closeEditorFileSearch,
	closeEditorSearch,
	keepTerminalSearch,
	openEditorFileSearch,
	showRoutePanelSearch,
	showTerminalPanelSearch,
} from "./terminal-search-transitions";

describe("terminal search transitions", () => {
	it("keeps existing search state while applying defaults", () => {
		expect(keepTerminalSearch({ activeFile: "~/README.md" })).toEqual({
			activeFile: "~/README.md",
			files: [],
			panel: "terminal",
		});
	});

	it("opens files without duplicating file ids", () => {
		expect(
			openEditorFileSearch(
				{ files: ["~/README.md", "about/README.md"], panel: "route" },
				"about/README.md",
			),
		).toMatchObject({
			activeFile: "about/README.md",
			editor: "open",
			files: ["~/README.md", "about/README.md"],
			panel: "editor",
		});
	});

	it("closes the editor back to the right pane", () => {
		expect(
			closeEditorSearch({ editor: "open", files: ["~/README.md"] }, { isHomeRoute: false }),
		).toMatchObject({
			activeFile: undefined,
			editor: undefined,
			files: [],
			maximized: undefined,
			panel: "route",
		});
	});

	it("selects the next active file after closing a tab", () => {
		expect(
			closeEditorFileSearch(
				{},
				{
					activeFileName: "about/README.md",
					closedFileName: "about/README.md",
					openFileNames: ["~/README.md", "about/README.md", "work/README.md"],
				},
			),
		).toMatchObject({
			activeFile: "work/README.md",
			editor: "open",
			files: ["~/README.md", "work/README.md"],
			panel: "editor",
		});
	});

	it("switches to the route pane without dropping editor state", () => {
		expect(
			showRoutePanelSearch({ activeFile: "~/README.md", editor: "open", files: ["~/README.md"] }),
		).toEqual({
			activeFile: "~/README.md",
			editor: "open",
			files: ["~/README.md"],
			panel: "route",
		});
	});

	it("clears maximized state when closing the route pane", () => {
		expect(
			showTerminalPanelSearch({
				activeFile: "~/README.md",
				editor: "open",
				files: ["~/README.md"],
				maximized: "route",
				panel: "route",
			}),
		).toEqual({
			activeFile: "~/README.md",
			editor: "open",
			files: ["~/README.md"],
			maximized: undefined,
			panel: "terminal",
		});
	});
});
