import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createTimeline } from "animejs";
import { scrambleText } from "animejs/text";
import { useEffect, useRef } from "react";

const bootLines = ["initializing shell", "loading profile", "mounting terminal"] as const;

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const containerRef = useRef<HTMLDivElement>(null);
	const cursorRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const lines = container.querySelectorAll<HTMLElement>("[data-boot-line]");
		const cursor = cursorRef.current;

		const tl = createTimeline({
			defaults: { duration: 2000 },
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

		lines.forEach((line, index) => {
			tl.add(
				line,
				{
					modifier: scrambleText({
						text: bootLines[index],
						chars: "░▒▓█",
						cursor: "░▒▓█",
						revealRate: 50,
						settleDuration: 400,
					}) as unknown as (value: number) => string,
				},
				index === 0 ? 0 : "-=1200",
			);
		});

		if (cursor) {
			tl.add(
				cursor,
				{
					duration: 600,
					opacity: [1, 0],
					ease: "steps(2)",
					loop: true,
				},
				"-=200",
			);
		}

		return () => {
			tl.revert();
		};
	}, [navigate]);

	return (
		<div className="flex h-dvh items-center justify-center bg-background font-mono text-xs text-foreground">
			<div
				ref={containerRef}
				className="flex w-full max-w-md flex-col gap-2 rounded border border-border bg-background/80 p-4"
			>
				<div className="mb-2 text-muted-foreground">kirdes terminal boot</div>
				{bootLines.map((text) => (
					<div className="flex gap-2" key={text}>
						<span className="text-primary">›</span>
						<span data-boot-line />
					</div>
				))}
				<span ref={cursorRef} className="text-primary">
					█
				</span>
			</div>
		</div>
	);
}
