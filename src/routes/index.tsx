import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { animate, createScope, createTimeline, stagger, steps } from "animejs";
import { splitText } from "animejs/text";
import { useLayoutEffect, useState } from "react";
import { INTRO_COMMANDS, IntroTranscript } from "#/intro/intro-content";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

const CHAR_MS = 18;
const PAUSE_AFTER_TYPE = 120;
const PAUSE_AFTER_OUT = 250;
const FINAL_PAUSE = 1000;

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
			const t = setTimeout(() => navigate({ replace: true, to: "/start" }), 800);
			return () => clearTimeout(t);
		}

		const tl = createTimeline({
			defaults: { ease: "linear" },
			onComplete: () => navigate({ replace: true, to: "/start" }),
		});

		const charAnims: Array<ReturnType<typeof animate>> = [];
		const splitters: Array<ReturnType<typeof splitText>> = [];

		// Hide all entries at once
		tl.set("[data-intro-entry]", { opacity: 0 }, 0);

		// Show first entry wrapper immediately
		tl.add('[data-intro-entry="0"]', { opacity: 1, duration: 0 }, 0);
		tl.label("cmd-0", 0);

		for (let i = 0; i < INTRO_COMMANDS.length; i++) {
			const text = INTRO_COMMANDS[i];
			const typeDuration = text.length * CHAR_MS;
			const charStagger = typeDuration / text.length;

			// Show next entry wrapper at the previous reveal point
			if (i > 0) {
				const prevReveal = `reveal-${i - 1}`;
				tl.add(`[data-intro-entry="${i}"]`, { opacity: 1, duration: 0 }, prevReveal);
				tl.label(`cmd-${i}`, `${prevReveal}+=${PAUSE_AFTER_OUT}`);
			}

			// Split and animate chars
			const splitter = splitText(`[data-intro-cmd="${i}"]`, { chars: true });
			splitters.push(splitter);

			const charAnim = animate(splitter.chars, {
				opacity: [0, 1],
				duration: 1,
				ease: steps(1),
				delay: stagger(charStagger),
				autoplay: false,
			});
			charAnims.push(charAnim);
			tl.sync(charAnim, `cmd-${i}`);

			// Label reveal point, pop the output
			tl.label(`reveal-${i}`, `cmd-${i}+=${typeDuration + PAUSE_AFTER_TYPE}`);
			tl.add(
				`[data-intro-out="${i}"]`,
				{ opacity: [0, 1], duration: 1, ease: steps(1) },
				`reveal-${i}`,
			);
		}

		// Final pause before redirect
		tl.call(() => {}, `reveal-${INTRO_COMMANDS.length - 1}+=${FINAL_PAUSE}`);

		return () => {
			tl.revert();
			for (const a of charAnims) a.revert();
			for (const s of splitters) s.revert();
		};
	}, [reduceMotion, navigate]);

	return (
		<main className="relative flex h-dvh items-center justify-center bg-background font-mono text-xs text-foreground">
			<div className="w-full max-w-xl rounded border border-border bg-background/80 p-4">
				<IntroTranscript skipAnimation={reduceMotion} />
			</div>
			<button
				className="absolute right-4 bottom-4 text-muted-foreground/50 transition hover:text-foreground"
				type="button"
				onClick={() => navigate({ replace: true, to: "/start" })}
			>
				[skip intro]
			</button>
		</main>
	);
}
