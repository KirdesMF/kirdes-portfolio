import { animate, createScope } from "animejs";
import { type ReactNode, useEffect, useRef } from "react";

const shimmerClassName =
	"inline-block bg-linear-to-r from-status-open from-35% via-status-shimmer via-60% to-status-open to-55% bg-size-[200%_100%] bg-clip-text leading-none text-transparent";

export function ShimmerLabel({ children }: { children: ReactNode }) {
	const ref = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const el = ref.current;
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
		<span className={shimmerClassName} ref={ref}>
			{children}
		</span>
	);
}
