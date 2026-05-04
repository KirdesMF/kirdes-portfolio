export const THEME_COOKIE_NAME = "theme";
export const THEME_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const themePreferences = ["light", "dark", "system"] as const;

export type ThemePreference = (typeof themePreferences)[number];
export type ResolvedTheme = "light" | "dark";

export const defaultThemePreference: ThemePreference = "system";
export const defaultResolvedTheme: ResolvedTheme = "dark";

export function isThemePreference(value: unknown): value is ThemePreference {
	return typeof value === "string" && themePreferences.includes(value as ThemePreference);
}

export function resolveThemePreference(
	preference: ThemePreference,
	prefersDark: boolean,
): ResolvedTheme {
	if (preference === "system") {
		return prefersDark ? "dark" : "light";
	}

	return preference;
}
