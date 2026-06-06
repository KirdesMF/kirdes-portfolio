import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SettingsDialog } from "#/settings-dialog";
import { installMatchMedia } from "#/test-utils/matchMedia";
import { ThemeProvider } from "#/theme/ThemeProvider";
import { defaultAppearanceSettings } from "#/theme/themeTypes";

vi.mock("#/theme/theme.functions", () => ({
	setAppearanceSettings: vi.fn(),
}));

function renderWithTheme(children: ReactNode) {
	return render(
		<ThemeProvider initialAppearance={defaultAppearanceSettings}>{children}</ThemeProvider>,
	);
}

afterEach(cleanup);

describe("SettingsDialog", () => {
	it("switches an open dialog between desktop dialog and mobile drawer on resize", () => {
		const media = installMatchMedia(false);
		renderWithTheme(<SettingsDialog open onOpenChange={vi.fn()} />);

		expect(screen.getByText("Mode")).toBeTruthy();
		expect(document.querySelector('[data-slot="drawer-popup"]')).toBeNull();

		media.setMatches(true);

		expect(screen.getByText("Mode")).toBeTruthy();
		expect(document.querySelector('[data-slot="drawer-popup"]')).toBeTruthy();
	});

	it("keeps settings selections working in the mobile drawer", () => {
		installMatchMedia(true);
		renderWithTheme(<SettingsDialog open onOpenChange={vi.fn()} />);

		const darkButton = screen.getByRole("button", { name: "Dark" });
		fireEvent.click(darkButton);

		expect(darkButton.getAttribute("aria-pressed")).toBe("true");
		expect(document.documentElement.dataset.mode).toBe("dark");
	});

	it("calls onOpenChange from the active mobile shell", () => {
		installMatchMedia(true);
		const onOpenChange = vi.fn();
		renderWithTheme(<SettingsDialog open onOpenChange={onOpenChange} />);

		fireEvent.keyDown(document.body, { key: "Escape" });

		expect(onOpenChange.mock.calls[0]?.[0]).toBe(false);
	});
});
