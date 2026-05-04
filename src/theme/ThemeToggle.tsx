import { Monitor, Moon, Sun } from "lucide-react";
import type { ComponentType } from "react";

import { useTheme } from "./ThemeProvider";
import { type ThemePreference, themePreferences } from "./themeTypes";

const themeLabels: Record<ThemePreference, string> = {
	light: "Light",
	dark: "Dark",
	system: "System",
};

const themeIcons = {
	light: Sun,
	dark: Moon,
	system: Monitor,
} satisfies Record<ThemePreference, ComponentType<{ className?: string }>>;

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<fieldset
			aria-label="Theme"
			className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm"
		>
			{themePreferences.map((themePreference) => {
				const Icon = themeIcons[themePreference];
				const isActive = themePreference === theme;

				return (
					<button
						aria-pressed={isActive}
						className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
						data-active={isActive}
						key={themePreference}
						type="button"
						onClick={() => setTheme(themePreference)}
					>
						<Icon className="size-4" />
						<span>{themeLabels[themePreference]}</span>
					</button>
				);
			})}
		</fieldset>
	);
}
