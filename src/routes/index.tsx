import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createTimeline, stagger, steps } from "animejs";
import { useEffect } from "react";

const bootLines = ["initializing shell", "loading profile", "mounting terminal"] as const;

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();

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
					to: "/terminal",
				});
			},
		});
		tl.set("[data-boot-line]", { opacity: 0, translateY: 4 });
		tl.label("cursor");
		tl.label("lines", 400);
		tl.add(
			"[data-boot-line]",
			{ opacity: [0, 1], translateY: [4, 0] },
			stagger(300, { start: "lines" }),
		);
		tl.add(
			"[data-boot-cursor]",
			{
				duration: 500,
				opacity: [1, 0, 1],
				ease: steps(2),
				loop: 5,
			},
			"cursor",
		);

		return () => {
			tl.revert();
		};
	}, [navigate]);

	return (
		<div className="flex h-dvh items-center justify-center bg-background font-mono text-xs text-foreground">
			<div className="flex w-full max-w-md flex-col gap-2 rounded border border-border bg-background/80 p-4">
				<div className="mb-2 text-muted-foreground">kirdes terminal boot</div>
				{bootLines.map((text) => (
					<div className="flex gap-2" key={text}>
						<span className="text-primary">›</span>
						<span data-boot-line className="opacity-0">
							{text}
						</span>
					</div>
				))}
				<span data-boot-cursor className="text-primary">
					█
				</span>
			</div>
		</div>
	);
}
