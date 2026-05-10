import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terminal/about")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-1 flex-col gap-3 p-4 text-xs">
			<div className="text-muted-foreground">── about ──</div>
			<div className="flex flex-col gap-1 text-muted-foreground">
				<p>product engineer / interface builder</p>
				<p className="mt-2">skills and description coming soon.</p>
			</div>
		</div>
	);
}
