import { describe, expect, it } from "vitest";
import { findEditorFile, getVisibleFileNames, lsFiles, resolveFile } from "./editor-files";

describe("editor files", () => {
	it("finds files by full id case-insensitively", () => {
		expect(findEditorFile("about/route.tsx")?.id).toBe("about/route.tsx");
		expect(findEditorFile("missing.md")).toBeNull();
	});

	it("resolves absolute file paths", () => {
		expect(resolveFile("/work/experience.json")?.id).toBe("work/experience.json");
		expect(resolveFile("/work")?.id).toBeUndefined();
	});

	it("prefers current folder before root and global files", () => {
		expect(resolveFile("route.tsx", "/terminal/about")?.id).toBe("about/route.tsx");
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
		expect(ids).toContain("~/README.md");
	});

	it("returns unique visible file names", () => {
		expect(
			getVisibleFileNames("/terminal/work").filter((name) => name === "README.md"),
		).toHaveLength(1);
	});

	it("opens source files from the current implementation", () => {
		const contactSource = findEditorFile("src/browser/contact/contact-section.tsx");

		expect(contactSource?.content).toContain("linkedin.com/in/kirdesmf");
		expect(contactSource?.content).toContain('workspaceViewMetadata["/terminal/contact"]');
	});
});
