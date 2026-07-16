import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { StatusBox } from "#/ide/status-box";
import type { WeatherData } from "#/ide/status-box.functions";

afterEach(cleanup);

function ControlledStatusBox({ weather }: { weather: WeatherData | null }) {
	const [open, setOpen] = useState(true);
	return <StatusBox open={open} weather={weather} onOpenChange={setOpen} />;
}

describe("StatusBox", () => {
	it("starts open and renders server-provided weather data", () => {
		render(<ControlledStatusBox weather={{ temperature: 14.2, weatherCode: 0 }} />);

		expect(screen.getByText("STATUS")).toBeTruthy();
		expect(screen.getByText("Bussy-en-Othe, France")).toBeTruthy();
		expect(screen.getByText("Available for work")).toBeTruthy();
		expect(screen.getByTestId("location-icon")).toBeTruthy();
		expect(screen.getByText("14°C / Clear")).toBeTruthy();
		expect(screen.getByTestId("weather-icon").getAttribute("data-weather-code")).toBe("0");
		expect(screen.queryByText(/Wind/)).toBeNull();
	});

	it("can be closed and reopened from accessible controls", () => {
		render(<ControlledStatusBox weather={null} />);

		const trigger = screen.getByRole("button", { name: "Toggle system status" });
		expect(trigger.getAttribute("aria-expanded")).toBe("true");

		fireEvent.click(screen.getByRole("button", { name: "Close status box" }));
		expect(trigger.getAttribute("aria-expanded")).toBe("false");

		fireEvent.click(trigger);
		expect(trigger.getAttribute("aria-expanded")).toBe("true");
	});
});
