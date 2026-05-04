import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

import { defaultThemePreference, isThemePreference, THEME_COOKIE_NAME } from "./themeTypes";

export const getInitialThemePreference = createServerFn({ method: "GET" }).handler(async () => {
	const themeCookie = getCookie(THEME_COOKIE_NAME);

	if (isThemePreference(themeCookie)) {
		return themeCookie;
	}

	return defaultThemePreference;
});
