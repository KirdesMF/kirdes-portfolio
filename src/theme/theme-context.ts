import { createContext } from "react";

import type { AppearanceSettings, ResolvedMode, ThemeId } from "./theme.types";

export type ThemeContextValue = {
	appearance: AppearanceSettings;
	activeTheme: ThemeId;
	resolvedMode: ResolvedMode;
	setAppearance: (appearance: AppearanceSettings) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
