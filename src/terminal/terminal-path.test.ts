import { describe, expect, it } from "vitest";
import { formatTerminalCwd, getTerminalFolder } from "./terminal-path";

describe("getTerminalFolder", () => {
	it("returns null for root route", () => {
		expect(getTerminalFolder("/terminal")).toBeNull();
		expect(getTerminalFolder("")).toBeNull();
	});

	it("extracts folder name from route", () => {
		expect(getTerminalFolder("/terminal/start")).toBe("~");
		expect(getTerminalFolder("/terminal/about")).toBe("about");
		expect(getTerminalFolder("/terminal/contact")).toBe("contact");
		expect(getTerminalFolder("/terminal/contact/social")).toBe("social");
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
		expect(formatTerminalCwd("/terminal/start")).toBe("~/start");
		expect(formatTerminalCwd("/terminal/about")).toBe("~/about");
		expect(formatTerminalCwd("/terminal/contact")).toBe("~/contact");
	});

	it("formats nested sub-routes", () => {
		expect(formatTerminalCwd("/terminal/contact/social")).toBe("~/contact/social");
		expect(formatTerminalCwd("/terminal/contact/social", { trailingSlash: true })).toBe(
			"~/contact/social/",
		);
	});

	it("formats sub-route with trailing slash", () => {
		expect(formatTerminalCwd("/terminal/about", { trailingSlash: true })).toBe("~/about/");
	});

	it("handles empty route gracefully", () => {
		expect(formatTerminalCwd("")).toBe("~");
	});
});
