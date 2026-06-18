import { describe, expect, it } from "vitest";
import { findEditorFile, getVisibleFileNames, lsFiles, resolveFile } from "./editor-files";

describe("editor files", () => {
	it("finds files by full id case-insensitively", () => {
		expect(findEditorFile("src/routes/about.md")?.id).toBe("src/routes/about.md");
		expect(findEditorFile("src/routes/CONTACT.MD")?.id).toBe("src/routes/contact.md");
		expect(findEditorFile("missing.md")).toBeNull();
	});

	it("resolves absolute file paths", () => {
		expect(resolveFile("/projects/index.md")?.id).toBe("src/routes/projects/index.md");
		expect(resolveFile("/projects/project-1.md")?.id).toBe("src/routes/projects/project-1.md");
		expect(resolveFile("/projects")?.id).toBeUndefined();
	});

	it("prefers current folder before root and global files", () => {
		expect(resolveFile("about.md", "/terminal/about")?.id).toBe("src/routes/about.md");
		expect(resolveFile("README.md", "/terminal/about")?.id).toBe("~/README.md");
		expect(resolveFile("contact.md", "/terminal/about")?.id).toBe("src/routes/contact.md");
	});

	it("lists root files at the terminal home", () => {
		const result = lsFiles("/terminal");

		expect(result.folders.map((folder) => folder.folder)).toEqual([
			"~",
			"src/routes",
			"src/routes/projects",
		]);
		expect(result.files.map((file) => file.id)).toContain("~/README.md");
		expect(result.files.map((file) => file.id)).toContain("~/ROADMAP.md");
		expect(result.files.map((file) => file.id)).not.toContain("src/routes/about.md");
	});

	it("lists local files plus root fallback files in sections", () => {
		const result = lsFiles("/terminal/contact");
		const ids = result.files.map((file) => file.id);

		expect(ids).toContain("src/routes/contact.md");
		expect(ids).toContain("~/README.md");
	});

	it("returns unique visible file names", () => {
		expect(
			getVisibleFileNames("/terminal/contact").filter((name) => name === "about.md"),
		).toHaveLength(1);
	});

	it("does not return removed files", () => {
		expect(findEditorFile("src/routes/about.tsx")).toBeNull();
		expect(findEditorFile("src/routes/contact.tsx")).toBeNull();
		expect(findEditorFile("src/routes/projects/index.tsx")).toBeNull();
	});
});
