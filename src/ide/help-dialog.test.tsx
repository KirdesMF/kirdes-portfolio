import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HelpDialog } from "#/ide/help-dialog";
import { installMatchMedia } from "#/test-utils/match-media";

afterEach(cleanup);

describe("HelpDialog", () => {
	it("renders keybinding rows on desktop", () => {
		installMatchMedia(false);
		render(<HelpDialog open onOpenChange={vi.fn()} />);

		expect(screen.getByText(":help keymaps")).toBeTruthy();
		expect(screen.getByText("Open help")).toBeTruthy();
		expect(screen.getByText("Open leader menu")).toBeTruthy();
		expect(screen.getByText("Find file")).toBeTruthy();
		expect(screen.getByText("Normal mode")).toBeTruthy();
		expect(screen.getByText("Leader mappings")).toBeTruthy();
		expect(screen.getByText("Buffer")).toBeTruthy();
	});

	it("switches to mobile drawer on resize", () => {
		const media = installMatchMedia(false);
		render(<HelpDialog open onOpenChange={vi.fn()} />);

		expect(screen.getByText("Open help")).toBeTruthy();
		expect(document.querySelector('[data-slot="drawer-popup"]')).toBeNull();

		media.setMatches(true);

		expect(screen.getByText("Open help")).toBeTruthy();
		expect(document.querySelector('[data-slot="drawer-popup"]')).toBeTruthy();
	});

	it("calls onOpenChange from Escape on mobile", () => {
		installMatchMedia(true);
		const onOpenChange = vi.fn();
		render(<HelpDialog open onOpenChange={onOpenChange} />);

		fireEvent.keyDown(document.body, { key: "Escape" });

		expect(onOpenChange.mock.calls[0]?.[0]).toBe(false);
	});

	it("calls onOpenChange from Escape on desktop", () => {
		installMatchMedia(false);
		const onOpenChange = vi.fn();
		render(<HelpDialog open onOpenChange={onOpenChange} />);

		fireEvent.keyDown(document.body, { key: "Escape" });

		expect(onOpenChange.mock.calls[0]?.[0]).toBe(false);
	});
});
