import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terminal/contact")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-1 flex-col gap-3 p-4 text-xs">
			<div className="text-muted-foreground">── contacts ──</div>
			<div className="flex flex-col gap-2">
				<div className="flex gap-4">
					<span className="text-primary">twitter</span>
					<span>@kirdesmf</span>
				</div>
				<div className="flex gap-4">
					<span className="text-primary">email</span>
					<span>cedric@kirdes.dev</span>
				</div>
				<div className="flex gap-4">
					<span className="text-primary">github</span>
					<span>github.com/kirdesmf</span>
				</div>
			</div>
		</div>
	);
}
