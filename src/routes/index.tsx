import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const bootLines = ["initializing shell", "loading profile", "mounting terminal"] as const;

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const [visibleLineCount, setVisibleLineCount] = useState(1);

	useEffect(() => {
		const lineIntervalId: ReturnType<typeof setInterval> = setInterval(() => {
			setVisibleLineCount((current) => Math.min(current + 1, bootLines.length));
		}, 450);
		const navigationTimeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
			void navigate({ replace: true, search: { file: undefined }, to: "/terminal" });
		}, 1800);

		return () => {
			clearInterval(lineIntervalId);
			clearTimeout(navigationTimeoutId);
		};
	}, [navigate]);

	return (
		<div className="flex h-dvh items-center justify-center bg-background font-mono text-xs text-foreground">
			<div className="flex w-full max-w-md flex-col gap-2 rounded border border-border bg-background/80 p-4">
				<div className="text-muted-foreground">kirdes terminal boot</div>
				{bootLines.slice(0, visibleLineCount).map((line) => (
					<div className="flex gap-2" key={line}>
						<span className="text-primary">›</span>
						<span>{line}...</span>
					</div>
				))}
				<div className="text-primary">█</div>
			</div>
		</div>
	);
}
