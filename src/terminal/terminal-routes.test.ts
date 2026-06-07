import { describe, expect, it } from "vitest";
import {
	getTerminalRoutePath,
	parseTerminalRoute,
	parseTerminalRouteTarget,
} from "./terminal-routes";

describe("terminal routes", () => {
	it("parses route targets", () => {
		expect(parseTerminalRouteTarget("about")).toBe("/terminal/about");
		expect(parseTerminalRouteTarget("/about")).toBe("/terminal/about");
		expect(parseTerminalRouteTarget("/home")).toBe("/terminal/home");
		expect(parseTerminalRouteTarget("~")).toBe("/terminal/home");
		expect(parseTerminalRouteTarget("")).toBe("/terminal/home");
		expect(parseTerminalRouteTarget("missing")).toBeNull();
	});

	it("only parses slash-prefixed route commands", () => {
		expect(parseTerminalRoute("/work")).toBe("/terminal/work");
		expect(parseTerminalRoute("work")).toBeNull();
		expect(parseTerminalRoute("help")).toBeNull();
	});

	it("normalizes browser pathnames to known terminal routes", () => {
		expect(getTerminalRoutePath("/terminal/contact")).toBe("/terminal/contact");
		expect(getTerminalRoutePath("/terminal/work/project")).toBe("/terminal/home");
		expect(getTerminalRoutePath("/unknown")).toBe("/terminal/home");
		expect(getTerminalRoutePath("/terminal")).toBe("/terminal");
	});
});
