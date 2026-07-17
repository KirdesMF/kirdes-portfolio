import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HelpDialog } from "#/components/help-dialog/help-dialog";
import { installMatchMedia } from "#/test-utils/match-media";

afterEach(cleanup);

describe("HelpDialog", () => {
	it("renders keybinding rows on desktop", () => {
		installMatchMedia(false);
		render(<HelpDialog open onOpenChange={vi.fn()} />);

		expect(screen.getByText(":help keymaps")).toBeTruthy();
		expect(screen.getByText("Open help")).toBeTruthy();
		expect(screen.getByText("Open leader menu")).toBeTruthy();
		expect(screen.getByText("Toggle status")).toBeTruthy();
		expect(screen.getByText("Cycle theme")).toBeTruthy();
		expect(screen.queryByText("Cycle theme mode")).toBeNull();
		expect(screen.getByText("Normal mode")).toBeTruthy();
		expect(screen.getByText("Navigation")).toBeTruthy();
		expect(screen.getByText("Open Home")).toBeTruthy();
		expect(screen.getByText("Open About")).toBeTruthy();
		expect(screen.getByText("Open Works")).toBeTruthy();
		expect(screen.getByText("Open Lab")).toBeTruthy();
		expect(screen.getByText("Leader mappings")).toBeTruthy();
		expect(screen.getByText("General")).toBeTruthy();
		expect(screen.getByText("Replay intro")).toBeTruthy();
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
