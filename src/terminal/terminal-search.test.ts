import { describe, expect, it } from "vitest";
import { parseTerminalSearch } from "./terminal-search";

describe("parseTerminalSearch", () => {
	it("returns defaults for invalid search", () => {
		expect(parseTerminalSearch({ files: 123, panel: 456 })).toEqual({
			activeFile: undefined,
			editor: "open",
			files: [],
			maximized: undefined,
			panel: "terminal",
		});
	});

	it("normalizes file lists when editor is open", () => {
		expect(
			parseTerminalSearch({
				activeFile: "work/experience.json",
				editor: "open",
				files: "about/README.md,missing.md,work/experience.json,about/README.md",
				panel: "editor",
			}),
		).toEqual({
			activeFile: "work/experience.json",
			editor: "open",
			files: ["about/README.md", "work/experience.json"],
			maximized: undefined,
			panel: "editor",
		});
	});

	it("falls back active file to first open file", () => {
		expect(
			parseTerminalSearch({
				activeFile: "missing.md",
				editor: "open",
				files: ["contact/links.json", "~/README.md"],
			}),
		).toMatchObject({
			activeFile: "contact/links.json",
			files: ["contact/links.json", "~/README.md"],
		});
	});

	it("drops files when editor is not open", () => {
		expect(
			parseTerminalSearch({
				activeFile: "about/README.md",
				editor: "closed",
				files: "about/README.md",
			}),
		).toMatchObject({
			activeFile: undefined,
			editor: "closed",
			files: [],
		});
	});

	it("keeps known maximized values", () => {
		expect(parseTerminalSearch({ maximized: "route", panel: "route" })).toMatchObject({
			maximized: "route",
			panel: "route",
		});
	});
});
