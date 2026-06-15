import { describe, expect, it } from "vitest";
import { workspaceViewMetadata } from "./workspace-catalogue";

describe("workspace catalogue", () => {
	it("has metadata keyed by view.route", () => {
		expect(workspaceViewMetadata["/start"]).toBeDefined();
		expect(workspaceViewMetadata["/about"]).toBeDefined();
		expect(workspaceViewMetadata["/contact"]).toBeDefined();
	});

	it("does not have metadata keyed with /terminal prefix", () => {
		expect(workspaceViewMetadata["/terminal/start"]).toBeUndefined();
		expect(workspaceViewMetadata["/terminal/about"]).toBeUndefined();
		expect(workspaceViewMetadata["/terminal/contact"]).toBeUndefined();
	});
});
