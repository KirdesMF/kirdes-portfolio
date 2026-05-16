import { createFileRoute } from "@tanstack/react-router";
import { WorkPage } from "#/pages/Work";

export const Route = createFileRoute("/terminal/work/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <WorkPage />;
}
