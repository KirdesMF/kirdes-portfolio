import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { StatusBox } from "#/components/status-box/status-box";
import type { WeatherData } from "#/components/status-box/status-box.functions";
import { installMatchMedia } from "#/test-utils/match-media";
import { ThemeProvider } from "#/theme/theme-provider";

afterEach(cleanup);
beforeEach(() => installMatchMedia(false));

function ControlledStatusBox({ weather }: { weather: WeatherData | null }) {
	const [open, setOpen] = useState(true);
	return (
		<ThemeProvider
			initialAppearance={{
				mode: "light",
				lightTheme: "catppuccin-latte",
				darkTheme: "tokyo-night",
			}}
		>
			<StatusBox open={open} weather={weather} onOpenChange={setOpen} />
		</ThemeProvider>
	);
}

describe("StatusBox", () => {
	it("starts open and renders server-provided weather data", () => {
		render(<ControlledStatusBox weather={{ temperature: 14.2, weatherCode: 0 }} />);

		expect(screen.getByText("STATUS")).toBeTruthy();
		expect(screen.getByText("Bussy-en-Othe, France")).toBeTruthy();
		expect(screen.getByText("Available for work")).toBeTruthy();
		expect(screen.getByTestId("location-icon")).toBeTruthy();
		expect(screen.getByText("14°C / Clear")).toBeTruthy();
		expect(screen.getByText("light / Catppuccin Latte")).toBeTruthy();
		expect(screen.getByTestId("weather-icon").getAttribute("data-weather-code")).toBe("0");
		expect(screen.queryByText(/Wind/)).toBeNull();
	});

	it("renders a distinct icon for every supported weather condition", () => {
		const weatherCases = [
			{ code: 0, label: "Clear" },
			{ code: 1, label: "Partly cloudy" },
			{ code: 3, label: "Overcast" },
			{ code: 45, label: "Fog" },
			{ code: 51, label: "Drizzle" },
			{ code: 56, label: "Freezing drizzle" },
			{ code: 61, label: "Rain" },
			{ code: 66, label: "Freezing rain" },
			{ code: 71, label: "Snow" },
			{ code: 80, label: "Rain showers" },
			{ code: 85, label: "Snow showers" },
			{ code: 95, label: "Thunderstorm" },
			{ code: 96, label: "Thunderstorm with hail" },
		];
		const paths = new Set<string>();

		for (const { code, label } of weatherCases) {
			const { unmount } = render(
				<ControlledStatusBox weather={{ temperature: 10, weatherCode: code }} />,
			);
			const path = screen.getByTestId("weather-icon").querySelector("path")?.getAttribute("d");

			expect(screen.getByText(`10°C / ${label}`)).toBeTruthy();
			expect(path).toBeTruthy();
			expect(paths.has(path ?? "")).toBe(false);
			paths.add(path ?? "");
			unmount();
		}

		expect(paths.size).toBe(weatherCases.length);
	});

	it("hides the status box and trigger on mobile", () => {
		installMatchMedia(true);
		render(<ControlledStatusBox weather={null} />);

		expect(screen.queryByRole("button", { name: "Open system status" })).toBeNull();
		expect(screen.queryByText("STATUS")).toBeNull();
	});

	it("stays open on outside click and Escape", () => {
		render(<ControlledStatusBox weather={null} />);

		const trigger = screen.getByRole("button", { name: "Open system status" });
		fireEvent.click(trigger);
		fireEvent.pointerDown(document.body);
		fireEvent.mouseDown(document.body);
		fireEvent.click(document.body);
		fireEvent.keyDown(document.body, { key: "Escape" });

		expect(trigger.getAttribute("aria-expanded")).toBe("true");
		expect(screen.getByRole("region", { name: "STATUS" })).toBeTruthy();
	});

	it("can be closed and reopened from accessible controls", () => {
		render(<ControlledStatusBox weather={null} />);

		const trigger = screen.getByRole("button", { name: "Open system status" });
		expect(trigger.getAttribute("aria-expanded")).toBe("true");

		fireEvent.click(screen.getByRole("button", { name: "Close status box" }));
		expect(trigger.getAttribute("aria-expanded")).toBe("false");

		fireEvent.click(trigger);
		expect(trigger.getAttribute("aria-expanded")).toBe("true");
	});
});
