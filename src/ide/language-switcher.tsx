import { ShimmerLabel } from "#/ide/shimmer-label";
import { getLocale, setLocale } from "#/paraglide/runtime";

function LanguageButton({
	active,
	label,
	locale,
}: {
	active: boolean;
	label: string;
	locale: "en" | "fr";
}) {
	return (
		<button className="cursor-pointer" type="button" onClick={() => setLocale(locale)}>
			{active ? <ShimmerLabel>[{label}]</ShimmerLabel> : `[${label}]`}
		</button>
	);
}

export function LanguageSwitcher() {
	const currentLocale = getLocale();

	return (
		<div className="flex items-center gap-1">
			<LanguageButton active={currentLocale === "fr"} label="FR" locale="fr" />
			<span className="text-muted-foreground/50">|</span>
			<LanguageButton active={currentLocale === "en"} label="EN" locale="en" />
		</div>
	);
}
