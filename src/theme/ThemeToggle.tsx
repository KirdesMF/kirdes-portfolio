import { Monitor, Moon, Sun } from "lucide-react";
import type { ComponentType } from "react";

import { useTheme } from "./ThemeProvider";
import { type ThemePreference, themePreferences } from "./themeTypes";

const themeIcons = {
	light: Sun,
	dark: Moon,
	system: Monitor,
} satisfies Record<ThemePreference, ComponentType<{ className?: string }>>;

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<fieldset aria-label="Theme" className="inline-flex items-center gap-0.5 text-current">
			{themePreferences.map((themePreference) => {
				const Icon = themeIcons[themePreference];
				const isActive = themePreference === theme;

				return (
					<button
						aria-label={`Set ${themePreference} theme`}
						aria-pressed={isActive}
						className="inline-flex size-4 items-center justify-center rounded-sm opacity-70 transition hover:opacity-100 focus-visible:outline-2 focus-visible:outline-ring data-[active=true]:opacity-100"
						data-active={isActive}
						key={themePreference}
						type="button"
						onClick={() => setTheme(themePreference)}
					>
						<Icon className="size-3" />
					</button>
				);
			})}
		</fieldset>
	);
}
