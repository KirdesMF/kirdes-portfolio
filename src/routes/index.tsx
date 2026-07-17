import { useHotkeys } from "@tanstack/react-hotkeys";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createScope, createTimeline, stagger, steps } from "animejs";
import { useLayoutEffect, useState } from "react";
import { INTRO_LINES } from "#/components/intro/intro.constants";
import { IntroTranscript } from "#/components/intro/intro-content";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

const LINE_MS = 140;
const FINAL_PAUSE = 1200;

function RouteComponent() {
	const router = useRouter();
	const [reduceMotion, setReduceMotion] = useState(false);

	function skipIntro() {
		void router.navigate({ replace: true, to: "/home" });
	}

	useHotkeys([{ hotkey: "Escape", callback: skipIntro }], {
		preventDefault: true,
	});

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
			const t = setTimeout(() => router.navigate({ replace: true, to: "/home" }), 800);
			return () => clearTimeout(t);
		}

		const tl = createTimeline({
			defaults: { ease: steps(1) },
			onComplete: () => router.navigate({ replace: true, to: "/home" }),
		});

		tl.set("[data-intro-line]", { opacity: 0 }, 0);

		INTRO_LINES.forEach((_, index) => {
			const at = index * LINE_MS;
			tl.add(
				`[data-intro-line="${index}"]`,
				{ opacity: [0, 1], duration: 1, delay: stagger(0) },
				at,
			);
		});

		tl.call(() => {}, (INTRO_LINES.length - 1) * LINE_MS + FINAL_PAUSE);

		return () => {
			tl.revert();
		};
	}, [reduceMotion, router]);

	return (
		<main className="relative flex h-dvh items-center justify-center bg-background p-8 font-mono text-foreground">
			<IntroTranscript skipAnimation={reduceMotion} />
			<div className="absolute right-4 bottom-4 flex flex-col items-end gap-1">
				<button
					aria-keyshortcuts="Escape"
					className="text-muted-foreground/50 transition hover:text-foreground"
					type="button"
					onClick={skipIntro}
				>
					[skip intro]
				</button>
				<p className="text-muted-foreground/40 text-tiny">press Esc to skip</p>
			</div>
		</main>
	);
}
