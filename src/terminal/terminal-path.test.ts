import { describe, expect, it } from "vitest";
import { formatTerminalCwd, getTerminalFolder } from "./terminal-path";

describe("getTerminalFolder", () => {
	it("returns null for root route", () => {
		expect(getTerminalFolder("/terminal")).toBeNull();
		expect(getTerminalFolder("")).toBeNull();
	});

	it("extracts folder name from route", () => {
		expect(getTerminalFolder("/terminal/about")).toBe("about");
		expect(getTerminalFolder("/terminal/work")).toBe("work");
		expect(getTerminalFolder("/terminal/work/something")).toBe("something");
	});
});

describe("formatTerminalCwd", () => {
	it("formats root without trailing slash", () => {
		expect(formatTerminalCwd("/terminal")).toBe("~");
	});

	it("formats root with trailing slash", () => {
		expect(formatTerminalCwd("/terminal", { trailingSlash: true })).toBe("~/");
	});

	it("formats sub-route", () => {
		expect(formatTerminalCwd("/terminal/about")).toBe("~/about");
		expect(formatTerminalCwd("/terminal/work")).toBe("~/work");
	});

	it("formats nested sub-routes", () => {
		expect(formatTerminalCwd("/terminal/work/tetris")).toBe("~/work/tetris");
		expect(formatTerminalCwd("/terminal/work/tetris", { trailingSlash: true })).toBe(
			"~/work/tetris/",
		);
	});

	it("formats sub-route with trailing slash", () => {
		expect(formatTerminalCwd("/terminal/about", { trailingSlash: true })).toBe("~/about/");
	});

	it("handles empty route gracefully", () => {
		expect(formatTerminalCwd("")).toBe("~");
	});
});
