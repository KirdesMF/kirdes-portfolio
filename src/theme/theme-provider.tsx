import { useHotkeys } from "@tanstack/react-hotkeys";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { setAppearanceSettings } from "./theme.functions";
import {
	type AppearanceSettings,
	cycleThemeForMode,
	defaultResolvedMode,
	type ResolvedMode,
	resolveAppearanceMode,
	resolveThemeForMode,
	sanitizeAppearanceSettings,
	type ThemeId,
} from "./theme.types";

type ThemeContextValue = {
	appearance: AppearanceSettings;
	activeTheme: ThemeId;
	resolvedMode: ResolvedMode;
	setAppearance: (appearance: AppearanceSettings) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getPrefersDark() {
	return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyAppearance(appearance: AppearanceSettings) {
	const resolvedMode = resolveAppearanceMode(appearance.mode, getPrefersDark());
	const activeTheme = resolveThemeForMode(appearance, resolvedMode);
	const root = document.documentElement;

	root.classList.remove("light", "dark");
	root.classList.add(resolvedMode);
	root.dataset.mode = appearance.mode;
	root.dataset.theme = activeTheme;
	root.style.colorScheme = resolvedMode;

	return { activeTheme, resolvedMode };
}

function getInitialResolved(appearance: AppearanceSettings) {
	const resolvedMode = appearance.mode === "system" ? defaultResolvedMode : appearance.mode;
	return {
		activeTheme: resolveThemeForMode(appearance, resolvedMode),
		resolvedMode,
	};
}

export function ThemeProvider({
	children,
	initialAppearance,
}: {
	children: ReactNode;
	initialAppearance: AppearanceSettings;
}) {
	const safeInitialAppearance = sanitizeAppearanceSettings(initialAppearance);
	const [appearance, setAppearanceState] = useState<AppearanceSettings>(safeInitialAppearance);
	const [resolved, setResolved] = useState(() => getInitialResolved(safeInitialAppearance));

	useEffect(() => {
		setResolved(applyAppearance(appearance));
	}, [appearance]);

	useEffect(() => {
		if (appearance.mode !== "system") {
			return;
		}

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => {
			setResolved(applyAppearance(appearance));
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [appearance]);

	const setAppearance = useCallback((nextAppearance: AppearanceSettings) => {
		const safeAppearance = sanitizeAppearanceSettings(nextAppearance);

		setResolved(applyAppearance(safeAppearance));
		setAppearanceState(safeAppearance);
		setAppearanceSettings({ data: safeAppearance });
	}, []);

	const cycleTheme = useCallback(() => {
		setAppearance(cycleThemeForMode(appearance, resolved.resolvedMode));
	}, [appearance, resolved.resolvedMode, setAppearance]);

	useHotkeys([{ hotkey: "T", callback: cycleTheme }], {
		ignoreInputs: true,
		preventDefault: true,
	});

	const value = useMemo(
		() => ({
			appearance,
			activeTheme: resolved.activeTheme,
			resolvedMode: resolved.resolvedMode,
			setAppearance,
		}),
		[appearance, resolved, setAppearance],
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
