import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-1 flex-col p-4 text-sm">
			<div className="flex items-center gap-2 text-muted-foreground">
				<span className="text-primary">~</span>
				<span>$</span>
				<span className="animate-pulse">_</span>
			</div>
		</div>
	);
}
