import { createFileRoute } from "@tanstack/react-router";
import { animate, createScope, stagger } from "animejs";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/loading")({
	component: LoadingPlayground,
});

type LoaderVariantName =
	| "sweep"
	| "ring"
	| "scanner"
	| "expand"
	| "collapse"
	| "diagonal"
	| "diagonal-reverse"
	| "diagonal-cross"
	| "anti-diagonal"
	| "columns"
	| "cross"
	| "corners"
	| "random"
	| "rows-reverse"
	| "center-line"
	| "zipper"
	| "breathe"
	| "edges"
	| "snake"
	| "spiral"
	| "checker"
	| "split"
	| "frame-fill"
	| "top-bottom"
	| "wave"
	| "rain"
	| "matrix"
	| "hourglass"
	| "curtain"
	| "blink-wall"
	| "inward"
	| "signal";

type LoaderVariant = {
	description: string;
	name: string;
	order: ReadonlyArray<number>;
	variant: LoaderVariantName;
};

const cells = Array.from({ length: 9 }, (_, index) => index);
const loaderDuration = 900;

const loaderVariants: LoaderVariant[] = [
	{
		name: "pulse sweep",
		description: "One active square walks through the grid.",
		order: [0, 1, 2, 5, 8, 7, 6, 3, 4],
		variant: "sweep",
	},
	{
		name: "ring",
		description: "Outer ring loops around a quiet center.",
		order: [0, 1, 2, 7, 8, 3, 6, 5, 4],
		variant: "ring",
	},
	{
		name: "scanner",
		description: "Rows light up like a terminal scan.",
		order: [0, 0, 0, 1, 1, 1, 2, 2, 2],
		variant: "scanner",
	},
	{
		name: "reverse rows",
		description: "Rows scan upward from the bottom.",
		order: [2, 2, 2, 1, 1, 1, 0, 0, 0],
		variant: "rows-reverse",
	},
	{
		name: "expand",
		description: "Center pulse expands to corners.",
		order: [2, 1, 2, 1, 0, 1, 2, 1, 2],
		variant: "expand",
	},
	{
		name: "collapse",
		description: "Corners fold back into the center.",
		order: [0, 1, 0, 1, 2, 1, 0, 1, 0],
		variant: "collapse",
	},
	{
		name: "diagonal",
		description: "Diagonal bands move across the grid.",
		order: [0, 1, 2, 1, 2, 3, 2, 3, 4],
		variant: "diagonal",
	},
	{
		name: "anti diagonal",
		description: "Diagonal bands sweep from the other corner.",
		order: [2, 1, 0, 3, 2, 1, 4, 3, 2],
		variant: "anti-diagonal",
	},
	{
		name: "diagonal reverse",
		description: "Diagonal wave travels back toward the origin.",
		order: [4, 3, 2, 3, 2, 1, 2, 1, 0],
		variant: "diagonal-reverse",
	},
	{
		name: "diagonal cross",
		description: "Both diagonals pulse before the edges.",
		order: [0, 2, 0, 2, 0, 2, 0, 2, 0],
		variant: "diagonal-cross",
	},
	{
		name: "columns",
		description: "Columns rise and settle in sequence.",
		order: [0, 1, 2, 0, 1, 2, 0, 1, 2],
		variant: "columns",
	},
	{
		name: "cross",
		description: "Center line pulses before the corners.",
		order: [2, 0, 2, 0, 0, 0, 2, 0, 2],
		variant: "cross",
	},
	{
		name: "center line",
		description: "Middle row and column lock into focus.",
		order: [2, 0, 2, 0, 0, 0, 2, 0, 2],
		variant: "center-line",
	},
	{
		name: "corners",
		description: "Corners blink, then edges, then center.",
		order: [0, 1, 0, 1, 2, 1, 0, 1, 0],
		variant: "corners",
	},
	{
		name: "edges",
		description: "Edges fill before center and corners.",
		order: [2, 0, 2, 0, 1, 0, 2, 0, 2],
		variant: "edges",
	},
	{
		name: "zipper",
		description: "Left and right sides close inward.",
		order: [0, 2, 0, 0, 2, 0, 0, 2, 0],
		variant: "zipper",
	},
	{
		name: "breathe",
		description: "Whole grid breathes through staggered opacity.",
		order: [1, 1, 1, 1, 0, 1, 1, 1, 1],
		variant: "breathe",
	},
	{
		name: "snake",
		description: "A compact snake path flows through all cells.",
		order: [0, 1, 2, 5, 4, 3, 6, 7, 8],
		variant: "snake",
	},
	{
		name: "spiral",
		description: "Cells spiral inward to the center.",
		order: [0, 1, 2, 7, 8, 3, 6, 5, 4],
		variant: "spiral",
	},
	{
		name: "checker",
		description: "Checkerboard halves alternate.",
		order: [0, 1, 0, 1, 0, 1, 0, 1, 0],
		variant: "checker",
	},
	{
		name: "split",
		description: "Grid splits from the center column outward.",
		order: [1, 0, 1, 1, 0, 1, 1, 0, 1],
		variant: "split",
	},
	{
		name: "frame fill",
		description: "Frame lights first, center answers last.",
		order: [0, 0, 0, 0, 1, 0, 0, 0, 0],
		variant: "frame-fill",
	},
	{
		name: "top bottom",
		description: "Top and bottom rows pulse around the center.",
		order: [0, 0, 0, 1, 2, 1, 0, 0, 0],
		variant: "top-bottom",
	},
	{
		name: "wave",
		description: "A soft wave rolls across the grid.",
		order: [0, 1, 2, 0, 1, 2, 0, 1, 2],
		variant: "wave",
	},
	{
		name: "rain",
		description: "Columns drip downward in staggered beats.",
		order: [0, 2, 1, 1, 0, 2, 2, 1, 0],
		variant: "rain",
	},
	{
		name: "matrix",
		description: "Vertical streams cascade at different speeds.",
		order: [0, 3, 1, 1, 4, 2, 2, 5, 3],
		variant: "matrix",
	},
	{
		name: "hourglass",
		description: "Top and bottom converge through the center.",
		order: [0, 1, 0, 1, 2, 1, 0, 1, 0],
		variant: "hourglass",
	},
	{
		name: "curtain",
		description: "Rows drop like a compact terminal curtain.",
		order: [0, 0, 0, 1, 1, 1, 2, 2, 2],
		variant: "curtain",
	},
	{
		name: "blink wall",
		description: "A full wall blinks with offset cells.",
		order: [0, 2, 1, 2, 1, 0, 1, 0, 2],
		variant: "blink-wall",
	},
	{
		name: "inward",
		description: "Four sides pull attention into the middle.",
		order: [1, 0, 1, 0, 2, 0, 1, 0, 1],
		variant: "inward",
	},
	{
		name: "signal",
		description: "A signal climbs from low to high intensity.",
		order: [2, 2, 1, 2, 1, 0, 1, 0, 0],
		variant: "signal",
	},
	{
		name: "scramble",
		description: "A non-linear order for glitchy loading.",
		order: [4, 0, 7, 2, 5, 1, 8, 3, 6],
		variant: "random",
	},
];

