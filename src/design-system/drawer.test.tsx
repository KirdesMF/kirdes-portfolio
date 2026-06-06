import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHandle,
	DrawerTitle,
} from "#/design-system/drawer";

function renderOpenDrawer() {
	render(
		<Drawer open>
			<DrawerContent>
				<DrawerHandle />
				<DrawerTitle>Drawer title</DrawerTitle>
				<DrawerDescription>Drawer description</DrawerDescription>
				<div>Drawer body</div>
			</DrawerContent>
		</Drawer>,
	);
}

afterEach(cleanup);

describe("Drawer", () => {
	it("renders open content", () => {
		renderOpenDrawer();

		expect(screen.getByText("Drawer body")).toBeTruthy();
	});

	it("supports accessible title and description", () => {
		renderOpenDrawer();

		expect(screen.getByRole("heading", { name: "Drawer title" })).toBeTruthy();
		expect(screen.getByText("Drawer description").getAttribute("data-slot")).toBe(
			"drawer-description",
		);
	});

	it("adds gesture-related slots and classes", () => {
		renderOpenDrawer();

		const popup = document.querySelector('[data-slot="drawer-popup"]');
		const backdrop = document.querySelector('[data-slot="drawer-backdrop"]');
		const viewport = document.querySelector('[data-slot="drawer-viewport"]');
		const handle = document.querySelector('[data-slot="drawer-handle"]');

		expect(popup?.getAttribute("class")).toContain("touch-none");
		expect(popup?.getAttribute("class")).toContain("--drawer-swipe-movement-y");
		expect(backdrop?.getAttribute("class")).toContain("--drawer-swipe-progress");
		expect(viewport?.getAttribute("class")).toContain("touch-none");
		expect(handle?.getAttribute("class")).toContain("touch-none");
	});
});
