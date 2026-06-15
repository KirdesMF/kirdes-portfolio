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
		expect(parseTerminalRouteTarget("/start")).toBe("/start");
		expect(parseTerminalRouteTarget("~")).toBe("/start");
		expect(parseTerminalRouteTarget("")).toBe("/start");
		expect(parseTerminalRouteTarget("missing")).toBeNull();
	});

	it("only parses slash-prefixed route commands", () => {
		expect(parseTerminalRoute("/about")).toBe("/about");
		expect(parseTerminalRoute("about")).toBeNull();
		expect(parseTerminalRoute("help")).toBeNull();
	});

	it("normalizes browser pathnames to known terminal routes", () => {
		expect(getTerminalRoutePath("/contact")).toBe("/contact");
		expect(getTerminalRoutePath("/unknown")).toBe("/start");
		expect(getTerminalRoutePath("/terminal")).toBe("/start");
	});
});