function getAnimationConfig(variant: LoaderVariantName) {
	const base = {
		backgroundColor: ["transparent", "var(--color-primary)", "transparent"],
		duration: loaderDuration,
		loop: true,
		loopDelay: 0,
		opacity: [0.25, 1, 0.25],
	};

	if (variant === "scanner" || variant === "rows-reverse") {
		return {
			...base,
			delay: stagger(60, { use: "data-index" }),
			duration: loaderDuration,
			opacity: [0.18, 1, 0.18],
		};
	}

	if (variant === "expand") {
		return {
			...base,
			delay: stagger(85, { use: "data-index" }),
			duration: loaderDuration,
			opacity: [0.15, 1, 0.15],
		};
	}

	if (variant === "collapse") {
		return {
			...base,
			delay: stagger(85, { reversed: true, use: "data-index" }),
			duration: loaderDuration,
			opacity: [1, 0.15, 1],
		};
	}

	if (variant === "columns") {
		return {
			...base,
			delay: stagger(65, { use: "data-index" }),
			duration: loaderDuration,
			translateY: [0, -8, 0],
		};
	}

	if (variant === "cross" || variant === "center-line") {
		return {
			...base,
			delay: stagger(110, { use: "data-index" }),
			duration: loaderDuration,
			opacity: [0.12, 1, 0.12],
		};
	}

	if (variant === "corners" || variant === "edges") {
		return {
			...base,
			delay: stagger(60, { use: "data-index" }),
			duration: loaderDuration,
			opacity: [0.18, 1, 0.18],
		};
	}

	if (variant === "zipper") {
		return {
			...base,
			delay: stagger(55, { use: "data-index" }),
			duration: loaderDuration,
			opacity: [0.2, 1, 0.2],
			translateX: [0, 3, 0],
		};
	}

	if (variant === "breathe") {
		return {
			...base,
			delay: stagger(55, { use: "data-index" }),
			duration: loaderDuration,
			opacity: [0.2, 0.85, 0.2],
		};
	}

	if (variant === "random") {
		return {
			...base,
			delay: stagger(60, { use: "data-index" }),
			duration: loaderDuration,
			opacity: [0.2, 1, 0.2],
		};
	}

	if (variant === "diagonal" || variant === "anti-diagonal" || variant === "diagonal-reverse") {
		return {
			...base,
			delay: stagger(75, { use: "data-index" }),
			duration: loaderDuration,
			translateX: [0, 4, 0],
			translateY: [0, -4, 0],
		};
	}

	if (variant === "diagonal-cross" || variant === "checker" || variant === "frame-fill") {
		return {
			...base,
			delay: stagger(60, { use: "data-index" }),
			duration: loaderDuration,
			opacity: [0.14, 1, 0.14],
		};
	}

	if (variant === "spiral" || variant === "snake") {
		return {
			...base,
			delay: stagger(60, { use: "data-index" }),
			duration: loaderDuration,
			opacity: [0.18, 1, 0.18],
		};
	}

	if (variant === "split") {
		return {
			...base,
			delay: stagger(60, { use: "data-index" }),
			duration: loaderDuration,
			translateX: [0, 3, 0],
		};
	}

	if (variant === "top-bottom") {
		return {
			...base,
			delay: stagger(60, { use: "data-index" }),
			duration: loaderDuration,
			translateY: [0, -3, 0],
		};
	}

	if (variant === "wave") {
		return {
			...base,
			backgroundColor: [
				"transparent",
				"var(--color-primary)",
				"var(--color-muted-foreground)",
				"transparent",
			],
			delay: stagger(70, { use: "data-index" }),
			duration: loaderDuration,
			translateY: [0, -5, 0, 5, 0],
		};
	}

	if (variant === "rain" || variant === "matrix") {
		return {
			...base,
			delay: stagger(65, { use: "data-index" }),
			duration: loaderDuration,
			opacity: [0.08, 1, 0.08],
			translateY: [-6, 0, 6],
		};
	}

	if (variant === "hourglass" || variant === "inward") {
		return {
			...base,
			delay: stagger(85, { use: "data-index" }),
			duration: loaderDuration,
			opacity: [0.12, 1, 0.12],
		};
	}

	if (variant === "curtain") {
		return {
			...base,
			delay: stagger(80, { use: "data-index" }),
			duration: loaderDuration,
			translateY: [-5, 0, 5],
		};
	}

	if (variant === "blink-wall") {
		return {
			...base,
			backgroundColor: ["var(--color-primary)", "transparent", "var(--color-primary)"],
			delay: stagger(45, { use: "data-index" }),
			duration: loaderDuration,
			opacity: [1, 0.16, 1],
		};
	}

	if (variant === "signal") {
		return {
			...base,
			delay: stagger(75, { use: "data-index" }),
			duration: loaderDuration,
			opacity: [0.12, 0.45, 1, 0.45, 0.12],
			translateY: [4, 0, -4, 0, 4],
		};
	}

	return {
		...base,
		delay: stagger(65, { use: "data-index" }),
	};
}

