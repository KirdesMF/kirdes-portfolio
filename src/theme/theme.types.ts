export const THEME_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const MODE_COOKIE_NAME = "theme-mode";
export const LIGHT_THEME_COOKIE_NAME = "light-theme";
export const DARK_THEME_COOKIE_NAME = "dark-theme";

export const appearanceModes = ["light", "dark", "system"] as const;
export const lightThemeIds = [
	"original-light",
	"catppuccin-latte",
	"nord-snow-storm",
	"github-light",
	"ayu-light",
	"sage-light",
] as const;
export const darkThemeIds = [
	"original-dark",
	"catppuccin-mocha",
	"nord-polar-night",
	"tokyo-night",
	"ayu-dark",
	"sage-dark",
] as const;
export const themeIds = [...lightThemeIds, ...darkThemeIds] as const;

export type AppearanceMode = (typeof appearanceModes)[number];
export type ResolvedMode = Exclude<AppearanceMode, "system">;
export type LightThemeId = (typeof lightThemeIds)[number];
export type DarkThemeId = (typeof darkThemeIds)[number];
export type ThemeId = (typeof themeIds)[number];

export type AppearanceSettings = {
	mode: AppearanceMode;
	lightTheme: LightThemeId;
	darkTheme: DarkThemeId;
};

export const lightThemeOptions = [
	{ value: "original-light", label: "Original Light" },
	{ value: "catppuccin-latte", label: "Catppuccin Latte" },
	{ value: "nord-snow-storm", label: "Nord Snow Storm" },
	{ value: "github-light", label: "GitHub Light" },
	{ value: "ayu-light", label: "Ayu Light" },
	{ value: "sage-light", label: "Sage Light" },
] as const satisfies readonly { value: LightThemeId; label: string }[];

export const darkThemeOptions = [
	{ value: "original-dark", label: "Original Dark" },
	{ value: "catppuccin-mocha", label: "Catppuccin Mocha" },
	{ value: "nord-polar-night", label: "Nord Polar Night" },
	{ value: "tokyo-night", label: "Tokyo Night" },
	{ value: "ayu-dark", label: "Ayu Dark" },
	{ value: "sage-dark", label: "Sage Dark" },
] as const satisfies readonly { value: DarkThemeId; label: string }[];

export const themeLabels = {
	"original-light": "Original Light",
	"catppuccin-latte": "Catppuccin Latte",
	"nord-snow-storm": "Nord Snow Storm",
	"github-light": "GitHub Light",
	"ayu-light": "Ayu Light",
	"sage-light": "Sage Light",
	"original-dark": "Original Dark",
	"catppuccin-mocha": "Catppuccin Mocha",
	"nord-polar-night": "Nord Polar Night",
	"tokyo-night": "Tokyo Night",
	"ayu-dark": "Ayu Dark",
	"sage-dark": "Sage Dark",
} as const satisfies Record<ThemeId, string>;

export const defaultAppearanceMode = "system" satisfies AppearanceMode;
export const defaultLightTheme = "github-light" satisfies LightThemeId;
export const defaultDarkTheme = "tokyo-night" satisfies DarkThemeId;
export const defaultResolvedMode = "dark" satisfies ResolvedMode;

export const defaultAppearanceSettings = {
	mode: defaultAppearanceMode,
	lightTheme: defaultLightTheme,
	darkTheme: defaultDarkTheme,
} as const satisfies AppearanceSettings;

export function isAppearanceMode(value: unknown): value is AppearanceMode {
	return typeof value === "string" && appearanceModes.includes(value as AppearanceMode);
}

export function isLightThemeId(value: unknown): value is LightThemeId {
	return typeof value === "string" && lightThemeIds.includes(value as LightThemeId);
}

export function isDarkThemeId(value: unknown): value is DarkThemeId {
	return typeof value === "string" && darkThemeIds.includes(value as DarkThemeId);
}

export function isThemeId(value: unknown): value is ThemeId {
	return typeof value === "string" && themeIds.includes(value as ThemeId);
}

export function resolveAppearanceMode(mode: AppearanceMode, prefersDark: boolean): ResolvedMode {
	if (mode === "system") {
		return prefersDark ? "dark" : "light";
	}

	return mode;
}

export function resolveThemeForMode(
	settings: AppearanceSettings,
	resolvedMode: ResolvedMode,
): ThemeId {
	return resolvedMode === "dark" ? settings.darkTheme : settings.lightTheme;
}

export function cycleThemeForMode(
	settings: AppearanceSettings,
	resolvedMode: ResolvedMode,
): AppearanceSettings {
	if (resolvedMode === "dark") {
		const currentIndex = darkThemeIds.indexOf(settings.darkTheme);
		return {
			...settings,
			darkTheme: darkThemeIds[(currentIndex + 1) % darkThemeIds.length] ?? defaultDarkTheme,
		};
	}

	const currentIndex = lightThemeIds.indexOf(settings.lightTheme);
	return {
		...settings,
		lightTheme: lightThemeIds[(currentIndex + 1) % lightThemeIds.length] ?? defaultLightTheme,
	};
}

export function sanitizeAppearanceSettings(settings: {
	mode?: unknown;
	lightTheme?: unknown;
	darkTheme?: unknown;
}): AppearanceSettings {
	return {
		mode: isAppearanceMode(settings.mode) ? settings.mode : defaultAppearanceMode,
		lightTheme: isLightThemeId(settings.lightTheme) ? settings.lightTheme : defaultLightTheme,
		darkTheme: isDarkThemeId(settings.darkTheme) ? settings.darkTheme : defaultDarkTheme,
	};
}
