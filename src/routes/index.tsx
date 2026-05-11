import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { animate, createTimeline, stagger } from "animejs";
import { useEffect, useRef } from "react";

const bootLines = ["initializing shell", "loading profile", "mounting terminal"] as const;

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const progressRef = useRef<HTMLDivElement>(null);
	const percentRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const tl = createTimeline({
			defaults: { ease: "out" },
			onComplete: () => {
				// Start progress bar animation after boot lines resolve
				const progressEl = progressRef.current;
				const percentEl = percentRef.current;
				if (!progressEl || !percentEl) return;

				animate(progressEl, {
					width: ["0%", "100%"],
					duration: 1500,
					ease: "inOut",
					onUpdate: () => {
						// progressEl width reflects current value, derive percentage from inline style
						const pct = Math.round(parseFloat(progressEl.style.width) || 0);
						percentEl.textContent = `${pct}%`;
					},
					onComplete: () => {
						percentEl.textContent = "100%";
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
			},
		});

		tl.set("[data-boot-line]", { opacity: 0, translateY: 4 });
		tl.label("lines", 400);
		tl.add(
			"[data-boot-line]",
			{ opacity: [0, 1], translateY: [4, 0] },
			stagger(300, { start: "lines" }),
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
				<div className="mt-2 flex items-center gap-2">
					<div className="h-4 flex-1 overflow-hidden rounded border border-border bg-background/60">
						<div ref={progressRef} className="h-full w-0 bg-primary/60" />
					</div>
					<span ref={percentRef} className="w-8 text-right tabular-nums text-muted-foreground">
						0%
					</span>
				</div>
			</div>
		</div>
	);
}
