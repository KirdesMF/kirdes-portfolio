import { describe, expect, it } from "vitest";
import { classifyLinkUrl, findMarkdownLinkRanges, resolveMarkdownFileLink } from "./markdown-links";

describe("findMarkdownLinkRanges", () => {
	it("finds a single link", () => {
		expect(findMarkdownLinkRanges("[hello](world.md)")).toEqual([
			{ start: 0, end: 17, url: "world.md" },
		]);
	});

	it("finds multiple links on one line", () => {
		const ranges = findMarkdownLinkRanges("[a](b.md) and [c](d.md)");
		expect(ranges).toHaveLength(2);
		expect(ranges[0]).toEqual({ start: 0, end: 9, url: "b.md" });
		expect(ranges[1]).toEqual({ start: 14, end: 23, url: "d.md" });
	});

	it("returns empty array for text with no links", () => {
		expect(findMarkdownLinkRanges("plain text")).toEqual([]);
	});

	it("handles empty link text", () => {
		expect(findMarkdownLinkRanges("[](url.md)")).toEqual([{ start: 0, end: 10, url: "url.md" }]);
	});

	it("does not match image syntax", () => {
		expect(findMarkdownLinkRanges("![alt](img.png)")).toEqual([]);
	});

	it("finds link after image on same line", () => {
		const ranges = findMarkdownLinkRanges("![img](a.png) [link](b.md)");
		expect(ranges).toEqual([{ start: 14, end: 26, url: "b.md" }]);
	});
});

describe("classifyLinkUrl", () => {
	it("classifies https as external", () => {
		expect(classifyLinkUrl("https://example.com")).toBe("external");
	});

	it("classifies http as external", () => {
		expect(classifyLinkUrl("http://example.com")).toBe("external");
	});

	it("classifies mailto as external", () => {
		expect(classifyLinkUrl("mailto:test@example.com")).toBe("external");
	});

	it("classifies javascript as unsafe", () => {
		expect(classifyLinkUrl("javascript:alert(1)")).toBe("unsafe");
	});

	it("classifies data as unsafe", () => {
		expect(classifyLinkUrl("data:text/html,<script>alert(1)</script>")).toBe("unsafe");
	});

	it("classifies vbscript as unsafe", () => {
		expect(classifyLinkUrl("vbscript:msgbox(1)")).toBe("unsafe");
	});

	it("classifies protocol-relative URLs as unsafe", () => {
		expect(classifyLinkUrl("//example.com/path")).toBe("unsafe");
	});

	it("classifies absolute path with extension as internal-file", () => {
		expect(classifyLinkUrl("/about/README.md")).toBe("internal-file");
	});

	it("classifies allowlisted absolute path without extension as app-route", () => {
		expect(classifyLinkUrl("/terminal")).toBe("app-route");
	});

	it("does not classify unknown extensionless paths as app routes", () => {
		expect(classifyLinkUrl("/missing")).toBe("internal-file");
	});

	it("classifies relative path as internal-file", () => {
		expect(classifyLinkUrl("./other.md")).toBe("internal-file");
	});

	it("classifies bare filename as internal-file", () => {
		expect(classifyLinkUrl("README.md")).toBe("internal-file");
	});

	it("classifies anchor link as internal-file", () => {
		expect(classifyLinkUrl("#section")).toBe("internal-file");
	});
});

describe("resolveMarkdownFileLink", () => {
	it("resolves relative links against the current file folder", () => {
		expect(resolveMarkdownFileLink("./atlas-notes.md", "projects/index.md")?.id).toBe(
			"projects/atlas-notes.md",
		);
	});

	it("resolves relative links with hash fragments", () => {
		expect(resolveMarkdownFileLink("./atlas-notes.md#intro", "projects/index.md")?.id).toBe(
			"projects/atlas-notes.md",
		);
	});

	it("resolves relative links with search params", () => {
		expect(resolveMarkdownFileLink("./atlas-notes.md?view=raw", "projects/index.md")?.id).toBe(
			"projects/atlas-notes.md",
		);
	});

	it("does not resolve external links as editor files", () => {
		expect(resolveMarkdownFileLink("https://example.com", "projects/index.md")).toBeNull();
	});

	it("does not resolve unsafe links as editor files", () => {
		expect(resolveMarkdownFileLink("javascript:alert(1)", "projects/index.md")).toBeNull();
	});
});
