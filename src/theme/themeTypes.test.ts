import { describe, expect, it } from "vitest";

import { isThemePreference, resolveThemePreference } from "./themeTypes";

describe("isThemePreference", () => {
	it("accepts supported theme preferences", () => {
		expect(isThemePreference("light")).toBe(true);
		expect(isThemePreference("dark")).toBe(true);
		expect(isThemePreference("system")).toBe(true);
	});

	it("rejects unsupported values", () => {
		expect(isThemePreference("auto")).toBe(false);
		expect(isThemePreference(null)).toBe(false);
		expect(isThemePreference(undefined)).toBe(false);
	});
});

describe("resolveThemePreference", () => {
	it("returns explicit light or dark preferences", () => {
		expect(resolveThemePreference("light", true)).toBe("light");
		expect(resolveThemePreference("dark", false)).toBe("dark");
	});

	it("resolves system preference from current color scheme", () => {
		expect(resolveThemePreference("system", true)).toBe("dark");
		expect(resolveThemePreference("system", false)).toBe("light");
	});
});
