import { describe, expect, it } from "vitest";
import { findEditorFile, getVisibleFileNames, lsFiles, resolveFile } from "./editor-files";

describe("editor files", () => {
	it("finds files by full id case-insensitively", () => {
		expect(findEditorFile("about/readme.md")?.id).toBe("about/README.md");
		expect(findEditorFile("missing.md")).toBeNull();
	});

	it("resolves absolute file paths", () => {
		expect(resolveFile("/work/experience.json")?.id).toBe("work/experience.json");
		expect(resolveFile("/work")?.id).toBeUndefined();
	});

	it("prefers current folder before root and global files", () => {
		expect(resolveFile("README.md", "/terminal/about")?.id).toBe("about/README.md");
		expect(resolveFile("infos.txt", "/terminal/about")?.id).toBe("~/infos.txt");
		expect(resolveFile("links.json", "/terminal/about")?.id).toBe("contact/links.json");
	});

	it("lists root files at the terminal home", () => {
		const result = lsFiles("/terminal");

		expect(result.folders.map((folder) => folder.folder)).toEqual([
			"~",
			"about",
			"work",
			"contact",
		]);
		expect(result.files.map((file) => file.id)).toContain("~/README.md");
		expect(result.files.map((file) => file.id)).not.toContain("about/README.md");
	});

	it("lists local files plus root fallback files in sections", () => {
		const result = lsFiles("/terminal/work");
		const ids = result.files.map((file) => file.id);

		expect(ids).toContain("work/experience.json");
		expect(ids).toContain("~/infos.txt");
		expect(ids).not.toContain("~/README.md");
	});

	it("returns unique visible file names", () => {
		expect(
			getVisibleFileNames("/terminal/work").filter((name) => name === "README.md"),
		).toHaveLength(1);
	});
});