function GridLoader({ loader }: { loader: LoaderVariant }) {
	const rootRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const scope = createScope({
			mediaQueries: { reduceMotion: "(prefers-reduced-motion: reduce)" },
			root: rootRef,
		}).add((self) => {
			if (self?.matches.reduceMotion) return;
			animate("[data-loader-cell]", getAnimationConfig(loader.variant));
		});

		return () => scope.revert();
	}, [loader.variant]);

	return (
		<div aria-hidden="true" className="grid grid-cols-3 gap-0" ref={rootRef}>
			{cells.map((cell) => (
				<span
					className="size-5 border-thin border-primary/40 bg-primary/15"
					data-index={loader.order[cell]}
					data-loader-cell=""
					key={cell}
				/>
			))}
		</div>
	);
}

function LoadingPlayground() {
	return (
		<main className="flex h-dvh flex-col bg-background p-6 font-mono text-foreground text-xs">
			<section className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-6">
				<header className="shrink-0 space-y-2 border-b-thin border-border pb-4">
					<p className="text-primary">/loading</p>
					<h1 className="font-normal text-muted-foreground uppercase tracking-[0.2em]">
						3x3 tui loader tests
					</h1>
					<p className="max-w-xl text-muted-foreground">
						Small square-grid loading states for testing a future intro replacement. Animations use
						Anime.js stagger order via <span className="text-foreground">data-index</span>.
					</p>
				</header>

				<div className="min-h-0 flex-1 overflow-y-auto pr-2 scrollbar-gutter-stable">
					<div className="grid gap-4 pb-6 sm:grid-cols-2 lg:grid-cols-3">
						{loaderVariants.map((loader) => (
							<article
								className="grid min-h-52 place-items-center gap-5 border-thin border-border bg-background/80 p-6"
								key={loader.variant}
							>
								<GridLoader loader={loader} />
								<div className="space-y-1 text-center">
									<h2 className="text-primary uppercase tracking-[0.18em]">{loader.name}</h2>
									<p className="text-muted-foreground">{loader.description}</p>
								</div>
							</article>
						))}
					</div>
				</div>
			</section>
		</main>
	);
}
