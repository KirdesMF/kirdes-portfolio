import { animate, stagger } from "animejs";
import { scrambleText } from "animejs/text";
import { useEffect, useRef } from "react";

type UseScrambleRefOptions = {
	/** CSS selector for elements to scramble, scoped to ref container. */
	selector: string;
	/** Delay per element when multiple targets match. 0 = no stagger. */
	staggerMs?: number;
	/** Scramble cursor characters. */
	cursor?: string;
};

/**
 * Applies scramble animation to all elements matching `selector` within
 * the returned ref container. Cleans up on unmount.
 * Skips animation when user prefers reduced motion.
 */
export function useScrambleRef<T extends HTMLElement>({
	selector,
	staggerMs = 75,
	cursor = "░▒▓█",
}: UseScrambleRefOptions) {
	const rootRef = useRef<T>(null);

	useEffect(() => {
		if (
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			return;
		}

		const elements = rootRef.current?.querySelectorAll(selector);
		if (!elements || elements.length === 0) return;

		const anim = animate(elements, {
			ease: "linear",
			innerHTML: scrambleText({
				cursor,
				delay: stagger(staggerMs),
			}),
		});

		return () => {
			anim.revert();
		};
	}, [selector, staggerMs, cursor]);

	return rootRef;
}
