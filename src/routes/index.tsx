import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createScope, createTimeline, stagger, steps } from "animejs";
import { useLayoutEffect, useState } from "react";
import { INTRO_LINES, IntroTranscript } from "#/intro/intro-content";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

const LINE_MS = 140;
const FINAL_PAUSE = 1200;

function RouteComponent() {
	const navigate = useNavigate();
	const [reduceMotion, setReduceMotion] = useState(false);

	useLayoutEffect(() => {
		const scope = createScope({
			mediaQueries: { reduceMotion: "(prefers-reduced-motion)" },
		}).add((self) => {
			setReduceMotion(self?.matches.reduceMotion ?? false);
		});
		return () => scope.revert();
	}, []);

	useLayoutEffect(() => {
		if (reduceMotion) {
			const t = setTimeout(() => navigate({ replace: true, to: "/home" }), 800);
			return () => clearTimeout(t);
		}

		const tl = createTimeline({
			defaults: { ease: steps(1) },
			onComplete: () => navigate({ replace: true, to: "/home" }),
		});

		tl.set("[data-intro-line]", { opacity: 0 }, 0);

		INTRO_LINES.forEach((_, index) => {
			tl.add(
				`[data-intro-line="${index}"]`,
				{ opacity: [0, 1], duration: 1, delay: stagger(0) },
				index * LINE_MS,
			);
		});

		tl.call(() => {}, (INTRO_LINES.length - 1) * LINE_MS + FINAL_PAUSE);

		return () => {
			tl.revert();
		};
	}, [reduceMotion, navigate]);

	return (
		<main className="relative flex h-dvh items-center justify-center bg-background p-8 font-mono text-foreground">
			<IntroTranscript skipAnimation={reduceMotion} />
			<button
				className="absolute right-4 bottom-4 text-muted-foreground/50 transition hover:text-foreground"
				type="button"
				onClick={() => navigate({ replace: true, to: "/home" })}
			>
				[skip intro]
			</button>
		</main>
	);
}
