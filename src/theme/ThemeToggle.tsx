import { Monitor, Moon, Sun } from "lucide-react";
import type { ComponentType } from "react";

import { useTheme } from "./ThemeProvider";
import { type AppearanceMode, appearanceModes } from "./themeTypes";

const themeIcons = {
	light: Sun,
	dark: Moon,
	system: Monitor,
} satisfies Record<AppearanceMode, ComponentType<{ className?: string }>>;

export function ThemeToggle() {
	const { appearance, setAppearance } = useTheme();

	return (
		<fieldset aria-label="Theme" className="inline-flex items-center gap-0.5 text-current">
			{appearanceModes.map((mode) => {
				const Icon = themeIcons[mode];
				const isActive = mode === appearance.mode;

				return (
					<button
						aria-label={`Set ${mode} theme`}
						aria-pressed={isActive}
						className="inline-flex size-4 items-center justify-center rounded-sm opacity-70 transition hover:opacity-100 focus-visible:outline-2 focus-visible:outline-ring data-[active=true]:opacity-100"
						data-active={isActive}
						key={mode}
						type="button"
						onClick={() => setAppearance({ ...appearance, mode })}
					>
						<Icon className="size-3" />
					</button>
				);
			})}
		</fieldset>
	);
}
