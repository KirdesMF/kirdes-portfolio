import { CheckIcon, MonitorIcon, MoonIcon, SunIcon, XIcon } from "lucide-react";
import { cn } from "#/design-system/cn";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/design-system/dialog";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerHandle,
	DrawerPopup,
	DrawerTitle,
} from "#/design-system/drawer";
import { RadioGroup, RadioGroupIndicator, RadioGroupItem } from "#/design-system/radio-group";
import { Separator } from "#/design-system/separator";
import { ToggleGroup, ToggleGroupItem } from "#/design-system/toggle-group";
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
						<SettingsDialogInner
							Close={DrawerClose}
							Description={DrawerDescription}
							Title={DrawerTitle}
						/>
					</DrawerContent>
				</DrawerPopup>
			</Drawer>
		);
	}

	return (
		<Dialog open={props.open} onOpenChange={props.onOpenChange}>
			<DialogContent className="flex">
				<SettingsDialogInner
					Close={DialogClose}
					Description={DialogDescription}
					Title={DialogTitle}
				/>
			</DialogContent>
		</Dialog>
	);
}

function SettingsDialogInner(props: {
	Close: typeof DialogClose | typeof DrawerClose;
	Description: typeof DialogDescription | typeof DrawerDescription;
	Title: typeof DialogTitle | typeof DrawerTitle;
}) {
	const { appearance, setAppearance } = useTheme();
	const { Close, Description, Title } = props;

	return (
		<div className="relative flex min-h-0 flex-1 flex-col border-thin border-border bg-popover p-4 text-popover-foreground">
			<Title className="absolute top-0 inset-s-1/2 -translate-1/2 bg-popover px-2 leading-none text-primary border-x-thin border-border z-raised">
				{m.settings_title()}
			</Title>
			<Close
				aria-label="Close dialog"
				className="absolute top-0 end-3 z-raised -translate-y-1/2 bg-popover px-1 text-primary leading-none focus:text-accent-foreground focus:outline-none"
			>
				<span aria-hidden="true" className="flex items-center">
					[<XIcon className="size-3" />]
				</span>
			</Close>

			<div className="min-h-0 flex-1 grid gap-5 overflow-y-auto touch-auto px-1 py-3">
				<Description className="border-b border-border pb-3">
					{m.settings_description()}
				</Description>
				<section className="grid gap-2">
					<h2 className="font-medium">Language</h2>
					<LanguageSwitcher />
				</section>

				<section className="grid gap-2">
					<h2 className="font-medium">Mode</h2>
					<ToggleGroup
						className="grid gap-2 sm:grid-cols-3"
						value={[appearance.mode]}
						onValueChange={(value) => {
							const mode = value[0];
							if (mode) setAppearance({ ...appearance, mode });
						}}
					>
						{appearanceModes.map((mode) => {
							const ModeIcon = modeIcons[mode];

							return (
								<ToggleGroupItem key={mode} value={mode}>
									<span className="flex items-center gap-2">
										<ModeIcon className="size-3.5" />
										{modeLabels[mode]}
									</span>
									{appearance.mode === mode && <CheckIcon className="size-3.5" />}
								</ToggleGroupItem>
							);
						})}
					</ToggleGroup>
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
			<RadioGroup<TTheme> value={props.selectedTheme} onValueChange={props.onSelect}>
				{props.themes.map((theme) => (
					<RadioGroupItem
						aria-label={`Select ${themeLabels[theme.value]}`}
						key={theme.value}
						value={theme.value}
					>
						<span className="flex min-w-0 items-center gap-3">
							<ThemePalette theme={theme.value} />
							<span className="truncate text-xs">{theme.label}</span>
						</span>
						<RadioGroupIndicator>
							<CheckIcon className="size-3.5" />
						</RadioGroupIndicator>
					</RadioGroupItem>
				))}
			</RadioGroup>
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
