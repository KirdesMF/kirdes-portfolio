import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HelpDialog } from "#/terminal/HelpDialog";
import { installMatchMedia } from "#/test-utils/matchMedia";

function pressEscape() {
	fireEvent.keyDown(document.body, { key: "Escape" });
}

afterEach(cleanup);

describe("HelpDialog", () => {
	it("switches an open dialog between desktop dialog and mobile drawer on resize", () => {
		const media = installMatchMedia(false);
		render(<HelpDialog open onOpenChange={vi.fn()} />);

		expect(screen.getByText("/home")).toBeTruthy();
		expect(document.querySelector('[data-slot="drawer-popup"]')).toBeNull();

		media.setMatches(true);

		expect(screen.getByText("/home")).toBeTruthy();
		expect(document.querySelector('[data-slot="drawer-popup"]')).toBeTruthy();
	});

	it("calls onOpenChange from the active mobile shell", () => {
		installMatchMedia(true);
		const onOpenChange = vi.fn();
		render(<HelpDialog open onOpenChange={onOpenChange} />);

		pressEscape();

		expect(onOpenChange.mock.calls[0]?.[0]).toBe(false);
	});
});
