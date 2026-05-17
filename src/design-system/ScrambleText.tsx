import { animate } from "animejs";
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
 *
 * Replaces ScrambleTitle, which only supported ReactNode children
 * and had no reduced-motion support.
 */
export function ScrambleText({ text, className, cursor = "░▒▓█" }: ScrambleTextProps) {
	const ref = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		if (
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			return;
		}

		const el = ref.current;
		if (!el) return;

		const anim = animate(el, {
			ease: "linear",
			innerHTML: scrambleText({ cursor }),
		});

		return () => {
			anim.revert();
		};
	}, [cursor]);

	return (
		<span className={className} ref={ref}>
			{text}
		</span>
	);
}
