import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";

import {
	DARK_THEME_COOKIE_NAME,
	LIGHT_THEME_COOKIE_NAME,
	MODE_COOKIE_NAME,
	THEME_COOKIE_MAX_AGE_SECONDS,
	type AppearanceSettings,
	sanitizeAppearanceSettings,
} from "./themeTypes";

export const getInitialAppearanceSettings = createServerFn({ method: "GET" }).handler(async () =>
	sanitizeAppearanceSettings({
		mode: getCookie(MODE_COOKIE_NAME),
		lightTheme: getCookie(LIGHT_THEME_COOKIE_NAME),
		darkTheme: getCookie(DARK_THEME_COOKIE_NAME),
	}),
);

export const setAppearanceSettings = createServerFn({ method: "POST" })
	.inputValidator((data: unknown): AppearanceSettings =>
		sanitizeAppearanceSettings((data ?? {}) as Partial<AppearanceSettings>),
	)
	.handler(({ data }) => {
		const options = { maxAge: THEME_COOKIE_MAX_AGE_SECONDS, path: "/", sameSite: "lax" } as const;

		setCookie(MODE_COOKIE_NAME, data.mode, options);
		setCookie(LIGHT_THEME_COOKIE_NAME, data.lightTheme, options);
		setCookie(DARK_THEME_COOKIE_NAME, data.darkTheme, options);
	});
