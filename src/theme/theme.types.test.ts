import { describe, expect, it } from "vitest";

import {
	cycleThemeForMode,
	isAppearanceMode,
	isDarkThemeId,
	isLightThemeId,
	resolveAppearanceMode,
	resolveThemeForMode,
	sanitizeAppearanceSettings,
} from "./theme.types";

describe("isAppearanceMode", () => {
	it("accepts supported modes", () => {
		expect(isAppearanceMode("light")).toBe(true);
		expect(isAppearanceMode("dark")).toBe(true);
		expect(isAppearanceMode("system")).toBe(true);
	});

	it("rejects unsupported values", () => {
		expect(isAppearanceMode("auto")).toBe(false);
		expect(isAppearanceMode(null)).toBe(false);
		expect(isAppearanceMode(undefined)).toBe(false);
	});
});

describe("theme id validators", () => {
	it("accept light and dark theme ids in the correct groups", () => {
		expect(isLightThemeId("github-light")).toBe(true);
		expect(isLightThemeId("tokyo-night")).toBe(false);
		expect(isDarkThemeId("tokyo-night")).toBe(true);
		expect(isDarkThemeId("github-light")).toBe(false);
	});
});

describe("resolveAppearanceMode", () => {
	it("returns explicit light or dark modes", () => {
		expect(resolveAppearanceMode("light", true)).toBe("light");
		expect(resolveAppearanceMode("dark", false)).toBe("dark");
	});

	it("resolves system mode from current color scheme", () => {
		expect(resolveAppearanceMode("system", true)).toBe("dark");
		expect(resolveAppearanceMode("system", false)).toBe("light");
	});
});

describe("resolveThemeForMode", () => {
	it("returns the configured light or dark theme", () => {
		const settings = { mode: "system", lightTheme: "ayu-light", darkTheme: "sage-dark" } as const;

		expect(resolveThemeForMode(settings, "light")).toBe("ayu-light");
		expect(resolveThemeForMode(settings, "dark")).toBe("sage-dark");
	});
});

describe("cycleThemeForMode", () => {
	const settings = {
		mode: "system",
		lightTheme: "github-light",
		darkTheme: "tokyo-night",
	} as const;

	it("cycles the light theme without changing mode or dark theme", () => {
		expect(cycleThemeForMode(settings, "light")).toEqual({
			...settings,
			lightTheme: "ayu-light",
		});
	});

	it("cycles the dark theme without changing mode or light theme", () => {
		expect(cycleThemeForMode(settings, "dark")).toEqual({
			...settings,
			darkTheme: "ayu-dark",
		});
	});

	it("wraps from the last theme to the first theme", () => {
		expect(cycleThemeForMode({ ...settings, lightTheme: "sage-light" }, "light").lightTheme).toBe(
			"original-light",
		);
		expect(cycleThemeForMode({ ...settings, darkTheme: "sage-dark" }, "dark").darkTheme).toBe(
			"original-dark",
		);
	});
});

describe("sanitizeAppearanceSettings", () => {
	it("falls back invalid settings to defaults", () => {
		expect(
			sanitizeAppearanceSettings({ mode: "auto" as never, lightTheme: "bad" as never }),
		).toEqual({
			mode: "system",
			lightTheme: "github-light",
			darkTheme: "tokyo-night",
		});
	});
});
