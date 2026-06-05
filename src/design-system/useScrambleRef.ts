import { animate, createScope, stagger } from "animejs";
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
 */
export function useScrambleRef<T extends HTMLElement>({
	selector,
	staggerMs = 75,
	cursor = "░▒▓█",
}: UseScrambleRefOptions) {
	const rootRef = useRef<T>(null);

	useEffect(() => {
		const scope = createScope({
			mediaQueries: {
				reduceMotion: "(prefers-reduced-motion)",
			},
		}).add((self) => {
			if (self?.matches.reduceMotion) return;

			const elements = rootRef.current?.querySelectorAll(selector);
			if (!elements || elements.length === 0) return;

			animate(elements, {
				ease: "linear",
				innerHTML: scrambleText({
					cursor,
					delay: stagger(staggerMs),
				}),
			});
		});

		return () => {
			scope.revert();
		};
	}, [selector, staggerMs, cursor]);

	return rootRef;
}
