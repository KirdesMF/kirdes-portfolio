import { createFileRoute } from "@tanstack/react-router";
import { createTimeline, steps } from "animejs";
import { useEffect } from "react";
import { useScrambleRef } from "#/design-system/use-scramble-ref";

const bootLines = ["initializing shell", "loading profile", "mounting terminal"] as const;

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = Route.useNavigate();
	const rootRef = useScrambleRef<HTMLDivElement>({
		selector: "[data-boot-line]",
		staggerMs: 250,
	});

	useEffect(() => {
		const tl = createTimeline({
			defaults: { ease: "out" },
			onComplete: () => {
				navigate({
					replace: true,
					search: {
						activeFile: undefined,
						editor: undefined,
						files: [],
						panel: "terminal",
					},
					to: "/terminal/home",
				});
			},
		});
		tl.add(
			"[data-loading-bar]",

			{
				duration: 1500,
				scaleX: [0, 1],
				ease: steps(10),
			},
		);

		return () => {
			tl.revert();
		};
	}, [navigate]);

	return (
		<main className="flex h-dvh items-center justify-center bg-background font-mono text-xs text-foreground">
			<div
				ref={rootRef}
				className="flex w-full max-w-md flex-col gap-2 rounded border border-border bg-background/80 p-4"
			>
				<div className="mb-2 text-muted-foreground">kirdes terminal boot</div>

				{bootLines.map((text) => (
					<div className="flex gap-2" key={text}>
						<span className="text-primary">›</span>
						<span data-boot-line>{text}</span>
					</div>
				))}

				<div className="h-4 dot-pattern mt-4">
					<svg aria-hidden="true" width="100%" height="100%">
						<rect data-loading-bar width="100%" height="100%" className="fill-foreground" />
					</svg>
				</div>
			</div>
		</main>
	);
}
