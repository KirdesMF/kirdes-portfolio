import { describe, expect, it } from "vitest";
import {
	getTerminalRoutePath,
	parseTerminalRoute,
	parseTerminalRouteTarget,
} from "./terminal-routes";

describe("terminal routes", () => {
	it("parses route targets", () => {
		expect(parseTerminalRouteTarget("about")).toBe("/about");
		expect(parseTerminalRouteTarget("/about")).toBe("/about");
		expect(parseTerminalRouteTarget("/home")).toBe("/editor");
		expect(parseTerminalRouteTarget("~")).toBe("/editor");
		expect(parseTerminalRouteTarget("")).toBe("/editor");
		expect(parseTerminalRouteTarget("missing")).toBeNull();
	});

	it("only parses slash-prefixed route commands", () => {
		expect(parseTerminalRoute("/work")).toBe("/work");
		expect(parseTerminalRoute("work")).toBeNull();
		expect(parseTerminalRoute("help")).toBeNull();
	});

	it("normalizes browser pathnames to known terminal routes", () => {
		expect(getTerminalRoutePath("/contact")).toBe("/contact");
		expect(getTerminalRoutePath("/unknown")).toBe("/editor");
		expect(getTerminalRoutePath("/terminal")).toBe("/editor");
	});
});
