import { ToggleGroup, ToggleGroupItem } from "#/design-system/toggle-group";
import { CheckIcon } from "#/icons/check";
import { getLocale, setLocale } from "#/paraglide/runtime";

const locales = [
	{ label: "FR", value: "fr" },
	{ label: "EN", value: "en" },
] as const;

export function LanguageSwitcher() {
	const currentLocale = getLocale();

	return (
		<ToggleGroup
			className="grid gap-2 sm:grid-cols-2"
			value={[currentLocale]}
			onValueChange={(value) => {
				const nextLocale = value[0];
				if (nextLocale) setLocale(nextLocale);
			}}
		>
			{locales.map((locale) => (
				<ToggleGroupItem key={locale.value} value={locale.value}>
					<span>{locale.label}</span>
					{currentLocale === locale.value && <CheckIcon className="size-3.5" />}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}
