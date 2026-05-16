import { animate } from "animejs";
import { scrambleText } from "animejs/text";
import { type ReactNode, useEffect, useRef } from "react";

export function ScrambleTitle({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const ref = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const anim = animate(el, {
			ease: "linear",
			innerHTML: scrambleText({
				cursor: "░▒▓█",
			}),
		});

		return () => {
			anim.revert();
		};
	}, []);

	return (
		<span ref={ref} className={className}>
			{children}
		</span>
	);
}
