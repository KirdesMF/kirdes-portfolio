import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
	defaultResolvedTheme,
	isThemePreference,
	type ResolvedTheme,
	resolveThemePreference,
	THEME_COOKIE_MAX_AGE_SECONDS,
	THEME_COOKIE_NAME,
	type ThemePreference,
} from "./themeTypes";

type ThemeContextValue = {
	theme: ThemePreference;
	resolvedTheme: ResolvedTheme;
	setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getPrefersDark() {
	return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(preference: ThemePreference) {
	const resolvedTheme = resolveThemePreference(preference, getPrefersDark());
	const root = document.documentElement;

	root.classList.remove("light", "dark");
	root.classList.add(resolvedTheme);
	root.dataset.theme = preference;
	root.style.colorScheme = resolvedTheme;

	return resolvedTheme;
}

function persistTheme(preference: ThemePreference) {
	// biome-ignore lint/suspicious/noDocumentCookie: Theme cookie must be visible to SSR on the next request.
	document.cookie = `${THEME_COOKIE_NAME}=${encodeURIComponent(
		preference,
	)}; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function ThemeProvider({
	children,
	initialTheme,
}: {
	children: ReactNode;
	initialTheme: ThemePreference;
}) {
	const safeInitialTheme = isThemePreference(initialTheme) ? initialTheme : "system";
	const [theme, setThemeState] = useState<ThemePreference>(safeInitialTheme);
	const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
		safeInitialTheme === "system" ? defaultResolvedTheme : safeInitialTheme,
	);

	useEffect(() => {
		setResolvedTheme(applyTheme(theme));
	}, [theme]);

	useEffect(() => {
		if (theme !== "system") {
			return;
		}

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => {
			setResolvedTheme(applyTheme("system"));
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme]);

	const setTheme = useCallback((nextTheme: ThemePreference) => {
		if (!isThemePreference(nextTheme)) {
			return;
		}

		setResolvedTheme(applyTheme(nextTheme));
		setThemeState(nextTheme);
		persistTheme(nextTheme);
	}, []);

	const value = useMemo(
		() => ({ theme, resolvedTheme, setTheme }),
		[theme, resolvedTheme, setTheme],
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const value = useContext(ThemeContext);

	if (value === null) {
		throw new Error("useTheme must be used within ThemeProvider");
	}

	return value;
}
