import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { cn } from "#/design-system/cn";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "#/design-system/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHandle,
	DrawerPopup,
	DrawerTitle,
} from "#/design-system/drawer";
import { Separator } from "#/design-system/separator";
import { useIsMobile } from "#/design-system/use-media-query";
import { LanguageSwitcher } from "#/ide/language-switcher";
import { m } from "#/paraglide/messages";
import {
	type AppearanceMode,
	appearanceModes,
	type DarkThemeId,
	darkThemeOptions,
	type LightThemeId,
	lightThemeOptions,
	type ThemeId,
	themeLabels,
} from "#/theme/theme.types";
import { useTheme } from "#/theme/theme-provider";

const modeLabels = {
	light: "Light",
	dark: "Dark",
	system: "Auto",
} satisfies Record<AppearanceMode, string>;

const modeIcons = {
	light: SunIcon,
	dark: MoonIcon,
	system: MonitorIcon,
} satisfies Record<AppearanceMode, typeof SunIcon>;

const themePaletteSwatches = ["bg-background", "bg-primary", "bg-input", "bg-foreground"] as const;

type SettingsDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function SettingsDialog(props: SettingsDialogProps) {
	const isMobile = useIsMobile();
	if (isMobile) {
		return (
			<Drawer open={props.open} onOpenChange={props.onOpenChange}>
				<DrawerPopup className="px-3 pb-3">
					<DrawerHandle />
					<DrawerContent>
						<SettingsDialogInner Description={DrawerDescription} Title={DrawerTitle} />
					</DrawerContent>
				</DrawerPopup>
			</Drawer>
		);
	}

	return (
		<Dialog open={props.open} onOpenChange={props.onOpenChange}>
			<DialogContent className="flex">
				<SettingsDialogInner Description={DialogDescription} Title={DialogTitle} />
			</DialogContent>
		</Dialog>
	);
}

function SettingsDialogInner(props: {
	Description: typeof DialogDescription | typeof DrawerDescription;
	Title: typeof DialogTitle | typeof DrawerTitle;
}) {
	const { appearance, setAppearance } = useTheme();
	const { Description, Title } = props;

	return (
		<div className="relative flex min-h-0 flex-1 flex-col border-thin border-border bg-popover p-4 text-popover-foreground">
			<Title className="absolute top-0 inset-s-1/2 -translate-1/2 bg-popover px-2 leading-none text-primary border-x-thin border-border z-raised">
				{m.settings_title()}
			</Title>

			<div className="min-h-0 flex-1 grid gap-5 overflow-y-auto touch-auto py-3">
				<Description className="border-b border-border pb-3">
					{m.settings_description()}
				</Description>
				<section className="grid gap-2">
					<h2 className="font-medium">Language</h2>
					<LanguageSwitcher />
				</section>

				<section className="grid gap-2">
					<h2 className="font-medium">Mode</h2>
					<div className="grid gap-2 sm:grid-cols-3">
						{appearanceModes.map((mode) => {
							const ModeIcon = modeIcons[mode];
							const selected = appearance.mode === mode;

							return (
								<button
									type="button"
									className={cn(
										"flex items-center justify-between gap-2 border-thin border-border px-2 py-1.5",
										selected && "bg-primary text-primary-foreground",
									)}
									aria-pressed={selected}
									key={mode}
									onClick={() => setAppearance({ ...appearance, mode })}
								>
									<span className="flex items-center gap-2">
										<ModeIcon className="size-3.5" />
										{modeLabels[mode]}
									</span>
									{selected && <CheckIcon className="size-3.5" />}
								</button>
							);
						})}
					</div>
				</section>

				<section className="grid gap-3">
					<h2 className="font-medium">{m.settings_ide_themes()}</h2>
					<ThemeList
						label={m.settings_light_themes()}
						selectedTheme={appearance.lightTheme}
						themes={lightThemeOptions}
						onSelect={(lightTheme) => setAppearance({ ...appearance, lightTheme })}
					/>
					<Separator className="my-4" />
					<ThemeList
						label={m.settings_dark_themes()}
						selectedTheme={appearance.darkTheme}
						themes={darkThemeOptions}
						onSelect={(darkTheme) => setAppearance({ ...appearance, darkTheme })}
					/>
				</section>
			</div>
		</div>
	);
}

function ThemeList<TTheme extends LightThemeId | DarkThemeId>(props: {
	label: string;
	onSelect: (theme: TTheme) => void;
	selectedTheme: TTheme;
	themes: readonly { label: string; value: TTheme }[];
}) {
	return (
		<div className="space-y-1.5">
			<h3 className="text-muted-foreground text-xs">{props.label}</h3>
			<div className="grid gap-2">
				{props.themes.map((theme) => {
					const selected = props.selectedTheme === theme.value;

					return (
						<button
							type="button"
							className={cn(
								"flex items-center justify-between gap-3 border-thin border-border px-2 py-2 text-left",
								selected && "bg-accent text-accent-foreground",
							)}
							aria-label={`Select ${themeLabels[theme.value]}`}
							aria-pressed={selected}
							key={theme.value}
							onClick={() => props.onSelect(theme.value)}
						>
							<span className="flex min-w-0 items-center gap-3">
								<ThemePalette theme={theme.value} />
								<span className="truncate text-xs">{theme.label}</span>
							</span>
							{selected && (
								<span className="border-thin border-border px-1.5 py-0.5 text-xs">
									{m.settings_current()}
								</span>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}

function ThemePalette(props: { theme: ThemeId }) {
	return (
		<span
			className="flex overflow-hidden border-thin border-border"
			data-theme={props.theme}
			aria-hidden="true"
		>
			{themePaletteSwatches.map((className) => (
				<span className={cn("size-4", className)} key={className} />
			))}
		</span>
	);
}
