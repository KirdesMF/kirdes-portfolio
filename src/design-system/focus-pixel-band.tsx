import { createScope, createTimeline } from "animejs";
import { useEffect, useRef } from "react";

const focusPixels = Array.from({ length: 5 }, (_, index) => index);

export function FocusPixelBand() {
	const rootRef = useRef<HTMLSpanElement | null>(null);
	const pixelRefs = useRef<Array<HTMLSpanElement | null>>([]);

	useEffect(() => {
		const scope = createScope({
			mediaQueries: { reduceMotion: "(prefers-reduced-motion: reduce)" },
			root: rootRef,
		}).add((self) => {
			if (self?.matches.reduceMotion) return;

			const max = focusPixels.length - 1;
			const steps = 8;
			const renderPeak = (peak: number) => {
				for (const pixel of focusPixels) {
					const node = pixelRefs.current[pixel];
					if (!node) continue;

					const distance = Math.abs(pixel - peak);
					node.style.opacity = String(Math.max(1 - distance * 0.62, 0.18));
				}
			};

			renderPeak(0);

			const timeline = createTimeline({ loop: true });

			for (let i = 0; i <= steps; i++) {
				const position = (i / steps) * max;
				timeline.call(() => renderPeak(position), i * 70);
			}
			for (let i = 1; i <= steps; i++) {
				const position = max - (i / steps) * max;
				timeline.call(() => renderPeak(position), (steps + i) * 70);
			}
		});

		return () => {
			scope.revert();
		};
	}, []);

	return (
		<span
			aria-hidden="true"
			className="absolute inset-y-0 start-0 grid w-1 grid-rows-5 gap-px opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100"
			ref={rootRef}
		>
			{focusPixels.map((pixel) => (
				<span
					className="bg-primary"
					key={pixel}
					ref={(node) => {
						pixelRefs.current[pixel] = node;
					}}
					style={{ opacity: pixel === 0 ? 1 : 0.18 }}
				/>
			))}
		</span>
	);
}
