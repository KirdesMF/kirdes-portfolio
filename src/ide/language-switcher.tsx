import { animate, createScope } from "animejs";
import { useEffect, useRef } from "react";
import { Separator } from "#/design-system/separator";
import { getLocale, setLocale } from "#/paraglide/runtime";

const activeLanguageClassName =
	"inline-block bg-linear-to-r from-status-open from-35% via-status-shimmer via-60% to-status-open to-55% bg-size-[200%_100%] bg-clip-text leading-none text-transparent";

function ActiveLanguageLabel({ label }: { label: string }) {
	const labelRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const el = labelRef.current;
		if (!el) return;

		const scope = createScope({
			mediaQueries: {
				reduceMotion: "(prefers-reduced-motion)",
			},
		}).add((self) => {
			const reduceMotion = self?.matches.reduceMotion ?? false;

			animate(el, {
				backgroundPosition: ["200%", "-200%"],
				duration: reduceMotion ? 0 : 4000,
				ease: "linear",
				loop: true,
			});
		});

		return () => {
			scope.revert();
		};
	}, []);

	return (
		<span className={activeLanguageClassName} ref={labelRef}>
			{label}
		</span>
	);
}

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
			{active ? <ActiveLanguageLabel label={`[${label}]`} /> : `[${label}]`}
		</button>
	);
}

export function LanguageSwitcher() {
	const currentLocale = getLocale();

	return (
		<div className="flex items-center gap-1">
			<LanguageButton active={currentLocale === "fr"} label="FR" locale="fr" />
			<Separator className="h-3" orientation="vertical" />
			<LanguageButton active={currentLocale === "en"} label="EN" locale="en" />
		</div>
	);
}
