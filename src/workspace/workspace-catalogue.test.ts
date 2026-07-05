import { describe, expect, it } from "vitest";
import { workspaceViewMetadata } from "./workspace-catalogue";

describe("workspace catalogue", () => {
	it("has metadata keyed by view.route", () => {
		expect(workspaceViewMetadata["/home"]).toBeDefined();
	});
});
