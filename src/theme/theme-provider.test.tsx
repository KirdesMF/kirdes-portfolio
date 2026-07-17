import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installMatchMedia } from "#/test-utils/match-media";
import { ThemeProvider, useTheme } from "./theme-provider";

vi.mock("./theme.functions", () => ({
	setAppearanceSettings: vi.fn(),
}));

function ActiveTheme() {
	const { activeTheme } = useTheme();
	return <output>{activeTheme}</output>;
}

beforeEach(() => installMatchMedia(false));
afterEach(cleanup);

describe("ThemeProvider keyboard shortcut", () => {
	it("cycles through themes for the current mode when t is pressed", () => {
		render(
			<ThemeProvider
				initialAppearance={{
					mode: "light",
					lightTheme: "github-light",
					darkTheme: "tokyo-night",
				}}
			>
				<ActiveTheme />
			</ThemeProvider>,
		);

		fireEvent.keyDown(document.body, { key: "t" });
		expect(screen.getByText("ayu-light")).toBeTruthy();

		fireEvent.keyDown(document.body, { key: "t" });
		expect(screen.getByText("sage-light")).toBeTruthy();
	});

	it("uses the resolved dark mode when mode follows the system", () => {
		installMatchMedia(true);
		render(
			<ThemeProvider
				initialAppearance={{
					mode: "system",
					lightTheme: "github-light",
					darkTheme: "tokyo-night",
				}}
			>
				<ActiveTheme />
			</ThemeProvider>,
		);

		fireEvent.keyDown(document.body, { key: "t" });
		expect(screen.getByText("ayu-dark")).toBeTruthy();
	});
});
