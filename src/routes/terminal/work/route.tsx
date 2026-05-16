import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/terminal/work")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
