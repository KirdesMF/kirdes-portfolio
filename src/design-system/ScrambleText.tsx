import { animate, createScope } from "animejs";
import { scrambleText } from "animejs/text";
import { useEffect, useRef } from "react";

type ScrambleTextProps = {
	text: string;
	className?: string;
	/** Scramble cursor characters. Defaults to "░▒▓█". */
	cursor?: string;
};

/**
 * Renders text with a scramble animation on mount.
 */
export function ScrambleText({ text, className, cursor = "░▒▓█" }: ScrambleTextProps) {
	const ref = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const scope = createScope({
			mediaQueries: {
				reduceMotion: "(prefers-reduced-motion)",
			},
		}).add((self) => {
			if (self?.matches.reduceMotion) return;

			animate(el, {
				ease: "linear",
				innerHTML: scrambleText({ cursor }),
			});
		});

		return () => {
			scope.revert();
		};
	}, [cursor]);

	return (
		<span className={className} ref={ref}>
			{text}
		</span>
	);
}
